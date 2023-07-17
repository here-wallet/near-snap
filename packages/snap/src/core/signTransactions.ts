import * as transactions from 'near-api-js/lib/transaction';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { buildDelegateAction } from '@near-js/transactions';
import { PublicKey } from '@near-js/crypto';
import { BN } from 'bn.js';
import base58 from 'bs58';

import {
  SignDelegatedTransactionParams,
  SignTransactionsParams,
  TransactionJson,
} from '../interfaces';
import { createAction } from './createAction';
import { viewDelegate, viewTransactions } from './viewTransactions';
import { getPermissions } from './permissions';
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

const signTransaction = async (options: {
  tx: TransactionJson;
  accountId: string;
  signer: any;
  publicKey: PublicKey;
  network: string;
}): Promise<[string, string]> => {
  const { tx, accountId, signer, publicKey, network } = options;
  const transaction = transactions.createTransaction(
    accountId,
    publicKey,
    tx.receiverId,
    tx.nonce,
    tx.actions.map(createAction),
    base58.decode(tx.recentBlockHash),
  );

  const signedTransaction = await transactions.signTransaction(
    transaction,
    signer,
    accountId,
    network,
  );

  return [
    Buffer.from(signedTransaction[0]).toString('hex'),
    Buffer.from(signedTransaction[1].encode()).toString('hex'),
  ];
};

export async function signTransactions(
  origin: string,
  snap: SnapsGlobalObject,
  params: SignTransactionsParams,
): Promise<([string, string] | null)[]> {
  const signedTransactions: ([string, string] | null)[] = [];
  const { transactions: trxs, network } = params;
  const { signer, publicKey, accountId } = await getSigner(snap, network);

  if (trxs.length === 1 && trxs[0].actions.length === 1) {
    const { receiverId, actions } = trxs[0];
    const { type } = actions[0];

    if (type === 'FunctionCall' && actions[0].params.deposit === '0') {
      const { methodName } = actions[0].params;
      const permissions = await getPermissions({
        network: params.network,
        origin,
        snap,
      });

      const methods = permissions?.[receiverId];
      if (methods && (methods.length === 0 || methods.includes(methodName))) {
        const result = await signTransaction({
          tx: trxs[0],
          accountId,
          network,
          publicKey,
          signer,
        });

        return [result];
      }
    }
  }

  let index = 0;
  const dialogs = viewTransactions(origin, trxs, accountId, network);

  for (const tx of trxs) {
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

    signedTransactions.push(
      await signTransaction({
        accountId,
        network,
        publicKey,
        signer,
        tx,
      }),
    );
  }

  return signedTransactions;
}
