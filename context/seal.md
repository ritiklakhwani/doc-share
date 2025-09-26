To integrate Seal with the TypeScript SDK in your project for encryption, decryption, and access control, here’s a practical step-by-step guide that can serve as a framework. This approach focuses on leveraging the Seal SDK client APIs while fitting into your app architecture:

***

## Step-by-Step Integration of Seal with TypeScript SDK

### 1. Install Seal SDK

```bash
npm install @mysten/seal
```

### 2. Initialize Seal Client

In your TypeScript project, create a Seal client instance that will interact with the Seal threshold encryption system and Sui blockchain access control.

```typescript
import { SealClient } from '@mysten/seal';

// Initialize Seal with configuration (network can be mainnet or testnet)
const sealClient = new SealClient({ network: 'mainnet' });
```

### 3. Encrypt Document Before Upload

- Obtain the plaintext document as a `Uint8Array` or `Buffer`.
- Define recipient identity (wallet address or unique ID).
- Call Seal to encrypt with the desired access policies.

```typescript
const recipientId = "0x123...";  // recipient’s wallet address or unique ID
const plainData = new TextEncoder().encode("Your confidential document content here");

const encryptedData = await sealClient.encrypt({
  data: plainData,
  recipients: [recipientId],
  maxAccesses: 1,          // limit accesses (optional)
  expiryTimestamp: Date.now() + 24*60*60*1000,  // optional: expire after 24 hours
});
```

### 4. Upload Encrypted Data to Walrus

- Use Walrus SDK (`@mysten/walrus`) to upload the encrypted blob.

```typescript
import { WalrusClient } from '@mysten/walrus';
const walrusClient = new WalrusClient({ network: 'mainnet' });

const blobId = await walrusClient.uploadBlob({ data: encryptedData });
console.log("Uploaded blob ID:", blobId);
```

### 5. Recipient Access & Decrypt

- Recipient authenticates (e.g., wallet signature).
- Request access keys from Seal SDK using recipient ID.
- Download encrypted blob from Walrus by `blobId`.
- Use Seal client SDK to decrypt locally:

```typescript
const encryptedBlob = await walrusClient.downloadBlob(blobId);

const decryptedData = await sealClient.decrypt({
  data: encryptedBlob,
  recipientId,         // the authenticated user's ID
});

const plainText = new TextDecoder().decode(decryptedData);
console.log("Decrypted document:", plainText);
```

### 6. Implement Access Control & Usage Tracking

- Seal’s backend contract and key management system will enforce policies like maxAccesses and expiry.
- Decryption keys are only released if the on-chain and off-chain policies allow it.
- Access attempts and usage can be logged on-chain or tracked off-chain per your architecture.

***

## Notes

- **Recipient IDs** must be consistent between encryption and decryption calls and correspond to authenticated user identities (wallet addresses preferred).
- Seal SDK handles all cryptographic and key management complexity; just use provided APIs.
- For a full application, integrate wallet authentication (MetaMask, Sui wallet) on client-side before decrypting.
- If you want an off-chain-only model, you'll have to manage key release and access tracking yourself as explained before.

***

If you want **example runnable code or starter templates** for your use case, I can prepare that too. This is the typical integration pattern to start with based on current Seal TS SDK capabilities.To integrate Seal using the TypeScript SDK, follow these core steps:

1. Install the SDK:
```bash
npm install @mysten/seal
```

2. Initialize the Seal client:
```typescript
import { SealClient } from '@mysten/seal';

const sealClient = new SealClient({ network: 'mainnet' });
```

3. Encrypt the document before upload, specifying recipient IDs (wallet addresses) and access policies:
```typescript
const encryptedData = await sealClient.encrypt({
  data: new TextEncoder().encode("Your confidential document"),
  recipients: ['0xWalletAddressHere'],
  maxAccesses: 1,               // optional: limit number of decryptions
  expiryTimestamp: Date.now() + 24 * 60 * 60 * 1000 // optional expiry timestamp
});
```

4. Upload the encrypted blob to Walrus storage using Walrus SDK:
```typescript
import { WalrusClient } from '@mysten/walrus';

const walrusClient = new WalrusClient({ network: 'mainnet' });

const blobId = await walrusClient.uploadBlob({ data: encryptedData });
console.log('Uploaded blob ID:', blobId);
```

5. On the recipient side, given authentication, download the encrypted blob and decrypt locally:
```typescript
const encryptedBlob = await walrusClient.downloadBlob(blobId);

const decryptedData = await sealClient.decrypt({
  data: encryptedBlob,
  recipientId: '0xWalletAddressHere'
});

const plainText = new TextDecoder().decode(decryptedData);
console.log('Decrypted:', plainText);
```

6. Access control (max access, expiry) is enforced by Seal’s key management and on-chain contracts, releasing decryption keys only if policy conditions are met.

This flow handles secure encryption, decentralized storage, and local decryption with robust access policies. Wallet addresses are used as recipient IDs. Seal SDK abstracts cryptographic complexity for you.

If you want, I can help prepare working code templates for your project. This pattern is the recommended integration method given current Seal SDK capabilities.