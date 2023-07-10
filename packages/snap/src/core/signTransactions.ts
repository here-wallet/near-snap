import { InMemoryKeyStore } from 'near-api-js/lib/key_stores';
import { InMemorySigner } from 'near-api-js/lib/signer';
import * as transactions from 'near-api-js/lib/transaction';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import base58 from 'bs58';

import { SignTransactionsParams } from '../interfaces';
import { createAction } from './createAction';
import { viewTransactions } from './viewTransactions';
import { getAccount, getKeyPair } from './getAccount';

export async function signTransactions(
  snap: SnapsGlobalObject,
  params: SignTransactionsParams,
): Promise<([string, string] | null)[]> {
  const signedTransactions: ([string, string] | null)[] = [];
  const { transactions: transactionsArray, network } = params;

  const keyPair = await getKeyPair(snap, network);
  const keystore = new InMemoryKeyStore();
  const { accountId } = await getAccount(snap, params.network);
  await keystore.setKey(network, accountId, keyPair);
  const signer = new InMemorySigner(keystore);

  const dialogs = viewTransactions(transactionsArray, accountId);
  let index = 0;

  for (const transactionData of transactionsArray) {
    try {
      const confirmation = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: dialogs[index],
        },
      });

      index += 1;
      if (!confirmation) {
        signedTransactions.push(null);
        continue;
      }

      const transaction = transactions.createTransaction(
        accountId,
        keyPair.getPublicKey(),
        transactionData.receiverId,
        transactionData.nonce,
        transactionData.actions.map(createAction),
        base58.decode(transactionData.recentBlockHash),
      );

      const signedTransaction = await transactions.signTransaction(
        transaction,
        signer,
        accountId,
        network,
      );

      signedTransactions.push([
        Buffer.from(signedTransaction[0]).toString('hex'),
        Buffer.from(signedTransaction[1].encode()).toString('hex'),
      ]);
    } catch (e) {
      throw new Error(
        `Failed to sign transaction because: ${(e as Error).message}`,
      );
    }
  }
  return signedTransactions;
}
