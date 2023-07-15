# Near Snap SDK

```ts
async function main() {
    const account = await NearSnapAccount.connect('mainnet')
    const result = await account.executeTransaction({
        receiverId: "herewallet.near",
        actions: [{ type: 'Transfer', params: { deposit: '1' }}]
    })

    console.log(result[0].transaction_outcome.id)
}
```

## Fully decomposable

It is possible to override the library at any level, this allows you to implement your own logic and cover it with tests

```ts
const rpc = new NearSnapProvider() // low-level, communicate with window.ethereum
const snap = new NearSnap('snap_id', rpc) // communicate with snap api
NearSnapAccount.connect('mainnet', snap) // communicate with snap api and near rpc
```


## Сompatible with near-api-js 

NearSnapAccount simply extends the default near-api-js account class. This allows you not to change your logic to support the Metamask wallet. For example:
```ts
const result = await account.sendMoney("friend.near", "100000")
```

## Сompatible with @near-wallet-selector
You can use the near-wallet-selector format for describing transactions. For example:

```ts
const result = await account.executeTransactions([{
    receiverId: "herewallet.near",
    actions: [{ type: 'Transfer', params: { deposit: '1' }}]
}])
```


## Support free transaction

HERE Wallet provides API for free delegated transactions. This is a very useful feature for new NEAR Protocol users, it allows you to sign a transaction with a completely empty account:

```ts
// if account.delegatedProvider.isCanDelegate return false this method throw DelegateNotAllowed
await account.executeDelegate({
    actions: [{ type: 'Transfer', params: { deposit: '1' }}],
    receiverId: "herewallet.near",
})

// Also executeTransaction method by default firstly try to use executeDelegate
await account.executeTransaction({
    disableDelegate: false, // default: false
    receiverId: "herewallet.near",
    actions: [{ type: 'Transfer', params: { deposit: '1' }}]
})
```

