import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui';
import { formatNearAmount } from 'near-api-js/lib/utils/format';
import { TransactionJson } from '../interfaces';

export const TGAS = Math.pow(10, 12);

const formatAmount = (amount: string) => {
  const near = formatNearAmount(amount);
  if (Number(near) < 0.000001) {
    return `${amount} YoctoNear`;
  }
  return `${near} NEAR`;
};

export const viewTransactions = (
  txArray: TransactionJson[],
  accountId: string,
) => {
  return txArray.map((tx, index) => {
    const view = panel([]);
    const header = heading(`Sign Transaction (${index + 1}/${txArray.length})`);
    view.children.push(header);
    view.children.push(text(`Signer: ${accountId}`));
    view.children.push(text(`Receiver: ${tx.receiverId}`));
    view.children.push(text(''));

    for (const action of tx.actions) {
      view.children.push(divider());
      view.children.push(heading(action.type));

      switch (action.type) {
        case 'FunctionCall':
          view.children.push(
            text(`Method: ${action.params.methodName}`),
            text(`Deposit: ${formatAmount(action.params.deposit)}`),
            text(`Gas: ${Math.round(Number(action.params.gas) / TGAS)} TGas`),
            text(`Args:`),
            copyable(JSON.stringify(action.params.args, null, 2)),
          );
          continue;

        case 'Transfer':
          view.children.push(
            text(`Deposit: ${formatAmount(action.params.deposit)}`),
          );
          continue;

        case 'DeleteKey': {
          view.children.push(
            text('PublicKey:'),
            copyable(action.params.publicKey),
          );
          continue;
        }

        case 'AddKey': {
          if (action.params.accessKey.permission === 'FullAccess') {
            view.children.push(
              text('**WARNING! Allocate full access key**'),
              text('publicKey:'),
              copyable(action.params.publicKey),
            );
            continue;
          }

          const { allowance, receiverId, methodNames } =
            action.params.accessKey.permission;

          view.children.push(text(`receiverId: ${receiverId}`));
          if (allowance !== undefined) {
            view.children.push(text(`allowance: ${formatAmount(allowance)}`));
          }

          if (methodNames !== undefined) {
            view.children.push(text(`methodNames: ${methodNames.join(', ')}`));
          }

          view.children.push(
            text('publicKey:'),
            copyable(action.params.publicKey),
          );

          continue;
        }

        default:
          view.children.push(text(JSON.stringify(action)));
          continue;
      }
    }

    return view;
  });
};
