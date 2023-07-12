import { NetworkId, Transaction } from '@near-wallet-selector/core';
import { JsonRpcProvider } from 'near-api-js/lib/providers';
import {
  FinalExecutionOutcome,
  QueryResponseKind,
} from 'near-api-js/lib/providers/provider';
import { SignedTransaction } from 'near-api-js/lib/transaction';
import { PublicKey } from 'near-api-js/lib/utils';

import { TransactionInListError, TransactionSignRejected } from './errors';
import { AccountTarget, NearSnapStatus } from './types';
import NearSnap from './snap';

const nearProviders: Record<NetworkId, string> = {
  mainnet: 'https://rpc.mainnet.near.org',
  testnet: 'https://rpc.testnet.near.org',
};

class NearSnapAccount {
  readonly snap: NearSnap;

  readonly provider: JsonRpcProvider;

  readonly target: AccountTarget;

  constructor(snap: NearSnap, target: AccountTarget) {
    this.snap = snap;
    this.target = target;
    this.provider = new JsonRpcProvider({
      url: nearProviders[target.network],
    });
  }

  async signMessage() {
    // TODO
  }

  async signAndSendTransactions(
    transactions: Omit<Transaction, 'signerId'>[],
  ): Promise<FinalExecutionOutcome[]> {
    const access = await this.provider
      .query<{ nonce: number } & QueryResponseKind>({
        request_type: 'view_access_key',
        finality: 'final',
        account_id: this.target.accountId,
        public_key: this.target.publicKey.toString(),
      })
      .catch(async () => {
        const block = await this.provider.block({ finality: 'final' });
        return { nonce: 1, block_hash: block.header.hash };
      });

    const signedList = await this.snap.signTransactions({
      network: this.target.network,
      transactions: transactions.map((tx, i) => ({
        recentBlockHash: access.block_hash,
        nonce: access.nonce + i,
        ...tx,
      })),
    });

    if (signedList === null || signedList === undefined) {
      throw new TransactionSignRejected();
    }

    const result: FinalExecutionOutcome[] = [];
    signedList?.forEach((t: unknown, i: number) => {
      if (t === null || t === undefined) {
        throw new TransactionSignRejected(transactions[i]);
      }
    });

    try {
      for (const trx of signedList) {
        const signed = trx as unknown as string[];
        const bytes = SignedTransaction.decode(Buffer.from(signed[1], 'hex'));
        result.push(await this.provider.sendTransaction(bytes));
      }
    } catch (e) {
      throw new TransactionInListError(result, e);
    }

    return result;
  }

  static async connect(network: NetworkId, snap = new NearSnap()) {
    const status = await snap.getStatus();
    if (status === NearSnapStatus.NOT_SUPPORTED) {
      throw Error('You need install Metamask Flask');
    }

    if (status === NearSnapStatus.NOT_INSTALLED) {
      await snap.install();
    }

    const account = await snap.getAccount(network);
    if (!account?.accountId) {
      throw Error('Metamask Near Snap did not return account id');
    }

    if (!account?.publicKey) {
      throw Error('Metamask Near Snap did not return public key');
    }

    return new NearSnapAccount(snap, {
      publicKey: PublicKey.fromString(account.publicKey),
      accountId: account.accountId,
      network,
    });
  }
}

export default NearSnapAccount;
