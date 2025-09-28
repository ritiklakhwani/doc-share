const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { Tusky } = require('@tusky-io/ts-sdk')

const tusky = new Tusky({
  apiKey: process.env.TUSKY_API_KEY,
  network: process.env.WALRUS_NETWORK || 'testnet'
})

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex')
const documents = new Map()


async function encryptAndUpload(file, emailAddresses) {
  try {
    const { id: vaultId } = await tusky.vault.create(`doc-share-${Date.now()}`, { encrypted: false })

    const uploadId = await tusky.file.upload(vaultId, file.path, {
      name: file.originalname
    })

    const shareId = uploadId

    // Generate unique tokens for each email
    const magicLinks = emailAddresses.map(email => {
      const token = jwt.sign(
        {
          shareId,
          email,
          exp: Math.floor(Date.now() / 1000) + (2 * 60) // 2 minutes expiry
        },
        JWT_SECRET
      )
      return {
        email,
        token,
        link: `${process.env.BASE_URL || 'http://localhost:3000'}/view/${token}`,
        accessed: false
      }
    })

    documents.set(shareId, {
      vaultId,
      uploadId,
      originalName: file.originalname,
      allowedEmails: emailAddresses,
      magicLinks,
      accessedBy: [],
      createdAt: Date.now()
    })

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path)
    }

    const timeoutMs = parseInt(process.env.AUTO_DELETE_TIMEOUT) || 120000
    setTimeout(() => cleanupDocument(shareId), timeoutMs)

    return { shareId, magicLinks }

  } catch (error) {
    throw new Error(`Failed to upload to Walrus: ${error.message}`)
  }
}

async function downloadAndDecrypt(token) {
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET)
    const { shareId, email } = decoded

    const doc = documents.get(shareId)
    if (!doc) throw new Error('Access link has expired and the data has been erased from the walrus database')

    // Find the specific magic link for this token
    const magicLink = doc.magicLinks.find(link => link.token === token)
    if (!magicLink) throw new Error('Invalid access token')

    if (magicLink.accessed) throw new Error('This link has already been used')

    // Mark as accessed
    magicLink.accessed = true
    if (!doc.accessedBy.includes(email)) {
      doc.accessedBy.push(email)
    }

    const fileBuffer = await tusky.file.arrayBuffer(shareId)

    // Check if all users have accessed the document
    if (doc.accessedBy.length === doc.allowedEmails.length) {
      setTimeout(() => cleanupDocument(shareId), 1000)
    }

    return {
      data: Buffer.from(fileBuffer),
      fileName: doc.originalName,
      email
    }

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access link has expired and the data has been erased from the walrus database')
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access link')
    }
    throw new Error(`Failed to download document: ${error.message}`)
  }
}

async function verifyAccess(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const { shareId, email } = decoded

    const doc = documents.get(shareId)
    if (!doc) return { valid: false, error: 'Access link has expired and the data has been erased from the walrus database' }

    const magicLink = doc.magicLinks.find(link => link.token === token)
    if (!magicLink) return { valid: false, error: 'Invalid access token' }

    if (magicLink.accessed) return { valid: false, error: 'This link has already been used' }

    return {
      valid: true,
      shareId,
      email,
      fileName: doc.originalName
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Access link has expired and the data has been erased from the walrus database' }
    }
    if (error.name === 'JsonWebTokenError') {
      return { valid: false, error: 'Invalid access link' }
    }
    return { valid: false, error: 'Access verification failed' }
  }
}

async function cleanupDocument(shareId) {
  try {
    const doc = documents.get(shareId)
    if (!doc) return

    try {
      await tusky.vault.delete(doc.vaultId)
    } catch (error) {
      // vault deletion failed, continue cleanup
    }

    documents.delete(shareId)
  } catch (error) {
    // cleanup failed silently
  }
}

module.exports = { encryptAndUpload, downloadAndDecrypt, verifyAccess }