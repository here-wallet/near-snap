import { SnapsGlobalObject } from '@metamask/snaps-types';
import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui';
import { NetworkId } from '@near-wallet-selector/core';
import { getSigner } from './getAccount';

type PermissionsPath = {
  network: NetworkId;
  snap: SnapsGlobalObject;
  origin: string;
};

type ConnectOptions = {
  methods?: string[];
  contractId?: string;
} & PermissionsPath;

export async function getPermissions(
  data: PermissionsPath,
): Promise<Record<string, string[]> | null> {
  const state: any = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });

  const origin = state?.[data.network]?.[data.origin];
  return origin ?? null;
}

export async function disconnectApp(params: PermissionsPath) {
  let data: any = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });

  if (!data) {
    data = {};
  }

  if (!data[params.network]) {
    data[params.network] = {};
  }

  if (data[params.network][params.origin]) {
    delete data[params.network][params.origin];
  }

  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'update',
      newState: data,
    },
  });
}

export async function connectApp(params: ConnectOptions) {
  const account = await getSigner(snap, params.network);
  const publicKey = account.publicKey.toString();

  const type = params.network === 'testnet' ? '**testnet**' : '';
  const view = panel([text(`Site **${params.origin}**`)]);

  if (params.contractId) {
    const allowMethodsText = params.methods
      ? `_You authorize the contract_ **${params.contractId}** _to call the following_ **not payable** _methods:_`
      : `_You authorize the contract_ **${params.contractId}** _to call_ **all not payable methods**`;

    view.children.push(
      heading('Asks for permission to connect:'),
      text(allowMethodsText),
      text(params.methods?.join(', ') ?? ''),
      divider(),
    );
  }

  view.children.push(
    heading('Asking for your public data:'),
    text(`Your ${type} address:`),
    copyable(account.accountId),
    text('Your public key:'),
    copyable(publicKey),
  );

  const isConfirmed = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: view,
    },
  });

  if (!isConfirmed) {
    throw Error('Access is denied');
  }

  let data: any = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });

  if (!data) {
    data = {};
  }

  if (!data[params.network]) {
    data[params.network] = {};
  }

  if (!data[params.network][params.origin]) {
    data[params.network][params.origin] = {};
  }

  if (params.contractId) {
    data[params.network][params.origin][params.contractId] =
      params.methods ?? [];
  }

  await snap.request({
    method: 'snap_manageState',
    params: { operation: 'update', newState: data },
  });

  return { publicKey, accountId: account.accountId };
}
