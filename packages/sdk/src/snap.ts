import { NetworkId } from '@near-wallet-selector/core';
import { SignTransactionsParams, Maybe, NearSnapStatus } from './types';
import NearSnapProvider from './provider';

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
