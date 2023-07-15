import {
  DelegateAction,
  SignedDelegate,
  buildDelegateAction,
} from '@near-js/transactions';
import { NetworkId, Transaction } from '@near-wallet-selector/core';
import { SignAndSendTransactionOptions } from 'near-api-js/lib/account';
import { Account, InMemorySigner, transactions } from 'near-api-js';
import { InMemoryKeyStore } from 'near-api-js/lib/key_stores';
import { JsonRpcProvider } from 'near-api-js/lib/providers';
import { base_decode } from 'near-api-js/lib/utils/serialize';
import { SignedTransaction } from 'near-api-js/lib/transaction';
import { KeyType } from 'near-api-js/lib/utils/key_pair';
import { PublicKey } from 'near-api-js/lib/utils';
import {
  FinalExecutionOutcome,
  QueryResponseKind,
} from 'near-api-js/lib/providers/provider';
import { BN } from 'bn.js';

import { waitTransactionResult } from './utils/waitTransaction';
import { convertAction } from './utils/convertAction';
import { createAction } from './utils/createAction';

import { TransactionInListError, TransactionSignRejected } from './errors';
import { DelegatedTransaction, NearSnapStatus } from './types';
import NearSnap from './snap';
import {
  DelegateNotAllowed,
  DelegateProvderProtocol,
  HEREDelegateProvider,
} from './delegate';

const nearProviders: Record<NetworkId, string> = {
  mainnet: 'https://rpc.mainnet.near.org',
  testnet: 'https://rpc.testnet.near.org',
};

class NearSnapAccount extends Account {
  readonly snap: NearSnap;

  readonly publicKey: PublicKey;

  readonly delegateProvider: DelegateProvderProtocol;

  constructor(options: {
    snap?: NearSnap;
    network: NetworkId;
    accountId: string;
    publicKey: PublicKey;
    delegateProvider?: DelegateProvderProtocol;
  }) {
    super(
      {
        networkId: options.network,
        jsvmAccountId: `jsvm.${options.network}`,
        signer: new InMemorySigner(new InMemoryKeyStore()),
        provider: new JsonRpcProvider({ url: nearProviders[options.network] }),
      },
      options.accountId,
    );

    this.publicKey = options.publicKey;
    this.snap = options.snap ?? new NearSnap();
    this.delegateProvider =
      options.delegateProvider ?? new HEREDelegateProvider();
  }

  async signMessage() {
    // TODO
  }

  protected async signTransaction(
    receiverId: string,
    actions: transactions.Action[],
  ): Promise<[Uint8Array, SignedTransaction]> {
    const access = await this.getLastNonce();
    const result = await this.snap.signTransactions({
      network: this.connection.networkId as NetworkId,
      transactions: [
        {
          recentBlockHash: access.block_hash,
          nonce: new BN(access.nonce).iaddn(1).toNumber(),
          actions: actions.map(convertAction),
          receiverId,
        },
      ],
    });

    if (!result?.[0]) {
      throw Error('Access denided');
    }

    return [
      base_decode(result[0][0]),
      SignedTransaction.decode(base_decode(result[0][1])),
    ];
  }

  async getLastNonce() {
    const access = await this.connection.provider
      .query<{ nonce: number } & QueryResponseKind>({
        request_type: 'view_access_key',
        public_key: this.publicKey.toString(),
        account_id: this.accountId,
        finality: 'final',
      })
      .catch(async () => {
        const r = await this.connection.provider.block({ finality: 'final' });
        return {
          block_height: r.header.height,
          block_hash: r.header.hash,
          nonce: 1,
        };
      });

    return access;
  }

  async signedDelegate({
    actions,
    blockHeightTtl,
    receiverId,
    payer,
  }: DelegatedTransaction & { payer?: string }): Promise<SignedDelegate> {
    const access = await this.getLastNonce();
    const action = buildDelegateAction({
      maxBlockHeight: new BN(access.block_height).add(new BN(blockHeightTtl)),
      nonce: new BN(access.nonce).add(new BN(1)),
      publicKey: this.publicKey,
      senderId: this.accountId,
      receiverId,
      actions,
    });

    const data = await this.snap.signDelegatedTransactions({
      payer,
      network: this.connection.networkId as NetworkId,
      delegateAction: {
        maxBlockHeight: action.maxBlockHeight.toString(),
        actions: action.actions.map(convertAction),
        publicKey: action.publicKey.toString(),
        nonce: action.nonce.toString(),
        receiverId: action.receiverId,
        senderId: action.senderId,
      },
    });

    if (!data?.signature || !data?.transaction) {
      throw Error('Access denied');
    }

    return {
      delegateAction: action,
      signature: {
        keyType: KeyType.ED25519,
        data: base_decode(data.signature),
      },
    };
  }

  async signAndSendTransaction({
    receiverId,
    actions,
  }: SignAndSendTransactionOptions): Promise<FinalExecutionOutcome> {
    const result = await this.executeTransactions([
      { actions: actions.map(convertAction), receiverId },
    ]);

    return result[0];
  }

  async buildDelegateAction(
    tx: Omit<Transaction, 'signerId'> | DelegateAction,
  ) {
    const access = await this.getLastNonce();
    if (tx instanceof DelegateAction) {
      const allowed = await this.delegateProvider.isCanDelegate(tx);
      return { action: tx, allowed };
    }

    const action = buildDelegateAction({
      actions: tx.actions.map(createAction),
      maxBlockHeight: new BN(access.block_height).add(new BN(100)),
      nonce: new BN(access.nonce).add(new BN(1)),
      publicKey: this.publicKey,
      senderId: this.accountId,
      receiverId: tx.receiverId,
    });

    const allowed = await this.delegateProvider.isCanDelegate(action);
    return { action, allowed };
  }

  async executeDelegate(tx: Omit<Transaction, 'signerId'> | DelegateAction) {
    const { action, allowed } = await this.buildDelegateAction(tx);
    if (allowed) {
      const msg = `Delegated transaction is now allowed by ${this.delegateProvider.payer}. Try other DelegateProvider`;
      throw new DelegateNotAllowed(msg);
    }

    const delegate = await this.signedDelegate({
      payer: this.delegateProvider.payer,
      actions: action.actions,
      receiverId: tx.receiverId,
      blockHeightTtl: 100,
    });

    const { provider } = this.connection;
    const hash = await this.delegateProvider.sendDelegate(delegate);
    return await waitTransactionResult(hash, this.accountId, provider);
  }

  async executeTransaction(
    tx: Omit<Transaction, 'signerId'> & { disableDelegate?: boolean },
  ) {
    if (tx.disableDelegate) {
      const result = await this.executeTransactions([tx]);
      return result[0];
    }

    try {
      return await this.executeDelegate(tx);
    } catch {
      const result = await this.executeTransactions([tx]);
      return result[0];
    }
  }

  async executeTransactions(
    trans: Omit<Transaction, 'signerId'>[],
  ): Promise<FinalExecutionOutcome[]> {
    const access = await this.getLastNonce();
    const signedList = await this.snap.signTransactions({
      network: this.connection.networkId as NetworkId,
      transactions: trans.map((tx, i) => ({
        nonce: new BN(access.nonce).iaddn(i + 1).toNumber(),
        recentBlockHash: access.block_hash,
        ...tx,
      })),
    });

    if (signedList === null || signedList === undefined) {
      throw new TransactionSignRejected();
    }

    const result: FinalExecutionOutcome[] = [];
    signedList?.forEach((t: unknown, i: number) => {
      if (t === null || t === undefined) {
        throw new TransactionSignRejected(trans[i]);
      }
    });

    try {
      for (const trx of signedList) {
        const signed = trx as unknown as string[];
        const bytes = SignedTransaction.decode(Buffer.from(signed[1], 'hex'));
        result.push(await this.connection.provider.sendTransaction(bytes));
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

    return new NearSnapAccount({
      publicKey: PublicKey.fromString(account.publicKey),
      accountId: account.accountId,
      network,
      snap,
    });
  }
}

export default NearSnapAccount;
