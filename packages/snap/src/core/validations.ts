import { PublicKey } from '@near-js/crypto';
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
import { NearNetwork } from '../interfaces';

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

export const functionCallAction = object({
  type: literal('FunctionCall'),
  params: object({
    args: any(),
    deposit: serializedBigInt(),
    gas: serializedBigInt(),
    methodName: string(),
  }),
});

export const transferAction = object({
  type: literal('Transfer'),
  params: object({
    deposit: serializedBigInt(),
  }),
});

export const addKeyPermissionSchema = object({
  receiverId: accountId(),
  allowance: optional(string()),
  methodNames: optional(array(string())),
});

export const addLimitedKeyAction = object({
  type: literal('AddKey'),
  params: object({
    publicKey: publicKey(),
    accessKey: object({
      nonce: optional(serializedBigInt()),
      permission: addKeyPermissionSchema,
    }),
  }),
});

export const deleteKeyAction = object({
  type: literal('DeleteKey'),
  params: object({
    publicKey: publicKey(),
  }),
});

export const actionSchema = union([
  functionCallAction,
  transferAction,
  deleteKeyAction,
  addLimitedKeyAction,
]);

export const transactionSchema = object({
  recentBlockHash: string(),
  signerId: optional(accountId()),
  receiverId: accountId(),
  actions: array(actionSchema),
  nonce: serializedBigInt(),
});

export const delegateActionSchema = object({
  maxBlockHeight: serializedBigInt(),
  actions: array(actionSchema),
  publicKey: publicKey(),
  receiverId: accountId(),
  senderId: accountId(),
  nonce: serializedBigInt(),
});

export const signTransactionsSchema = object({
  network: networkSchema,
  hintBalance: optional(serializedBigInt()),
  transactions: array(transactionSchema),
});

export const signDelegateSchema = object({
  network: networkSchema,
  delegateAction: delegateActionSchema,
  hintBalance: optional(serializedBigInt()),
  payer: optional(string()),
});

export const signMessageSchema = object({
  message: string(),
  recipient: string(),
  nonce: array(number()),
  network: networkSchema,
});

export const validAccountSchema = object({
  network: networkSchema,
});

export const connectWalletSchema = object({
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
