import {
  DeleteKeyAction,
  FunctionCallAction,
  TransferAction,
} from '@near-wallet-selector/core';

export type AddLimitedKeyAction = {
  type: 'AddKey';
  params: {
    publicKey: string;
    accessKey: {
      nonce?: number;
      permission: {
        receiverId: string;
        allowance?: string;
        methodNames?: string[];
      };
    };
  };
};

export type TransactionJson = {
  nonce: number;
  receiverId: string;
  recentBlockHash: string;
  actions: (
    | FunctionCallAction
    | AddLimitedKeyAction
    | TransferAction
    | DeleteKeyAction
  )[];
};

export type DelegateJson = {
  maxBlockHeight: number;
  publicKey: string;
  nonce: number;
  receiverId: string;
  senderId: string;
  actions: (
    | FunctionCallAction
    | AddLimitedKeyAction
    | TransferAction
    | DeleteKeyAction
  )[];
};

export type SignMessageParams = {
  network: NearNetwork;
  message: string;
  recipient: string;
  nonce: number[];
};

export type SignDelegatedTransactionParams = {
  network: NearNetwork;
  hintBalance?: string;
  delegateAction: DelegateJson;
  payer?: string;
};

export type SignTransactionsParams = {
  transactions: TransactionJson[];
  hintBalance?: string;
  network: NearNetwork;
};

export type NearNetwork = 'testnet' | 'mainnet';
