import { Action, NetworkId } from '@near-wallet-selector/core';
import { PublicKey } from 'near-api-js/lib/utils';

export declare type Maybe<T> = Partial<T> | null | undefined;

export type GetSnapsResponse = Record<string, Snap>;

export enum NearSnapStatus {
  NOT_SUPPORTED,
  NOT_INSTALLED,
  INSTALLED,
}

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
