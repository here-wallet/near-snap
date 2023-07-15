import type {
  FinalExecutionOutcome,
  Transaction,
} from '@near-wallet-selector/core';

export class TransactionSignRejected extends Error {
  readonly name = 'TransactionSignRejected';

  readonly trx?: Omit<Transaction, 'signerId'>;

  constructor(trx?: Omit<Transaction, 'signerId'>) {
    super('Transaction was rejected by Metamask user');
    this.trx = trx;
  }
}

export class TransactionInListError extends Error {
  readonly name = 'ListOfTransactionsError';

  readonly completed: FinalExecutionOutcome[];

  readonly reason: unknown;

  constructor(completed: FinalExecutionOutcome[], reason: unknown) {
    super(reason instanceof Error ? reason.message : String(reason));
    this.completed = completed;
    this.reason = reason;
  }
}
