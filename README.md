# NEAR Protocol Snap

**View and sign transactions for NEAR Protocol blockchain.**

- you can create an account on NEAR Protocol with ed25519 key
- you can sign transactions on NEAR Protocol
- FT token transfers and token additions are visualized 
- you can export keys to a third-party wallet
- meta-transactions on NEAR Protocol are supported


https://github.com/here-wallet/near-snap/assets/41264338/4d2436c0-5952-4963-b78f-dcac7c3990e9


**Add Snap:** https://near-snap.surge.sh

🔄 Metamask doesn't automatically offer to install the new version, you need to do it manually:
1. Open metamask
2. Settings
3. Snaps
4. Select Near Snap
5. Remove

**Demo (testnet/mainnet):** https://near.github.io/wallet-selector/

### How it works:
The wallet-selector package uses the `@near-snap/sdk` library which interacts with `near-api-js` and the metamask snap rpc.

The `@near-snap/plugin` itself does not have internet access. The plugin only signs transactions and provides an interface for viewing actions signed by the user.

### ⚡️ Plugin features:
Limited access to a specific contract.
Method `near_connect(contractId, network, methods)` works in the same way as limited keys, that is, they allow you to send free transactions without annoying confirmations.

### ☑️ Details of what the user is signing.
List of transaction actions, confirmations of new permissions, additional information. Unfortunately at the moment snap-ui is not very rich, but we are doing our best to make the UI/UX of the plugin better for the user.

### 🤝 Support for delegated transactions.
And own infrastructure for new users. HERE Wallet allows metamask users (on the mainnet) to send gas free transactions without having funds on their account.

### 💰 Free account activation in mainnet and testnet.
For users, the HERE Wallet metamask automatically activates accounts so that later it will be possible to use delegated transactions to interact with dApps without having funds on the account. (In the future, we hope to involve the NEAR Foundation in this, as we believe this is an important part of onboarding new users to the network)



### 🔒 Safe and secure. 

**The plugin does not have access to the Internet**, and also **does not return the private key** of your near account to a third-party application.
When you sign transactions, you see exactly what you are signing. **The plugin does not have access to your EVM keys.**

### 👀 Full transparency
Thanks to the preview of incoming transactions, you know exactly what you are signing. Without your consent, **no third party application will receive your public key.**

### @near-snap/sdk

Interact with Near Snap using the js library, it's the easiest way to give Metamask users access to the world of NEAR Protocol

```ts
import { NearSnapAccount } from '@near-snap/sdk'

// Install snap and connect wallet
const account = await NearSnapAccount.connect('mainnet')

// @near-wallet-selector format of transactions
const results = await account.signAndSendTransactions([]) 
```

