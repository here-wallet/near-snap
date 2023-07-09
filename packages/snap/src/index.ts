import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { assert } from 'superstruct';

import { getAccount } from './rpc/getAccount';
import { signTransactions } from './rpc/signTransactions';
import { signTransactionsSchema, validAccountSchema } from './utils/params';

enum Methods {
  GetAddress = 'near_getAccount',
  SignTransaction = 'near_signTransactions',
}

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case Methods.GetAddress:
      assert(request.params, validAccountSchema);
      return await getAccount(snap, request.params.network);

    case Methods.SignTransaction:
      assert(request.params, signTransactionsSchema);
      return await signTransactions(snap, request.params);

    default:
      throw new Error('Method not found.');
  }
};
