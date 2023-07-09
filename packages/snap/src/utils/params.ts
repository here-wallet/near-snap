import {
  object,
  any,
  array,
  defaulted,
  Describe,
  enums,
  string,
  number,
} from 'superstruct';

import {
  NearNetwork,
  SignTransactionsParams,
  TransactionJson,
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
});

export const signTransactionsSchema: Describe<SignTransactionsParams> = object({
  network: networkSchema,
  transactions: array(transaction),
});

export const validAccountSchema: Describe<{ network: NearNetwork }> = object({
  network: networkSchema,
});
