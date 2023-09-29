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
  maxBlockHeight: number;
  actions: Action[];
  publicKey: string;
  nonce: number;
  receiverId: string;
  senderId: string;
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

export type ActionWithParams =
  | DeployContractAction
  | FunctionCallAction
  | TransferAction
  | StakeAction
  | DeleteKeyAction
  | DeleteAccountAction;
