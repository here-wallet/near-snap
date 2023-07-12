import { NetworkId } from '@near-wallet-selector/core';
import { SignTransactionsParams } from './types';
import NearSnapProvider from './provider';

export class NearSnap {
  readonly id: string;

  readonly provider: NearSnapProvider;

  constructor(id = 'local:http://localhost:3000', provider?: NearSnapProvider) {
    this.provider = provider ?? new NearSnapProvider();
    this.id = id;
  }

  async isAvailable() {
    return await this.provider.isSnapsAvailable();
  }

  async isConnected() {
    const snap = await this.provider.getSnap(this.id);
    return Boolean(snap);
  }

  async install() {
    await this.provider.connectSnap(this.id);
  }

  async getAccount(network: NetworkId) {
    return await this.provider.invokeSnap<{
      accountId: string;
      publicKey: string;
    }>(this.id, 'near_getAccount', {
      network,
    });
  }

  async signTransactions(transactions: SignTransactionsParams) {
    return await this.provider.invokeSnap<([string, string] | null)[]>(
      this.id,
      'near_signTransactions',
      transactions,
    );
  }
}
