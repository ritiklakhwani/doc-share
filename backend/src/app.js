const express = require('express')
const path = require('path')
const multer = require('multer')
const expressLayouts = require('express-ejs-layouts')
const { encryptAndUpload, downloadAndDecrypt, verifyAccess } = require('./services')

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'))
app.use(expressLayouts)
app.set('layout', 'layout')
app.use(express.static(path.join(__dirname, '../public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const upload = multer({ dest: '/tmp/uploads/' })

app.get('/', (req, res) => res.render('admin'))
app.get('/view/:token', (req, res) => res.render('view', { token: req.params.token }))

app.post('/upload', upload.single('document'), async (req, res) => {
  try {
    const file = req.file
    const emailAddresses = req.body.emailAddresses.split('\n').map(email => email.trim()).filter(email => email)

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = emailAddresses.filter(email => !emailRegex.test(email))
    if (invalidEmails.length > 0) {
      return res.json({ success: false, error: `Invalid email addresses: ${invalidEmails.join(', ')}` })
    }

    const result = await encryptAndUpload(file, emailAddresses)
    res.json({ success: true, shareId: result.shareId, magicLinks: result.magicLinks })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

app.post('/verify-access', async (req, res) => {
  try {
    const { token } = req.body
    const verification = await verifyAccess(token)
    res.json(verification)
  } catch (error) {
    res.json({ valid: false, error: error.message })
  }
})

app.get('/download/:token', async (req, res) => {
  try {
    const { token } = req.params
    const result = await downloadAndDecrypt(token)

    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`)
    res.setHeader('Content-Type', 'application/octet-stream')
    res.send(result.data)
  } catch (error) {
    res.status(404).send('File not found or access denied')
  }
})

module.exports = app