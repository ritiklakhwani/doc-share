# Doc Share App - Minimal Structure & Pseudo Code

## Project Structure

```
doc-share/
├── backend/
│   ├── src/
│   │   ├── app.js           # Express app + all routes
│   │   ├── server.js        # Server startup
│   │   └── services.js      # Seal/Walrus integrations
│   ├── views/
│   │   ├── layout.ejs       # Base template
│   │   ├── admin.ejs        # Upload page (HTML + inline JS)
│   │   └── view.ejs         # Document access page (HTML + inline JS)
│   ├── public/
│   │   └── style.css        # All CSS styles
│   ├── package.json
│   └── .env
```

## Development Order
1. `server.js` → `app.js` → `services.js` → `layout.ejs` → `admin.ejs` → `view.ejs`

## File Pseudo Code

### `src/server.js`
```javascript
require('dotenv').config()
const app = require('./app')
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

### `src/app.js`
```javascript
const express = require('express')
const multer = require('multer')
const { encryptAndUpload, downloadAndDecrypt, verifyAccess } = require('./services')

const app = express()

// Setup
app.set('view engine', 'ejs')
app.set('views', './views')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const upload = multer({ dest: 'uploads/' })

// Routes
app.get('/', (req, res) => res.render('admin'))
app.get('/view/:shareId', (req, res) => res.render('view', { shareId: req.params.shareId }))

app.post('/upload', upload.single('document'), async (req, res) => {
  // Get file, wallet addresses from req.body
  // Call encryptAndUpload(file, walletAddresses)
  // Return shareId
})

app.post('/access', async (req, res) => {
  // Get shareId, walletAddress from req.body
  // Call verifyAccess(shareId, walletAddress)
  // If valid, call downloadAndDecrypt(shareId)
  // Return document or error
})

app.post('/verify-wallet', async (req, res) => {
  // Verify wallet signature
  // Return success/failure
})

module.exports = app
```

### `src/services.js`
```javascript
const { SealClient } = require('@mysten/seal')
const { WalrusClient } = require('@mysten/walrus')

const sealClient = new SealClient({ network: 'mainnet' })
const walrusClient = new WalrusClient({ network: 'mainnet' })

// In-memory storage for document metadata
const documents = new Map()

async function encryptAndUpload(file, walletAddresses) {
  // 1. Read file buffer
  // 2. Encrypt with Seal SDK for specified wallet addresses
  // 3. Upload encrypted data to Walrus
  // 4. Generate unique shareId
  // 5. Store metadata in documents Map
  // 6. Set cleanup timer (2 minutes)
  // 7. Return shareId
}

async function downloadAndDecrypt(shareId, walletAddress) {
  // 1. Get document metadata from documents Map
  // 2. Verify wallet address is in allowed list
  // 3. Download encrypted blob from Walrus
  // 4. Decrypt with Seal SDK
  // 5. Mark wallet as accessed
  // 6. Check if all users accessed - if yes, cleanup
  // 7. Return decrypted document
}

async function verifyAccess(shareId, walletAddress) {
  // 1. Check if document exists and not expired
  // 2. Check if wallet address is in allowed list
  // 3. Check if wallet hasn't already accessed
  // 4. Return true/false
}

function cleanupDocument(shareId) {
  // 1. Delete from Walrus storage
  // 2. Remove from documents Map
  // 3. Clear any timers
}

module.exports = { encryptAndUpload, downloadAndDecrypt, verifyAccess }
```

### `views/layout.ejs`
```html
<!DOCTYPE html>
<html>
<head>
  <title>Doc Share</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header>
    <h1>One-Time Doc Share</h1>
  </header>

  <main>
    <%- body %>
  </main>

  <script>
    // Common wallet connection functions
    async function connectWallet() {
      // Connect to Sui wallet
      // Return wallet address
    }

    async function signMessage(message) {
      // Sign message with wallet
      // Return signature
    }
  </script>
</body>
</html>
```

### `views/admin.ejs`
```html
<% layout('layout') -%>

<div id="admin-panel">
  <h2>Upload Document</h2>

  <div id="wallet-section">
    <button onclick="connectAdminWallet()">Connect Wallet</button>
    <span id="admin-wallet"></span>
  </div>

  <form id="upload-form" style="display:none">
    <input type="file" id="document" required>
    <textarea id="wallet-addresses" placeholder="Enter wallet addresses (one per line)" required></textarea>
    <button type="submit">Upload & Encrypt</button>
  </form>

  <div id="share-link" style="display:none">
    <h3>Share Link:</h3>
    <input type="text" id="link" readonly>
    <button onclick="copyLink()">Copy</button>
  </div>
</div>

<script>
  let adminWallet = null

  async function connectAdminWallet() {
    // Connect wallet
    // Show upload form
    // Store admin wallet address
  }

  document.getElementById('upload-form').onsubmit = async function(e) {
    e.preventDefault()

    // Get form data
    // Create FormData with file and wallet addresses
    // POST to /upload
    // Show share link
  }

  function copyLink() {
    // Copy share link to clipboard
  }
</script>
```

### `views/view.ejs`
```html
<% layout('layout') -%>

<div id="viewer">
  <h2>Access Document</h2>

  <div id="wallet-section">
    <button onclick="connectViewerWallet()">Connect Wallet to Access</button>
    <span id="viewer-wallet"></span>
  </div>

  <div id="document-viewer" style="display:none">
    <!-- Document content will be displayed here -->
  </div>

  <div id="error-message" style="display:none; color: red;">
    <!-- Error messages -->
  </div>
</div>

<script>
  const shareId = '<%= shareId %>'
  let viewerWallet = null

  async function connectViewerWallet() {
    // Connect wallet
    // Verify access with backend
    // If valid, download and display document
    // If invalid, show error
  }

  async function accessDocument() {
    // POST to /access with shareId and wallet address
    // Display document or show error
    // Handle auto-cleanup notification
  }
</script>
```

### `public/style.css`
```css
/* Basic styling for all pages */
body { font-family: Arial, sans-serif; margin: 40px; }
header { text-align: center; margin-bottom: 40px; }
button { padding: 10px 20px; margin: 10px; cursor: pointer; }
input, textarea { width: 100%; padding: 10px; margin: 10px 0; }
.hidden { display: none; }
.error { color: red; }
.success { color: green; }
```

### `.env`
```env
PORT=3000
NODE_ENV=development
SEAL_NETWORK=mainnet
WALRUS_NETWORK=mainnet
AUTO_DELETE_TIMEOUT=120000
```

## Setup Commands
```bash
npm init -y
npm install express ejs multer @mysten/seal @mysten/walrus dotenv
npm install -D nodemon
npm pkg set scripts.dev="nodemon src/server.js"
npm run dev
```