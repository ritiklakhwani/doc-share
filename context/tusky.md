Tusky SDK
Tusky - TypeScript SDK for a complete file system on Walrus.
It includes end-to-end encryption, file management and access control.
The official client for Tusky API compatible with both Node.js and web browsers.


DISCLAIMER

Please note that this SDK is still under review, and we are planning an audit. The use of the SDK is at your own risk.
While we are working hard to ensure its stability and security, we recommend using it with caution at this stage.

Please note that changes to the API and interface may occur as we continue to iterate on the SDK. We advise you to keep an eye out for updates to stay informed of any changes.

By using the SDK, you're helping us improve, and we appreciate your support!


Usage
Import
Quick Start
Examples
Authentication
Sui wallet
Api key
Encryption
Full documentation
Usage
requires Node.js >= 18

yarn add @tusky-io/ts-sdk
npm install @tusky-io/ts-sdk
Import
node
import { Tusky } from "@tusky-io/ts-sdk"; // ES module
const { Tusky } = require("@tusky-io/ts-sdk"); // CommonJS
web
NOTE: SDK import defaults to node, to use it in browser environment:

import { Tusky } from "@tusky-io/ts-sdk/web";
Quick start
Init Tusky
import { Tusky } from "@tusky-io/ts-sdk";

// You can generate fresh api key here: https://app.tusky.io/account/api-keys

const tusky = new Tusky({ apiKey: "your-api-key" });
Upload file with Tusky
// first create a Tusky public vault
const { id: vaultId } = await tusky.vault.create("My public vault", { encrypted: false });

// upload file to the vault
const path = "/path/to/my/file.jpg";
const uploadId = await tusky.file.upload(vaultId, path);

// to create a private vault, the encryption context is required, you can learn more in Encryption paragraph
// await tusky.addEncrypter({ password: "your-account-password-here" });
// const { id: vaultId } = await tusky.vault.create("My private vault", { encrypted: true });
See more upload flows under file tests.

Download the file buffer
const fileBuffer = await tusky.file.arrayBuffer(uploadId);
Get the file metadata (blob id, etc.)
NOTE: upload id is the internal Tusky file identifier populated immediately during upload, while blob id is computed in an asynchronous manner while encoding & uploading the file to Walrus, hence the field may take some time to be populated.

(See file fields description here)

const fileMetadata = await tusky.file.get(uploadId);
console.log("File Walrus blob id: " + fileMetadata.blobId); // file reference off chain, computed deterministically from blob content
console.log("File Sui object id: " + fileMetadata.blobObjectId); // file reference on chain
List all user files
const files = await tusky.file.listAll();
Examples
See different app setups under examples.
See example flows under tests.
Authentication
use Sui Wallet
// on the browser
import { Tusky } from "@tusky-io/ts-sdk/web";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";

// Sui wallet extension
const account = useCurrentAccount();
const { mutate: signPersonalMessage } = useSignPersonalMessage();

const tusky = new Tusky({ wallet: { signPersonalMessage, account } });

// sign-in to Tusky (this will prompt the wallet & ask for user signature)
await tusky.auth.signIn();
// on the server
import { Tusky } from "@tusky-io/ts-sdk";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
// generate new Sui Key Pair
const keypair = new Ed25519Keypair();
const tusky = new Tusky({ wallet: { keypair } });

await tusky.auth.signIn();
use API key
import { Tusky } from "@tusky-io/ts-sdk";
const tusky = new Tusky({ apiKey: "your-api-key" });
clear current auth session
import { Tusky } from "@tusky-io/ts-sdk";
Tusky.signOut();
Encryption
All data within private vaults is end-to-end encrypted, you can learn more about encryption in Tusky from our docs.
The SDK provides two options for managing user keys:

Self hosted keys
Manage and store your encryption keys entirely on your own. This approach provides the highest level of control. However, it also requires you to securely store and back up your keys, as losing them will result in permanent loss of access to your encrypted data.

import { X25519KeyPair } from "@tusky-io/ts-sdk";

// generate fresh set of encryption keys
const keypair = new X25519KeyPair();

// configure Tusky encrypter with the generated keypair
await tusky.addEncrypter({ keypair: keypair });

// export private key from the keypair & store it securely
const privateKeyHex = await keypair.privateKeyHex();

// configure Tusky encrypter from the private key
await tusky.addEncrypter({ keypair: X25519KeyPair.fromPrivateKeyHex(privateKeyHex) });
Password protected keys
Your encryption keys are still generated on your device, ensuring they are never visible to our servers in an unencrypted form. However, for convenience, you can encrypt your keys with a password of your choice and store them securely on our servers. Only you can decrypt the keys using your password.

// this method will generate a fresh set of encryption keys
// encrypt it on the client with a kye derived from user password
// and save the encrypted set of keys on Tusky for easier retrieval
const { user, keypair } = await tusky.me.setupPassword("your-strong-password");

// configure Tusky encrypter with the newly generated keypair
await tusky.addEncrypter({ keypair });

// the next time you log in, you can simply do
await tusky.addEncrypter({ password: "your-strong-password" });
Password backup
In addition to your password, you can back up your keys using a 24-word backup phrase. If you lose your password, the backup phrase allows you to regain access to your encrypted data.

// this method will generate a fresh backup phrase
// retrieve your keys using the password
// re-encrypt the keys with a recovery key derived from a backup phrase
// and save the new encrypted set of keys on Tusky as a backup
const { backupPhrase } = await tusky.me.backupPassword(password);

// in case of password loss, you can reset the password using the backup phrase
await tusky.me.resetPassword(backupPhrase, newPassword);