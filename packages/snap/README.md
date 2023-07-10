# NEAR Protocol Snap

View and sign transactions for NEAR Protocol blockhain network

## Get NEAR Account

```js
await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: defaultSnapOrigin,
    request: {
      method: 'near_getAccount',
      params: { network: 'mainnet' } // testnet
    },
  },
});

// Result
{ accountId: "e270b...c4dc6a", publicKey: "ed25519:GEvqvr..." }
```

## Sign transactions

```js
// Like wallet-selector format transactions
const transactions = [{
  nonce: 1000,
  recentBlockHash: 'block_hash',
  receiverId: 'herewallet.near',
  actions: [{
    type: 'FunctionCall',
    params: {
      methodName: 'method',
      args: { arg1: '123' },
      gas: 500000000,
      deposit: '3000000',
    },
  }]
}]

await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: defaultSnapOrigin,
    request: {
      method: 'near_signTransactions',
      params: { network: 'mainnet', transactions }
    }
  }
})

// Result, null if transaction was dined
[["txHash", "signedTrx_hex"], null, ["txHash", "signedTrx_hex"]]
```
