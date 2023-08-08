import type { NetworkId } from '@near-wallet-selector/core';
import NearSnapProvider from './provider';
import {
  SignTransactionsParams,
  Maybe,
  NearSnapStatus,
  SignDelegatedTransactionsParams,
  SignMessageParams,
} from './types';
import { SignedMessageNEP0413 } from './utils/nep0413';

class NearSnap {
  readonly id: string;

  readonly provider: NearSnapProvider;

  constructor(options?: { id: string; provider?: NearSnapProvider }) {
    this.provider = options?.provider ?? new NearSnapProvider();
    this.id = options?.id ?? 'npm:@near-snap/plugin';
  }

  get isLocal() {
    return this.id.startsWith('local:');
  }

  async getStatus() {
    const isAvailable = await this.provider.isSnapsAvailable();
    if (!isAvailable) {
      return NearSnapStatus.NOT_SUPPORTED;
    }

    const snap = await this.provider.getSnap(this.id);
    return snap ? NearSnapStatus.INSTALLED : NearSnapStatus.NOT_INSTALLED;
  }

  async install() {
    await this.provider.connectSnap(this.id);
  }

  async getAccount(
    network: NetworkId,
  ): Promise<Maybe<{ accountId: string; publicKey: string }>> {
    return await this.provider.invokeSnap(this.id, 'near_getAccount', {
      network,
    });
  }

  async connect(data: {
    network: NetworkId;
    contractId?: string;
    methods?: string[];
  }): Promise<Maybe<{ accountId: string; publicKey: string }>> {
    return await this.provider.invokeSnap(this.id, 'near_connect', data);
  }

  async disconnect(data: { network: NetworkId }) {
    return await this.provider.invokeSnap(this.id, 'near_disconnect', data);
  }

  async getPermissions(network: NetworkId) {
    return await this.provider.invokeSnap(this.id, 'near_getPermissions', {
      network,
    });
  }

  async needActivate(network: NetworkId) {
    return await this.provider.invokeSnap(this.id, 'near_needActivate', {
      network,
    });
  }

  async signMessage(
    data: SignMessageParams,
  ): Promise<Maybe<SignedMessageNEP0413>> {
    return await this.provider.invokeSnap(this.id, 'near_signMessage', data);
  }

  async signDelegatedTransactions(
    transaction: SignDelegatedTransactionsParams,
  ): Promise<Maybe<{ signature: string; transaction: string }>> {
    return await this.provider.invokeSnap(
      this.id,
      'near_signDelegate',
      transaction,
    );
  }

  async signTransactions(
    transactions: SignTransactionsParams,
  ): Promise<Maybe<([string, string] | null)[]>> {
    return await this.provider.invokeSnap(
      this.id,
      'near_signTransactions',
      transactions,
    );
  }
}

export default NearSnap;
