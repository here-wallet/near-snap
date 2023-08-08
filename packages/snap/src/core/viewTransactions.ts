import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui';
import { formatNearAmount } from 'near-api-js/lib/utils/format';
import { Action } from '@near-wallet-selector/core';
import { DelegateJson, TransactionJson } from '../interfaces';
import { t } from './locales';

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
    case 'FunctionCall': {
      const gas = Math.round(Number(action.params.gas) / TGAS);
      view.children.push(
        text(t('FunctionCall.method', action.params.methodName)),
        text(t('FunctionCall.deposit', formatAmount(action.params.deposit))),
        text(t('FunctionCall.gas', gas)),
        text(t('FunctionCall.args')),
        copyable(JSON.stringify(action.params.args, null, 2)),
      );
      return view;
    }

    case 'Transfer': {
      const deposit = formatAmount(action.params.deposit);
      view.children.push(text(t('Transfer.deposit'), deposit));
      return view;
    }

    case 'DeleteKey': {
      view.children.push(
        text(t('DeleteKey.key')),
        copyable(action.params.publicKey),
      );
      return view;
    }

    case 'AddKey': {
      if (action.params.accessKey.permission === 'FullAccess') {
        view.children.push(
          text(t('AddKey.fullAccess')),
          text(t('AddKey.key')),
          copyable(action.params.publicKey),
        );

        return view;
      }

      const { allowance, receiverId, methodNames } =
        action.params.accessKey.permission;

      view.children.push(text(t('AddKey.receiver', formatAddress(receiverId))));
      if (allowance !== undefined) {
        const value = formatAmount(allowance);
        view.children.push(text(t('AddKey.allowance', value)));
      }

      if (methodNames !== undefined && methodNames.length > 0) {
        view.children.push(text(t('AddKey.methods', methodNames.join(', '))));
      }

      view.children.push(
        text(t('AddKey.key')),
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
  const { accountId, origin, payer, action } = data;
  const account = formatAddress(accountId);
  const receiver = formatAddress(action.receiverId);
  const type = data.network === 'testnet' ? '**[testnet]**' : '';

  view.children.push(heading(t('viewDelegate.header')));
  view.children.push(text(t('viewDelegate.site', origin)));
  view.children.push(text(t('viewDelegate.yourAccount', type, account)));
  view.children.push(text(t('viewDelegate.receiver', receiver)));

  view.children.push(
    divider(),
    heading(t('viewDelegate.gasFree')),
    text(t('viewDelegate.gasFreeText', payer ?? 'another account')),
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
    const header = t('viewTransactions.header', index + 1, txArray.length);
    const account = formatAddress(accountId);
    const reciver = formatAddress(tx.receiverId);
    const type = network === 'testnet' ? '**[testnet]**' : '';

    view.children.push(heading(header));
    view.children.push(text(t('viewDelegate.site', origin)));
    view.children.push(text(t('viewDelegate.yourAccount', type, account)));
    view.children.push(text(t('viewDelegate.receiver', reciver)));

    view.children.push(text(''));
    view.children.push(...tx.actions.map(viewAction));
    return view;
  });
};
