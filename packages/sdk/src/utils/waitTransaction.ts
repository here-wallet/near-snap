import { providers } from 'near-api-js';
import { Provider } from 'near-api-js/lib/providers';
import {
  ExecutionOutcome,
  ExecutionStatusBasic,
} from 'near-api-js/lib/providers/provider';

export const wait = (timeout: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, timeout));
};

export const waitTransactionResult = async (
  txHash: string,
  accountId: string,
  provider: Provider,
): Promise<providers.FinalExecutionOutcome> => {
  await wait(2000);

  let logs: providers.FinalExecutionOutcome;
  try {
    logs = await provider.txStatus(txHash, accountId);
  } catch {
    return await waitTransactionResult(txHash, accountId, provider);
  }

  const errors: any[] = [];
  const trxOutcome = logs.transaction_outcome.outcome;
  const receipts = logs.receipts_outcome.reduce(
    (acc: Record<string, ExecutionOutcome>, item) => {
      acc[item.id] = item.outcome;
      return acc;
    },
    {},
  );

  const checkReceipts = (ids: string[]): boolean => {
    return ids.some((id) => {
      if (!receipts[id]) {
        return false;
      }

      const { status } = receipts[id];
      if (typeof status === 'string') {
        if (status === ExecutionStatusBasic.Failure) {
          errors.push(status);
        }
        return false;
      }

      if (status.Failure) {
        errors.push(status.Failure);
        return false;
      }

      if (typeof status.SuccessValue === 'string') {
        if (receipts[id].receipt_ids.length === 0) {
          return true;
        }
      }

      return checkReceipts(receipts[id].receipt_ids);
    });
  };

  const isSuccess = checkReceipts(trxOutcome.receipt_ids);
  if (errors.length > 0) {
    throw Error(JSON.stringify(errors, null, 2));
  }

  if (isSuccess) {
    return logs;
  }

  return await waitTransactionResult(txHash, accountId, provider);
};
