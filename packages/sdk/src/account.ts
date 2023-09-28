import crypto from 'crypto';
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

import { wait, waitTransactionResult } from './utils/waitTransaction';
import { convertAction } from './utils/convertAction';
import { createAction } from './utils/createAction';
import * as nep0413 from './utils/nep0413';

import { TransactionInListError, TransactionSignRejected } from './errors';
import { DelegatedTransaction, NearSnapStatus } from './types';
import NearSnap from './snap';
import {
  DelegateNotAllowed,
  DelegateProvderProtocol,
  DelegateRequestError,
  HEREDelegateProvider,
} from './delegate';

const nearProviders: Record<NetworkId, string> = {
  mainnet: 'https://rpc.mainnet.near.org',
  testnet: 'https://rpc.testnet.near.org',
};

class NearSnapAccount extends Account {
  readonly snap: NearSnap;

  readonly publicKey: PublicKey;

  readonly delegateProvider?: DelegateProvderProtocol;

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

  get network() {
    return this.connection.networkId as NetworkId;
  }

  async connect(contractId: string, methods: string[] = []) {
    return await this.snap.connect({
      network: this.network,
      contractId,
      methods,
    });
  }

  async disconnect() {
    return await this.snap.disconnect({
      network: this.network,
    });
  }

  async authenticate(recipient: string, message: string) {
    await this.activateIfNeeded();

    const nonce = crypto.randomBytes(32);
    const request = { message, recipient, nonce, network: this.network };
    const signed = await this.signMessage(request);

    const isVerified = nep0413.verifySignature(request, signed);
    if (!isVerified) {
      throw Error('Signature is incorrect');
    }

    const keys = await this.getAccessKeys();
    const isValid = keys.some((k) => {
      return (
        k.public_key === signed.publicKey &&
        k.access_key.permission === 'FullAccess'
      );
    });

    if (!isValid) {
      throw Error('Signer public key is not full access');
    }

    return signed;
  }

  async signMessage(data: nep0413.SignMessageOptionsNEP0413) {
    const signed = await this.snap.signMessage({
      message: data.message,
      nonce: Array.from(data.nonce),
      recipient: data.recipient,
      network: this.network,
    });

    if (!signed) {
      throw Error('Signed result is undefined');
    }

    const { accountId, publicKey, signature } = signed;
    if (!accountId || !publicKey || !signature) {
      throw Error('Signed result is undefined');
    }

    return { accountId, publicKey, signature };
  }

  protected async signTransaction(
    receiverId: string,
    actions: transactions.Action[],
  ): Promise<[Uint8Array, SignedTransaction]> {
    const access = await this.getLastNonce();
    const { total } = await this.getAccountBalance();
    const result = await this.snap.signTransactions({
      network: this.connection.networkId as NetworkId,
      hintBalance: total,
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

  async activateIfNeeded(askCount = 2): Promise<any> {
    // No need show it infinity, only 2 times
    if (askCount <= 0) {
      return null;
    }

    try {
      return await this.getLastNonce();
    } catch (e) {
      try {
        if (!this.delegateProvider) {
          throw Error();
        }

        // Try activate account by sponsor
        await this.delegateProvider.activateAccount(
          this.accountId,
          this.publicKey.toString(),
          this.network,
        );

        await wait(1000);
        return await this.activateIfNeeded(askCount - 1);
      } catch {
        await this.snap.needActivate(this.network);
        await wait(1000);
        return await this.activateIfNeeded(askCount - 1);
      }
    }
  }

  async getLastNonce() {
    const access = await this.connection.provider.query<
      { nonce: number } & QueryResponseKind
    >({
      request_type: 'view_access_key',
      public_key: this.publicKey.toString(),
      account_id: this.accountId,
      finality: 'final',
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

    const { total } = await this.getAccountBalance();
    const data = await this.snap.signDelegatedTransactions({
      payer,
      hintBalance: total,
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
    if (!this.delegateProvider) {
      throw new DelegateNotAllowed();
    }

    if (tx instanceof DelegateAction) {
      const network = this.connection.networkId;
      const allowed = await this.delegateProvider.isCanDelegate(tx, network);
      return { action: tx, allowed };
    }

    const access = await this.getLastNonce();
    const action = buildDelegateAction({
      actions: tx.actions.map(createAction),
      maxBlockHeight: new BN(access.block_height).add(new BN(100)),
      nonce: new BN(access.nonce).add(new BN(1)),
      publicKey: this.publicKey,
      senderId: this.accountId,
      receiverId: tx.receiverId,
    });

    const network = this.connection.networkId;
    const allowed = await this.delegateProvider.isCanDelegate(action, network);
    return { action, allowed };
  }

  async executeDelegate(tx: Omit<Transaction, 'signerId'> | DelegateAction) {
    if (!this.delegateProvider) {
      throw new DelegateNotAllowed();
    }

    await this.activateIfNeeded();
    const { action, allowed } = await this.buildDelegateAction(tx);
    if (!allowed) {
      const msg = `Delegated transaction is now allowed by ${this.delegateProvider.payer}. Try other DelegateProvider`;
      throw new DelegateNotAllowed(msg);
    }

    const delegate = await this.signedDelegate({
      payer: this.delegateProvider.payer,
      actions: action.actions,
      receiverId: tx.receiverId,
      blockHeightTtl: 100,
    });

    const { provider, networkId } = this.connection;
    const hash = await this.delegateProvider.sendDelegate(delegate, networkId);
    return await waitTransactionResult(hash, this.accountId, provider);
  }

  async executeTransaction(
    tx: Omit<Transaction, 'signerId'> & { disableDelegate?: boolean },
  ) {
    try {
      if (tx.disableDelegate) {
        throw new DelegateNotAllowed();
      }

      return await this.executeDelegate(tx);
    } catch (e) {
      if (
        e instanceof DelegateNotAllowed ||
        e instanceof DelegateRequestError
      ) {
        const result = await this.executeTransactions([tx]);
        return result[0];
      }

      throw e;
    }
  }

  async executeTransactions(
    trans: Omit<Transaction, 'signerId'>[],
  ): Promise<FinalExecutionOutcome[]> {
    await this.activateIfNeeded();
    const access = await this.getLastNonce();
    const { total } = await this.getAccountBalance();
    const signedList = await this.snap.signTransactions({
      hintBalance: total,
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

  static async restore({
    network,
    delegateProvider,
    snap = new NearSnap(),
  }: {
    network: NetworkId;
    delegateProvider?: DelegateProvderProtocol;
    snap?: NearSnap;
  }) {
    const account = await snap.getAccount(network).catch(() => null);
    if (!account?.accountId || !account?.publicKey) {
      return null;
    }

    const acc = new NearSnapAccount({
      publicKey: PublicKey.fromString(account.publicKey),
      accountId: account.accountId,
      delegateProvider,
      network,
      snap,
    });

    await acc.activateIfNeeded();
    return acc;
  }

  static async connect({
    snap = new NearSnap(),
    delegateProvider,
    contractId,
    methods,
    network,
  }: {
    delegateProvider?: DelegateProvderProtocol;
    contractId?: string;
    methods?: string[];
    network: NetworkId;
    snap: NearSnap;
  }) {
    const status = await snap.getStatus();
    if (status === NearSnapStatus.NOT_SUPPORTED) {
      throw Error('You need install Metamask no lower than version 11');
    }

    if (status === NearSnapStatus.NOT_INSTALLED) {
      await snap.install();
    }

    const account = await snap.connect({
      contractId,
      methods,
      network,
    });

    if (!account?.accountId) {
      throw Error('Metamask Near Snap did not return account id');
    }

    if (!account?.publicKey) {
      throw Error('Metamask Near Snap did not return public key');
    }

    const acc = new NearSnapAccount({
      delegateProvider,
      publicKey: PublicKey.fromString(account.publicKey),
      accountId: account.accountId,
      network,
      snap,
    });

    await acc.activateIfNeeded();
    return acc;
  }
}

export default NearSnapAccount;
