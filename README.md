# NEAR Protocol Snap

View and sign transactions for NEAR Protocol blockchain.

**Created by BANYAN and HERE Wallet**


### Safe and secure. 

**The plugin does not have access to the Internet**, and also **does not return the private key** of your near account to a third-party application.
When you sign transactions, you see exactly what you are signing. **The plugin does not have access to your EVM keys.**

### Full transparency
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

