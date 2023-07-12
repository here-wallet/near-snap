import { Action, NetworkId } from '@near-wallet-selector/core';
import { PublicKey } from 'near-api-js/lib/utils';

export type GetSnapsResponse = Record<string, Snap>;

export type Snap = {
  permissionName: string;
  id: string;
  version: string;
  initialPermissions: Record<string, unknown>;
};

export type TransactionJson = {
  receiverId: string;
  actions: Action[];
  nonce: number;
  recentBlockHash: string;
};

export type SignTransactionsParams = {
  transactions: TransactionJson[];
  network: NetworkId;
};

export type AccountTarget = {
  readonly network: NetworkId;
  readonly accountId: string;
  readonly publicKey: PublicKey;
};
