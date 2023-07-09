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
