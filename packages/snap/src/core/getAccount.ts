import { copyable, heading, panel, text } from '@metamask/snaps-ui';
import { JsonBIP44Node } from '@metamask/key-tree';
import { KeyPair } from '@near-js/crypto/lib/key_pair';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { InMemoryKeyStore } from 'near-api-js/lib/key_stores/in_memory_key_store';
import { InMemorySigner } from 'near-api-js/lib/signer';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

import { NearNetwork } from '../interfaces';
import { getPermissions } from './permissions';
import { InputAssertError } from './validations';
import { t } from './locales';

const nearNetwork = {
  mainnet: 397,
  testnet: 1,
};

export const NICKNAME_KEY = '@nickname';

export async function getKeyPair(
  snap: SnapsGlobalObject,
  network: NearNetwork,
): Promise<KeyPair> {
  const node = (await snap.request({
    method: `snap_getBip32Entropy`,
    params: {
      path: ['m', "44'", `${nearNetwork[network]}'`, "0'"],
      curve: 'ed25519',
    },
  })) as JsonBIP44Node;

  if (node.privateKey === undefined) {
    throw new InputAssertError(t('getKeyPair.privateNotDefined'));
  }

  const buf = Buffer.from(node.privateKey.substring(2), 'hex');
  const seed = Uint8Array.from(buf);

  const { secretKey } = nacl.sign.keyPair.fromSeed(seed);
  return KeyPair.fromString(bs58.encode(secretKey));
}

export async function getSigner(snap: SnapsGlobalObject, network: NearNetwork) {
  const keyPair = await getKeyPair(snap, network);
  const address = Buffer.from(keyPair.getPublicKey().data).toString('hex');

  let state: any = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });

  const accountId = state?.[network]?.[NICKNAME_KEY] || address;

  const keystore = new InMemoryKeyStore();
  await keystore.setKey(network, accountId, keyPair);
  const signer = new InMemorySigner(keystore);

  return { signer, publicKey: keyPair.getPublicKey(), accountId };
}

export async function needActivate(params: {
  snap: SnapsGlobalObject;
  network: NearNetwork;
  origin: string;
}) {
  const account = await getSigner(snap, params.network);
  const view = panel([
    heading(t('needActivation.title')),
    text(t('needActivation.text', params.network)),
    copyable(account.accountId),
    text(t('needActivation.info')),
  ]);

  await snap.request({
    method: 'snap_dialog',
    params: { type: 'alert', content: view },
  });
}

export async function getAccount(params: {
  snap: SnapsGlobalObject;
  network: NearNetwork;
  origin: string;
}) {
  const { network, origin, snap } = params;
  const account = await getSigner(snap, network);
  const permissions = await getPermissions({ network, origin, snap });
  const publicKey = account.publicKey.toString();

  if (!permissions) {
    throw new InputAssertError(t('getAccount.accessDenied'));
  }

  return { publicKey, accountId: account.accountId, permissions };
}
