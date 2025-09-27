// services.js - No encryption, just file storage
const fs = require('fs')
const path = require('path')

// In-memory storage for document metadata
const documents = new Map()


async function encryptAndUpload(file, walletAddresses) {
// 1. Generate unique shareId
  const shareId = Math.random().toString(36).slice(2, 11)
  // 2. Move file to permanent location
  const fileName = `${shareId}_${file.originalname}`
  const filePath = path.join('uploads', fileName)
  fs.renameSync(file.path, filePath)

  // 3. Store metadata
  documents.set(shareId, {
    filePath,
    originalName: file.originalname,
    allowedWallets: walletAddresses,
    accessedBy: [],
    createdAt: Date.now()
  })

  // 4. Set cleanup timer (2 minutes)
  setTimeout(() => cleanupDocument(shareId), 120000)
  return shareId
}

async function downloadAndDecrypt(shareId, walletAddress) {
    const doc = documents.get(shareId)
    if (!doc) throw new Error('Document not found')

    // Check access
    if (!doc.allowedWallets.includes(walletAddress)) {
      throw new Error('Access denied')
    }

    // Mark as accessed
    doc.accessedBy.push(walletAddress)

    // Read file
    const fileBuffer = fs.readFileSync(doc.filePath)

    // Check if all users accessed - cleanup
    if (doc.accessedBy.length === doc.allowedWallets.length) {
      cleanupDocument(shareId)
    }

    return {
      data: fileBuffer,
      fileName: doc.originalName
    }
  }

async function verifyAccess(shareId, walletAddress) {
  const doc = documents.get(shareId)
    if (!doc) return false
    if (!doc.allowedWallets.includes(walletAddress)) return false
    if (doc.accessedBy.includes(walletAddress)) return false
    return true
}

function cleanupDocument(shareId) {
  const doc = documents.get(shareId)
    if (doc) {
      // Delete physical file
      if (fs.existsSync(doc.filePath)) {
        fs.unlinkSync(doc.filePath)
      }
      // Remove from memory
      documents.delete(shareId)
    }
}

module.exports = { encryptAndUpload, downloadAndDecrypt, verifyAccess }