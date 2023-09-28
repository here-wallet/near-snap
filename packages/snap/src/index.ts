import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { assert } from 'superstruct';

import { connectApp, disconnectApp, getPermissions } from './core/permissions';
import { getAccount, needActivate } from './core/getAccount';
import { signMessage } from './core/signMessage';
import {
  connectWalletSchema,
  signDelegateSchema,
  signMessageSchema,
  signTransactionsSchema,
  validAccountSchema,
} from './core/validations';
import {
  signDelegatedTransaction,
  signTransactions,
} from './core/signTransactions';

enum Methods {
  NeedActivate = 'near_needActivate',
  GetAddress = 'near_getAccount',
  ConnectApp = 'near_connect',
  DisconnectApp = 'near_disconnect',
  GetPermissions = 'near_getPermissions',
  SignTransaction = 'near_signTransactions',
  SignDelegate = 'near_signDelegate',
  SignMessage = 'near_signMessage',
}

export const onRpcRequest: OnRpcRequestHandler = async ({
  request,
  origin,
}) => {
  switch (request.method) {
    case Methods.GetAddress: {
      assert(request.params, validAccountSchema);
      const { network } = request.params;
      return await getAccount({ snap, origin, network });
    }

    case Methods.NeedActivate: {
      assert(request.params, validAccountSchema);
      const { network } = request.params;
      return await needActivate({ snap, origin, network });
    }

    case Methods.GetPermissions: {
      assert(request.params, validAccountSchema);
      const { network } = request.params;
      return await getPermissions({ snap, origin, network });
    }

    case Methods.ConnectApp: {
      assert(request.params, connectWalletSchema);
      const { network, contractId, methods } = request.params;
      return await connectApp({ snap, origin, network, contractId, methods });
    }

    case Methods.DisconnectApp: {
      assert(request.params, validAccountSchema);
      const { network } = request.params;
      await disconnectApp({ snap, origin, network });
      return true;
    }

    case Methods.SignMessage: {
      assert(request.params, signMessageSchema);
      const { network, message, recipient, nonce } = request.params;
      return await signMessage({
        recipient,
        network,
        message,
        origin,
        nonce,
        snap,
      });
    }

    case Methods.SignDelegate: {
      assert(request.params, signDelegateSchema);
      const { network, hintBalance, delegateAction, payer } = request.params;
      return await signDelegatedTransaction({
        delegateAction,
        hintBalance,
        network,
        origin,
        snap,
        payer,
      });
    }

    case Methods.SignTransaction: {
      assert(request.params, signTransactionsSchema);
      const { network, hintBalance, transactions } = request.params;
      return await signTransactions({
        network,
        hintBalance,
        transactions,
        origin,
        snap,
      });
    }

    default:
      throw new Error('Method not found.');
  }
};
