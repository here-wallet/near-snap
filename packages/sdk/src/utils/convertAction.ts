import { transactions } from 'near-api-js';
import type { Action } from '@near-wallet-selector/core';

export const TGAS = Math.pow(10, 12);

// Decode binary to json or array
const decodeArgs = (args: Uint8Array) => {
  try {
    return JSON.parse(Buffer.from(args).toString('utf8'));
  } catch {
    return Array.from(args);
  }
};

export const convertAction = (action: transactions.Action): Action => {
  if (action.addKey) {
    const { accessKey, publicKey } = action.addKey;
    if (accessKey.permission.fullAccess) {
      return {
        type: 'AddKey',
        params: {
          accessKey: { permission: 'FullAccess' },
          publicKey: publicKey.toString(),
        },
      };
    }

    if (accessKey.permission.functionCall) {
      const data = accessKey.permission.functionCall;
      return {
        type: 'AddKey',
        params: {
          publicKey: publicKey.toString(),
          accessKey: {
            permission: {
              receiverId: data.receiverId,
              methodNames: data.methodNames,
              allowance: data.allowance?.toString(10),
            },
          },
        },
      };
    }
  }

  if (action.createAccount) {
    return { type: 'CreateAccount' };
  }

  if (action.deleteAccount) {
    return {
      type: 'DeleteAccount',
      params: { beneficiaryId: action.deleteAccount.beneficiaryId },
    };
  }

  if (action.deleteKey) {
    return {
      type: 'DeleteKey',
      params: { publicKey: action.deleteKey.publicKey.toString() },
    };
  }

  if (action.deployContract) {
    return {
      type: 'DeployContract',
      params: { code: action.deployContract.code },
    };
  }

  if (action.functionCall) {
    return {
      type: 'FunctionCall',
      params: {
        args: decodeArgs(action.functionCall.args),
        deposit: action.functionCall.deposit?.toString() ?? '0',
        gas: action.functionCall.gas?.toString() ?? String(300 * TGAS),
        methodName: action.functionCall.methodName ?? '',
      },
    };
  }

  if (action.transfer) {
    return {
      type: 'Transfer',
      params: { deposit: action.transfer.deposit.toString() },
    };
  }

  if (action.stake) {
    return {
      type: 'Stake',
      params: {
        publicKey: action.stake.publicKey.toString(),
        stake: action.stake.stake.toString(),
      },
    };
  }

  throw Error(`Action ${action.enum} is not supported`);
};
