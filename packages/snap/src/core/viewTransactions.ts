import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui';
import { formatNearAmount } from 'near-api-js/lib/utils/format';
import { ActionJson, DelegateJson, TransactionJson } from '../interfaces';
import { tokens } from '../data/tokens';
import { t } from './locales';

export const TGAS = Math.pow(10, 12);

const isYocto = (v: string | number) => Number(v) < 0.00000000001;

export const toReadableNumber = (number = '0', decimals?: number): string => {
  if (!decimals) {
    return number;
  }

  const wholeStr = number.substring(0, number.length - decimals) || '0';
  const fractionStr = number
    .substring(number.length - decimals)
    .padStart(decimals, '0')
    .substring(0, decimals);

  return `${wholeStr}.${fractionStr}`.replace(/\.?0+$/u, '');
};

export const viewAction = (receiver: string, action: ActionJson) => {
  const view = panel([]);
  view.children.push(divider());

  switch (action.type) {
    case 'FunctionCall': {
      const argsCopy = copyable(JSON.stringify(action.params.args, null, 2));
      const gas = Math.round(Number(action.params.gas) / TGAS);
      const methods = ['ft_transfer', 'ft_transfer_call'];

      if (methods.includes(action.params.methodName) && tokens[receiver]) {
        const ft = tokens[receiver];
        const { amount } = action.params.args as any;
        const readableAmount = toReadableNumber(amount, Number(ft.decimal));

        const deposit = formatNearAmount(action.params.deposit);
        const isYoctoDeposit = isYocto(deposit) ? 'yoctoDeposit' : 'deposit';
        const near = isYocto(deposit) ? action.params.deposit : deposit;

        view.children.push(
          heading(t('FunctionCall.ftTransfer', ft.ticker)),
          text(t('FunctionCall.ftAmount', readableAmount, ft.ticker)),
          text(t('FunctionCall.method', action.params.methodName)),
          text(t(`FunctionCall.${isYoctoDeposit}`, near)),
          text(t('FunctionCall.gas', gas)),
          text(t('FunctionCall.args')),
          argsCopy,
        );

        return view;
      }

      const deposit = formatNearAmount(action.params.deposit);
      const isYoctoDeposit = isYocto(deposit) ? 'yoctoDeposit' : 'deposit';
      const near = isYocto(deposit) ? action.params.deposit : deposit;

      view.children.push(
        heading(action.type),
        text(t('FunctionCall.method', action.params.methodName)),
        text(t(`FunctionCall.${isYoctoDeposit}`, near)),
        text(t('FunctionCall.gas', gas)),
        text(t('FunctionCall.args')),
        argsCopy,
      );

      return view;
    }

    case 'Transfer': {
      const deposit = formatNearAmount(action.params.deposit);
      const isYoctoDeposit = isYocto(deposit) ? 'yoctoDeposit' : 'deposit';
      const near = isYocto(deposit) ? action.params.deposit : deposit;

      view.children.push(
        heading(action.type),
        text(t(`Transfer.${isYoctoDeposit}`, near)),
      );

      return view;
    }

    case 'DeleteKey': {
      view.children.push(
        heading(action.type),
        text(t('DeleteKey.key')),
        copyable(action.params.publicKey),
      );
      return view;
    }

    case 'AddKey': {
      // @ts-expect-error FullAccess is prohibited by the superstruct
      if (action.params.accessKey.permission === 'FullAccess') {
        view.children.push(
          heading(action.type),
          text(t('AddKey.fullAccess')),
          text(t('AddKey.key')),
          copyable(action.params.publicKey),
        );

        return view;
      }

      const { allowance, receiverId, methodNames } =
        action.params.accessKey.permission;

      view.children.push(
        heading(action.type),
        text(t('AddKey.receiver')),
        copyable(receiverId),
      );

      if (allowance !== undefined) {
        const value = formatNearAmount(allowance);
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
      // @ts-expect-error Unknown action type
      view.children.push(heading(action.type), text(JSON.stringify(action)));
      return view;
  }
};

export const PAYERS = {
  here: 'Here Wallet',
  pagoda: 'Pagoda',
  banyan: 'Banyan',
  foundation: 'NEAR Foundation',
};

export const viewDelegate = (data: {
  origin: string;
  action: DelegateJson;
  accountId: string;
  network: string;
  payer?: string;
  hintBalance?: string;
}) => {
  const { hintBalance, accountId, origin, payer = '', action } = data;
  const payerLabel = { ...PAYERS }[payer] || 'another account';

  return panel([
    heading(t('viewDelegate.header')),
    text(t('viewDelegate.site', origin)),
    hintBalance
      ? text(t('viewDelegate.balance', formatNearAmount(hintBalance, 4)))
      : text(''),
    text(t('viewDelegate.yourAccount', data.network)),
    copyable(accountId),
    text(t('viewDelegate.receiver')),
    copyable(action.receiverId),
    divider(),
    heading(t('viewDelegate.gasFree')),
    text(t('viewDelegate.gasFreeText', payerLabel)),
    ...data.action.actions.map((act) => viewAction(action.receiverId, act)),
  ]);
};

export const viewTransactions = (
  origin: string,
  txArray: TransactionJson[],
  accountId: string,
  network: string,
  hintBalance?: string,
) => {
  return txArray.map((tx, index) => {
    const header = t('viewTransactions.header', index + 1, txArray.length);

    return panel([
      heading(header),
      text(t('viewTransactions.site', origin)),
      hintBalance
        ? text(t('viewTransactions.balance', formatNearAmount(hintBalance, 4)))
        : text(''),
      text(t('viewTransactions.yourAccount', network)),
      copyable(accountId),
      text(t('viewTransactions.receiver')),
      copyable(tx.receiverId),
      text(''),
      ...tx.actions.map((act) => viewAction(tx.receiverId, act)),
    ]);
  });
};
