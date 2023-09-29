import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { connectApp, disconnectApp, getPermissions } from './core/permissions';
import { getAccount, needActivate } from './core/getAccount';
import { signMessage } from './core/signMessage';
import {
  InputAssertError,
  connectWalletSchema,
  inputAssert,
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
  try {
    switch (request.method) {
      case Methods.GetAddress: {
        inputAssert(request.params, validAccountSchema);
        const { network } = request.params;
        return await getAccount({ snap, origin, network });
      }

      case Methods.NeedActivate: {
        inputAssert(request.params, validAccountSchema);
        const { network } = request.params;
        return await needActivate({ snap, origin, network });
      }

      case Methods.GetPermissions: {
        inputAssert(request.params, validAccountSchema);
        const { network } = request.params;
        return await getPermissions({ snap, origin, network });
      }

      case Methods.ConnectApp: {
        inputAssert(request.params, connectWalletSchema);
        const { network, contractId, methods } = request.params;
        return await connectApp({ snap, origin, network, contractId, methods });
      }

      case Methods.DisconnectApp: {
        inputAssert(request.params, validAccountSchema);
        const { network } = request.params;
        await disconnectApp({ snap, origin, network });
        return true;
      }

      case Methods.SignMessage: {
        inputAssert(request.params, signMessageSchema);
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
        inputAssert(request.params, signDelegateSchema);
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
        inputAssert(request.params, signTransactionsSchema);
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
        throw new InputAssertError('Method not found');
    }
  } catch (e) {
    console.error(e);

    // Pass only validations errors, to ensure that no important data is accidentally exposed
    if (e instanceof InputAssertError) {
      return new Error(`Validation error: ${e.message}`);
    }

    throw Error('Internal error');
  }
};
