import { BN } from 'bn.js';
import * as transactions from 'near-api-js/lib/transaction';
import type { Action, AddKeyPermission } from '@near-wallet-selector/core';
import { PublicKey } from 'near-api-js/lib/utils';

const getAccessKey = (permission: AddKeyPermission) => {
  if (permission === 'FullAccess') {
    return transactions.fullAccessKey();
  }

  const { receiverId, methodNames = [] } = permission;
  const allowance = permission.allowance
    ? new BN(permission.allowance)
    : undefined;

  return transactions.functionCallAccessKey(receiverId, methodNames, allowance);
};

export const createAction = (action: Action): transactions.Action => {
  switch (action.type) {
    case 'CreateAccount':
      return transactions.createAccount();

    case 'DeployContract': {
      const { code } = action.params;
      return transactions.deployContract(code);
    }

    case 'FunctionCall': {
      const { methodName, args, gas, deposit } = action.params;

      return transactions.functionCall(
        methodName,
        args,
        new BN(gas),
        new BN(deposit),
      );
    }

    case 'Transfer': {
      const { deposit } = action.params;
      return transactions.transfer(new BN(deposit));
    }

    case 'Stake': {
      const { stake, publicKey } = action.params;
      return transactions.stake(new BN(stake), PublicKey.from(publicKey));
    }

    case 'AddKey': {
      const { publicKey, accessKey } = action.params;
      return transactions.addKey(
        PublicKey.from(publicKey),
        getAccessKey(accessKey.permission),
      );
    }

    case 'DeleteKey': {
      const { publicKey } = action.params;
      return transactions.deleteKey(PublicKey.from(publicKey));
    }

    case 'DeleteAccount': {
      const { beneficiaryId } = action.params;
      return transactions.deleteAccount(beneficiaryId);
    }

    default:
      throw new Error('Invalid action type');
  }
};
