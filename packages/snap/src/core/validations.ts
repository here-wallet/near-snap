import { PublicKey } from '@near-js/crypto';
import {
  DeleteKeyAction,
  FunctionCallAction,
  TransferAction,
} from '@near-wallet-selector/core';
import {
  object,
  array,
  defaulted,
  Describe,
  enums,
  string,
  optional,
  number,
  define,
  assert,
  Struct,
  StructError,
  literal,
  union,
  any,
} from 'superstruct';

import {
  NearNetwork,
  SignTransactionsParams,
  TransactionJson,
  DelegateJson,
  SignDelegatedTransactionParams,
  SignMessageParams,
  AddLimitedKeyAction,
} from '../interfaces';

export const safeThrowable = (exec: () => void) => {
  try {
    exec();
    return true;
  } catch {
    return false;
  }
};

const ACCOUNT_ID_REGEX =
  /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/u;

export const accountId = () =>
  define<string>(
    'accountId',
    (value) =>
      typeof value === 'string' &&
      value.length >= 2 &&
      value.length <= 64 &&
      ACCOUNT_ID_REGEX.test(value),
  );

export const url = () =>
  define<string>('url', (value: any) => safeThrowable(() => new URL(value)));

export const publicKey = () =>
  define<string>('publicKey', (value: any) =>
    safeThrowable(() => PublicKey.fromString(value)),
  );

export const serializedBigInt = () =>
  define<string>('serializedBigInt', (value: any) =>
    safeThrowable(() => BigInt(value)),
  );

export const networkSchemaDefaulted: Describe<NearNetwork> = defaulted(
  enums(['testnet', 'mainnet']),
  () => 'testnet',
);

export const networkSchema: Describe<NearNetwork> = enums([
  'testnet',
  'mainnet',
]);

// @ts-expect-error idk why its wrong
const functionCallAction: Describe<FunctionCallAction> = object({
  type: literal('FunctionCall'),
  params: object({
    args: any(),
    deposit: serializedBigInt(),
    gas: serializedBigInt(),
    methodName: string(),
  }),
});

const transferAction: Describe<TransferAction> = object({
  type: literal('Transfer'),
  params: object({
    deposit: serializedBigInt(),
  }),
});

const addLimitedKeyAction: Describe<AddLimitedKeyAction> = object({
  type: literal('AddKey'),
  params: object({
    publicKey: publicKey(),
    accessKey: object({
      nonce: optional(number()),
      permission: object({
        receiverId: accountId(),
        allowance: optional(string()),
        methodNames: optional(array(string())),
      }),
    }),
  }),
});

const deleteKeyAction: Describe<DeleteKeyAction> = object({
  type: literal('DeleteKey'),
  params: object({
    publicKey: publicKey(),
  }),
});

const action = union([
  functionCallAction,
  transferAction,
  deleteKeyAction,
  addLimitedKeyAction,
]);

const transaction: Describe<TransactionJson> = object({
  recentBlockHash: string(),
  signerId: optional(accountId()),
  receiverId: accountId(),
  actions: array(action),
  nonce: number(),
});

const delegateAction: Describe<DelegateJson> = object({
  maxBlockHeight: number(),
  actions: array(action),
  publicKey: publicKey(),
  receiverId: accountId(),
  senderId: accountId(),
  nonce: number(),
});

export const signTransactionsSchema: Describe<SignTransactionsParams> = object({
  network: networkSchema,
  hintBalance: optional(serializedBigInt()),
  transactions: array(transaction),
});

export const signDelegateSchema: Describe<SignDelegatedTransactionParams> =
  object({
    delegateAction,
    network: networkSchema,
    hintBalance: optional(serializedBigInt()),
    payer: optional(string()),
  });

export const signMessageSchema: Describe<SignMessageParams> = object({
  message: string(),
  recipient: string(),
  nonce: array(number()),
  network: networkSchema,
});

export const validAccountSchema: Describe<{ network: NearNetwork }> = object({
  network: networkSchema,
});

export const connectWalletSchema: Describe<{
  methods?: string[];
  contractId?: string;
  network: NearNetwork;
}> = object({
  contractId: optional(accountId()),
  methods: optional(array(string())),
  network: networkSchema,
});

export class InputAssertError extends Error {}

// wrapper for superstruct assert function that throws a safe error to the external environment
export function inputAssert<T, S>(
  value: unknown,
  struct: Struct<T, S>,
  message?: string,
): asserts value is T {
  try {
    assert<T, S>(value, struct, message);
  } catch (e) {
    if (e instanceof StructError) {
      throw new InputAssertError(e.message);
    }

    throw e;
  }
}
