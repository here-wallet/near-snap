import {
  object,
  any,
  array,
  defaulted,
  Describe,
  enums,
  string,
  optional,
  number,
} from 'superstruct';

import {
  NearNetwork,
  SignTransactionsParams,
  TransactionJson,
  DelegateJson,
  SignDelegatedTransactionParams,
} from '../interfaces';

export const networkSchemaDefaulted: Describe<NearNetwork> = defaulted(
  enums(['testnet', 'mainnet']),
  () => 'testnet',
);

export const networkSchema: Describe<NearNetwork> = enums([
  'testnet',
  'mainnet',
]);

const transaction: Describe<TransactionJson> = object({
  receiverId: string(),
  actions: array(any()),
  nonce: number(),
  recentBlockHash: string(),
  signerId: optional(string()),
});

const delegateAction: Describe<DelegateJson> = object({
  maxBlockHeight: string(),
  actions: array(any()),
  publicKey: string(),
  nonce: string(),
  receiverId: string(),
  senderId: string(),
});

export const signTransactionsSchema: Describe<SignTransactionsParams> = object({
  network: networkSchema,
  transactions: array(transaction),
});

export const signDelegateSchema: Describe<SignDelegatedTransactionParams> =
  object({
    delegateAction,
    network: networkSchema,
    payer: optional(string()),
  });

export const validAccountSchema: Describe<{ network: NearNetwork }> = object({
  network: networkSchema,
});

export const connectWalletSchema: Describe<{
  methods?: string[];
  contractId?: string;
  network: NearNetwork;
}> = object({
  contractId: optional(string()),
  methods: optional(array(string())),
  network: networkSchema,
});
