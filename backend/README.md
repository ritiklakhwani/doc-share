# Doc Share - One-Time Document Sharing

A secure document sharing application built with Express.js, EJS, and Walrus decentralized storage.

## Features

- One-time document access
- Decentralized storage via Walrus/Tusky
- Sui wallet integration
- Auto-cleanup after 2 minutes or full access
- Responsive design with glassmorphism UI

## Tech Stack

- **Backend**: Node.js, Express.js, EJS
- **Storage**: Walrus (via Tusky SDK)
- **Blockchain**: Sui Network
- **UI**: Feather Icons, Custom CSS
- **Deployment**: Vercel

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your TUSKY_API_KEY

# Start development server
npm run dev
```

## Environment Variables

```env
PORT=3000
NODE_ENV=development
AUTO_DELETE_TIMEOUT=120000
TUSKY_API_KEY=your-tusky-api-key-here
WALRUS_NETWORK=mainnet
```

## Deployment on Vercel

1. Push your code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

The project includes:
- `vercel.json` - Deployment configuration
- `.gitignore` - Git ignore rules
- Proper `package.json` setup

## Project Structure

```
backend/
├── src/
│   ├── server.js      # Express server
│   ├── app.js         # Routes and middleware
│   └── services.js    # Walrus integration
├── views/
│   ├── layout.ejs     # Base template
│   ├── admin.ejs      # Upload page
│   └── view.ejs       # Access page
├── public/
│   └── style.css      # Styles
├── package.json
├── vercel.json        # Vercel config
└── .env               # Environment variables
```

## API Endpoints

- `GET /` - Upload page
- `GET /view/:shareId` - Access page
- `POST /upload` - Upload document to Walrus
- `POST /access` - Verify wallet access
- `GET /download/:shareId` - Download document

## License

MIT