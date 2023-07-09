import { Buffer } from 'buffer';
import { transactions, InMemorySigner, utils } from 'near-api-js';
import { InMemoryKeyStore } from 'near-api-js/lib/key_stores';
import { SnapsGlobalObject } from '@metamask/snaps-types';

import { getKeyPair } from '../near/account';
import { SignTransactionsParams } from '../interfaces';
import { createAction } from '../utils/createAction';
import { showConfirmationDialog } from '../utils/confirmation';
import { messageCreator } from '../utils/messageCreator';
import { getAccount } from './getAccount';

// eslint-disable-next-line jsdoc/require-jsdoc
export async function signTransactions(
  snap: SnapsGlobalObject,
  params: SignTransactionsParams,
): Promise<[string, string][]> {
  const signedTransactions: [string, string][] = [];
  const { transactions: transactionsArray, network } = params;

  const keyPair = await getKeyPair(snap, network);
  const keystore = new InMemoryKeyStore();
  const { accountId } = await getAccount(snap, params.network);
  await keystore.setKey(network, accountId, keyPair);
  const signer = new InMemorySigner(keystore);

  const confirmation = await showConfirmationDialog(snap, {
    description: `It will be signed with address: ${accountId}`,
    prompt: `Do you want to sign this message${
      transactionsArray.length > 1 ? 's' : ''
    }?`,
    textAreaContent: messageCreator(transactionsArray),
  });

  if (!confirmation) {
    throw Error('Transaction not confirmed');
  }

  for (const transactionData of transactionsArray) {
    try {
      const transaction = transactions.createTransaction(
        accountId,
        keyPair.getPublicKey(),
        transactionData.receiverId,
        transactionData.nonce,
        transactionData.actions.map(createAction),
        utils.serialize.base_decode(transactionData.recentBlockHash),
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
