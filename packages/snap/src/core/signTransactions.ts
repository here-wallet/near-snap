import * as transactions from 'near-api-js/lib/transaction';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { buildDelegateAction } from '@near-js/transactions';
import { PublicKey } from '@near-js/crypto';
import { BN } from 'bn.js';
import base58 from 'bs58';

import {
  SignDelegatedTransactionParams,
  SignTransactionsParams,
} from '../interfaces';
import { createAction } from './createAction';
import { viewDelegate, viewTransactions } from './viewTransactions';
import { getSigner } from './getAccount';

export async function signDelegatedTransaction(
  origin: string,
  snap: SnapsGlobalObject,
  params: SignDelegatedTransactionParams,
) {
  const { delegateAction: action, payer, network } = params;
  const { signer, accountId } = await getSigner(snap, network);

  const dialogs = viewDelegate({ origin, action, accountId, network, payer });
  const confirmation = await snap.request({
    method: 'snap_dialog',
    params: { type: 'confirmation', content: dialogs },
  });

  if (!confirmation) {
    throw Error('Access denied');
  }

  const senderId = action.senderId ?? accountId;
  const delegateAction = buildDelegateAction({
    actions: action.actions.map(createAction),
    maxBlockHeight: new BN(action.maxBlockHeight),
    nonce: new BN(action.nonce),
    publicKey: PublicKey.fromString(action.publicKey),
    receiverId: action.receiverId,
    senderId,
  });

  const message = transactions.encodeDelegateAction(delegateAction);
  const signature = await signer.signMessage(message, senderId, network);

  return {
    transaction: Buffer.from(message).toString('base64'),
    signature: base58.encode(signature.signature),
  };
}

export async function signTransactions(
  origin: string,
  snap: SnapsGlobalObject,
  params: SignTransactionsParams,
): Promise<([string, string] | null)[]> {
  const signedTransactions: ([string, string] | null)[] = [];
  const { transactions: transactionsArray, network } = params;
  const { signer, publicKey, accountId } = await getSigner(snap, network);
  const dialogs = viewTransactions(
    origin,
    transactionsArray,
    accountId,
    network,
  );

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
        publicKey,
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
