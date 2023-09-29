import { Infer } from 'superstruct';
import {
  addKeyPermissionSchema,
  actionSchema,
  delegateActionSchema,
  signDelegateSchema,
  signMessageSchema,
  signTransactionsSchema,
  transactionSchema,
} from './core/validations';

export type AddKeyPermissionJson = Infer<typeof addKeyPermissionSchema>;

export type ActionJson = Infer<typeof actionSchema>;

export type TransactionJson = Infer<typeof transactionSchema>;

export type DelegateJson = Infer<typeof delegateActionSchema>;

export type SignMessageParams = Infer<typeof signMessageSchema>;

export type SignDelegatedTransactionParams = Infer<typeof signDelegateSchema>;

export type SignTransactionsParams = Infer<typeof signTransactionsSchema>;

export type NearNetwork = 'testnet' | 'mainnet';
