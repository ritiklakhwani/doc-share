const express = require('express')
const multer = require('multer')
 const expressLayouts = require('express-ejs-layouts')
const { encryptAndUpload, downloadAndDecrypt, verifyAccess } = require('./services')

const app = express()

// Setup
app.set('view engine', 'ejs')
app.set('views', './views')
app.use(expressLayouts)
app.set('layout', 'layout')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const upload = multer({ dest: 'uploads/' })

// Routes
app.get('/', (req, res) => res.render('admin'))
app.get('/view/:shareId', (req, res) => res.render('view', { shareId: req.params.shareId }))

app.post('/upload', upload.single('document'),
  async (req, res) => {
    try {
      const file = req.file
      const walletAddresses =
  req.body.walletAddresses.split('\n').map(addr =>
  addr.trim())

      const shareId = await encryptAndUpload(file,
  walletAddresses)

      res.json({ success: true, shareId })
    } catch (error) {
      res.json({ success: false, error: error.message
   })
    }
  })

app.post('/access', async (req, res) => {
    try {
      const { shareId, walletAddress } = req.body

      console.log('Access request:', shareId, walletAddress)

      if (!verifyAccess(shareId, walletAddress)) {
        return res.json({ success: false, error:'Access denied. Check your wallet address or document may have expired.' })
      }

      const result = await downloadAndDecrypt(shareId, walletAddress)

      res.json({
        success: true,
        fileName: result.fileName,
        message: 'Access granted'
      })
    } catch (error) {
      console.error('Access error:', error)
      res.json({ success: false, error: error.message})
    }
  })

  app.get('/download/:shareId', async (req, res) => {
    try {
      const { shareId } = req.params
      const { wallet } = req.query

      console.log('Download request:', shareId, wallet)

      const result = await downloadAndDecrypt(shareId, wallet)

      res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`)
      res.setHeader('Content-Type', 'application/octet-stream')
      res.send(result.data)
    } catch (error) {
      console.error('Download error:', error)
      res.status(404).send('File not found or access denied')
    }
  })

app.post('/verify-wallet', async (req, res) => {
  // Verify wallet signature
  // Return success/failure
})

module.exports = app