const fs = require('fs')
const path = require('path')
const { Tusky } = require('@tusky-io/ts-sdk')

const tusky = new Tusky({
  apiKey: process.env.TUSKY_API_KEY,
  network: process.env.WALRUS_NETWORK || 'testnet'
})

const documents = new Map()


async function encryptAndUpload(file, walletAddresses) {
  try {
    const { id: vaultId } = await tusky.vault.create(`doc-share-${Date.now()}`, { encrypted: false })

    const uploadId = await tusky.file.upload(vaultId, file.path, {
      name: file.originalname
    })

    const shareId = uploadId

    documents.set(shareId, {
      vaultId,
      uploadId,
      originalName: file.originalname,
      allowedWallets: walletAddresses,
      accessedBy: [],
      createdAt: Date.now()
    })

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path)
    }

    const timeoutMs = parseInt(process.env.AUTO_DELETE_TIMEOUT) || 120000
    setTimeout(() => cleanupDocument(shareId), timeoutMs)

    return shareId

  } catch (error) {
    throw new Error(`Failed to upload to Walrus: ${error.message}`)
  }
}

async function downloadAndDecrypt(shareId, walletAddress) {
  try {
    const doc = documents.get(shareId)
    if (!doc) throw new Error('Document not found')

    if (!doc.allowedWallets.includes(walletAddress)) {
      throw new Error('Access denied')
    }

    if (!doc.accessedBy.includes(walletAddress)) {
      doc.accessedBy.push(walletAddress)
    }

    const fileBuffer = await tusky.file.arrayBuffer(shareId)

    if (doc.accessedBy.length === doc.allowedWallets.length) {
      setTimeout(() => cleanupDocument(shareId), 1000)
    }

    return {
      data: Buffer.from(fileBuffer),
      fileName: doc.originalName
    }

  } catch (error) {
    throw new Error(`Failed to download document: ${error.message}`)
  }
}

async function verifyAccess(shareId, walletAddress) {
  const doc = documents.get(shareId)
  if (!doc) return false
  if (!doc.allowedWallets.includes(walletAddress)) return false
  if (doc.accessedBy.includes(walletAddress)) return false
  return true
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