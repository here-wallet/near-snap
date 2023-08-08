import { SnapsGlobalObject } from '@metamask/snaps-types';
import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui';
import { NetworkId } from '@near-wallet-selector/core';
import { getSigner } from './getAccount';
import { t } from './locales';

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
  const view = panel([text(t('connectApp.site', params.origin))]);

  if (params.contractId) {
    const allowMethodsText = params.methods
      ? t('connectApp.allowMethods', params.contractId)
      : t('connectApp.allowAllMethods', params.contractId);

    view.children.push(
      heading(t('connectApp.header')),
      text(allowMethodsText),
      text(params.methods?.join(', ') ?? ''),
      divider(),
    );
  }

  view.children.push(
    heading(t('connectApp.askingPublicData')),
    text(t('connectApp.yourTypeAddress', type)),
    copyable(account.accountId),
    text(t('connectApp.yourPublicKey')),
    copyable(publicKey),
  );

  const isConfirmed = await snap.request({
    method: 'snap_dialog',
    params: { type: 'confirmation', content: view },
  });

  if (!isConfirmed) {
    throw Error(t('connectApp.accessDenied'));
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
