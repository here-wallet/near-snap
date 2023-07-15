import {
  Action,
  DeleteAccountAction,
  DeleteKeyAction,
  DeployContractAction,
  FunctionCallAction,
  StakeAction,
  TransferAction,
} from '@near-wallet-selector/core';

export type TransactionJson = {
  receiverId: string;
  actions: Action[];
  nonce: number;
  recentBlockHash: string;
};

export type DelegateJson = {
  maxBlockHeight: string;
  actions: Action[];
  publicKey: string;
  nonce: string;
  receiverId: string;
  senderId: string;
};

export type SignDelegatedTransactionParams = {
  network: NearNetwork;
  delegateAction: DelegateJson;
  payer?: string;
};

export type SignTransactionsParams = {
  transactions: TransactionJson[];
  network: NearNetwork;
};

export type NearNetwork = 'testnet' | 'mainnet';

export type ActionWithParams =
  | DeployContractAction
  | FunctionCallAction
  | TransferAction
  | StakeAction
  | DeleteKeyAction
  | DeleteAccountAction;
