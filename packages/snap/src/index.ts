import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { assert } from 'superstruct';

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
import { getAccount, needActivate } from './core/getAccount';
import { connectApp, disconnectApp, getPermissions } from './core/permissions';
import { signMessage } from './core/signMessage';

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
      return await getAccount(snap, request.params.network, origin);
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

    case Methods.ConnectApp:
      assert(request.params, connectWalletSchema);
      return await connectApp({ origin, snap, ...request.params });

    case Methods.DisconnectApp:
      assert(request.params, validAccountSchema);
      await disconnectApp({ origin, snap, ...request.params });
      return true;

    case Methods.SignMessage:
      assert(request.params, signMessageSchema);
      return await signMessage(snap, origin, request.params);

    case Methods.SignDelegate:
      assert(request.params, signDelegateSchema);
      return await signDelegatedTransaction(origin, snap, request.params);

    case Methods.SignTransaction:
      assert(request.params, signTransactionsSchema);
      return await signTransactions(origin, snap, request.params);

    default:
      throw new Error('Method not found.');
  }
};
