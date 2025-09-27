const fs = require('fs')
const path = require('path')

// Ensure uploads directory exists in Vercel's tmp filesystem
const uploadsDir = '/tmp/uploads'
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const app = require('../src/app')

module.exports = app