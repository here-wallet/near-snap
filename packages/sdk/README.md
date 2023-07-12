# Near Snap SDK

```ts
async function main() {
    const account = await NearSnapAccount.connect('mainnet')

    // throws TransactionSignRejected or TransactionInListError
    const result = await account.signAndSendTransactions([{
        receiverId: "herewallet.near",
        actions: [{ type: 'Transfer', params: { deposit: '1' }}]
    }])

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
