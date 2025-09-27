# Doc Share - Secure One-Time Document Sharing

## The Problem

Traditional document sharing platforms have critical security flaws:
- Documents persist indefinitely on centralized servers
- No guarantee of automatic deletion after access
- Lack of granular access control per document
- Centralized storage creates single points of failure
- No cryptographic proof of access permissions

## Our Solution

A decentralized document sharing platform built on **Walrus** that ensures:
- **One-time access**: Documents automatically delete after all authorized users access them
- **Time-based expiry**: Files vanish after 2 minutes regardless of access
- **Wallet-based permissions**: Only specified Sui wallet addresses can access documents
- **Decentralized storage**: Files stored on Walrus network, not centralized servers
- **Zero persistence**: No long-term storage, complete privacy

## How It Works

### Upload Flow
1. Connect Sui wallet and upload document
2. Specify authorized wallet addresses
3. File uploads to Walrus decentralized storage via Tusky SDK
4. Receive shareable link with unique Walrus identifier

### Access Flow
1. Recipients connect their Sui wallet
2. System verifies wallet address against permissions
3. Authorized users can download once from Walrus
4. Document auto-deletes when all users access OR after 2 minutes

## Tech Stack

- **Storage**: Walrus Protocol (decentralized)
- **SDK**: Tusky for Walrus integration
- **Blockchain**: Sui Network for wallet authentication
- **Backend**: Node.js + Express
- **Frontend**: EJS with Feather icons

## Key Features

- Wallet-gated access control
- Automatic cleanup (time + access based)
- Decentralized storage on Walrus
- One-time download guarantee
- No data persistence
- Clean, responsive UI

## Use Cases

- Sensitive document sharing between specific parties
- Legal document exchange with automatic deletion
- Temporary file sharing for teams
- Confidential information distribution
- Time-sensitive document access

