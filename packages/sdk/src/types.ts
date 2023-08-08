import type { Action, NetworkId } from '@near-wallet-selector/core';
import { transactions } from 'near-api-js';

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

export type DelegatedTransaction = {
  actions: transactions.Action[];
  blockHeightTtl: number;
  receiverId: string;
};

export type SignTransactionsParams = {
  transactions: TransactionJson[];
  hintBalance: string;
  network: NetworkId;
};

export type SignMessageParams = {
  network: NetworkId;
  message: string;
  recipient: string;
  nonce: number[];
};

export type SignDelegatedTransactionsParams = {
  payer?: string;
  network: NetworkId;
  hintBalance?: string;
  delegateAction: {
    maxBlockHeight: string;
    actions: Action[];
    publicKey: string;
    nonce: string;
    receiverId: string;
    senderId: string;
  };
};
