import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { copyable, heading, panel, text } from '@metamask/snaps-ui';
import { assert } from 'superstruct';

import { signTransactionsSchema, validAccountSchema } from './core/validations';
import { signTransactions } from './core/signTransactions';
import { getAccount } from './core/getAccount';

enum Methods {
  GetAddress = 'near_getAccount',
  SignTransaction = 'near_signTransactions',
}

export const onRpcRequest: OnRpcRequestHandler = async ({
  request,
  origin,
}) => {
  switch (request.method) {
    case Methods.GetAddress: {
      assert(request.params, validAccountSchema);

      const account = await getAccount(snap, request.params.network);
      const isConfirmed = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`DApp **${origin}**`),
            heading('Asking for your public data:'),

            text('Your address:'),
            copyable(account.accountId),

            text('Your public key:'),
            copyable(account.publicKey),
          ]),
        },
      });

      if (!isConfirmed) {
        throw Error('Access is denied');
      }

      return account;
    }

    case Methods.SignTransaction:
      assert(request.params, signTransactionsSchema);
      return await signTransactions(snap, request.params);

    default:
      throw new Error('Method not found.');
  }
};
