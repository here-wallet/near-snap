import { BN } from 'bn.js';
import { PublicKey } from '@near-js/crypto/lib/public_key';
import * as transactions from 'near-api-js/lib/transaction';
import { ActionJson, AddKeyPermissionJson } from '../interfaces';

const getAccessKey = (permission: AddKeyPermissionJson) => {
  const { receiverId, methodNames = [] } = permission;
  const allowance = permission.allowance
    ? new BN(permission.allowance)
    : undefined;

  return transactions.functionCallAccessKey(receiverId, methodNames, allowance);
};

export const createAction = (action: ActionJson): transactions.Action => {
  switch (action.type) {
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

    default:
      throw new Error('Invalid action type');
  }
};
