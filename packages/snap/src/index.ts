import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { copyable, heading, panel, text } from '@metamask/snaps-ui';
import { assert } from 'superstruct';

import {
  signDelegateSchema,
  signTransactionsSchema,
  validAccountSchema,
} from './core/validations';
import {
  signDelegatedTransaction,
  signTransactions,
} from './core/signTransactions';
import { getSigner } from './core/getAccount';

enum Methods {
  GetAddress = 'near_getAccount',
  SignTransaction = 'near_signTransactions',
  SignDelegate = 'near_signDelegate',
}

export const onRpcRequest: OnRpcRequestHandler = async ({
  request,
  origin,
}) => {
  switch (request.method) {
    case Methods.GetAddress: {
      assert(request.params, validAccountSchema);

      const account = await getSigner(snap, request.params.network);
      const type = request.params.network === 'testnet' ? '**testnet**' : '';
      const publicKey = account.publicKey.toString();

      const isConfirmed = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Site **${origin}**`),
            heading('Asking for your public data:'),

            text(`Your ${type} address:`),
            copyable(account.accountId),

            text('Your public key:'),
            copyable(publicKey),
          ]),
        },
      });

      if (!isConfirmed) {
        throw Error('Access is denied');
      }

      return { publicKey, accountId: account.accountId };
    }

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
