import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui';
import { formatNearAmount } from 'near-api-js/lib/utils/format';
import { Action } from '@near-wallet-selector/core';
import { DelegateJson, TransactionJson } from '../interfaces';

export const TGAS = Math.pow(10, 12);

const formatAmount = (amount: string) => {
  const near = formatNearAmount(amount);
  if (Number(near) < 0.000001) {
    return `${amount} YoctoNear`;
  }
  return `${near} NEAR`;
};

const formatAddress = (addr: string) => {
  if (addr.endsWith('.near') && addr.length > 22) {
    return `${addr.slice(0, 9)}..${addr.slice(-10)}`;
  }

  if (addr.length > 18) {
    return `${addr.slice(0, 8)}..${addr.slice(-8)}`;
  }

  return addr;
};

export const viewAction = (action: Action) => {
  const view = panel([]);
  view.children.push(divider());
  view.children.push(heading(action.type));

  switch (action.type) {
    case 'FunctionCall':
      view.children.push(
        text(`Method: **${action.params.methodName}**`),
        text(`Deposit: **${formatAmount(action.params.deposit)}**`),
        text(`Gas: **${Math.round(Number(action.params.gas) / TGAS)} TGas**`),
        text(`Args:`),
        copyable(JSON.stringify(action.params.args, null, 2)),
      );
      return view;

    case 'Transfer':
      view.children.push(
        text(`Deposit: **${formatAmount(action.params.deposit)}**`),
      );
      return view;

    case 'DeleteKey': {
      view.children.push(
        text('Public key:'),
        copyable(action.params.publicKey),
      );
      return view;
    }

    case 'AddKey': {
      if (action.params.accessKey.permission === 'FullAccess') {
        const warning =
          '**WARNING! With this key you give access to all your NEAR account assets.**';

        view.children.push(
          text(warning),
          text('Public key:'),
          copyable(action.params.publicKey),
        );

        return view;
      }

      const { allowance, receiverId, methodNames } =
        action.params.accessKey.permission;

      view.children.push(text(`Receiver: **${formatAddress(receiverId)}**`));
      if (allowance !== undefined) {
        view.children.push(text(`Allowance: **${formatAmount(allowance)}**`));
      }

      if (methodNames !== undefined && methodNames.length > 0) {
        view.children.push(text(`Methods: ${methodNames.join(', ')}`));
      }

      view.children.push(
        text('Public key:'),
        copyable(action.params.publicKey),
      );

      return view;
    }

    default:
      view.children.push(text(JSON.stringify(action)));
      return view;
  }
};

export const viewDelegate = (data: {
  origin: string;
  action: DelegateJson;
  accountId: string;
  network: string;
  payer?: string;
}) => {
  const view = panel([]);
  const header = heading(`Sign Transaction`);
  const type = data.network === 'testnet' ? '**[testnet]**' : '';
  const { accountId, origin, payer, action } = data;

  view.children.push(header);
  view.children.push(text(`Site: **${origin}**`));
  view.children.push(
    text(`Your account: ${type} **${formatAddress(accountId)}**`),
  );
  view.children.push(text(`Receiver: **${formatAddress(action.receiverId)}**`));

  const gasFree = 'The commission of this transaction will be paid by';
  view.children.push(
    divider(),
    heading('GAS Free:'),
    text(`${gasFree} **${payer ?? 'another account'}**.`),
  );

  view.children.push(...data.action.actions.map(viewAction));
  return view;
};

export const viewTransactions = (
  origin: string,
  txArray: TransactionJson[],
  accountId: string,
  network: string,
) => {
  return txArray.map((tx, index) => {
    const view = panel([]);
    const header = heading(`Sign Transaction (${index + 1}/${txArray.length})`);
    const type = network === 'testnet' ? '**[testnet]**' : '';
    const addr = formatAddress(accountId);

    view.children.push(header);
    view.children.push(text(`Site: **${origin}**`));
    view.children.push(text(`Your account: ${type} **${addr}**`));
    view.children.push(text(`Receiver: **${formatAddress(tx.receiverId)}**`));
    view.children.push(text(''));
    view.children.push(...tx.actions.map(viewAction));
    return view;
  });
};
