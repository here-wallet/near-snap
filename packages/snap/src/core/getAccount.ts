import { copyable, heading, panel, text } from '@metamask/snaps-ui';
import { JsonBIP44Node } from '@metamask/key-tree';
import { KeyPair } from '@near-js/crypto/lib/key_pair';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { InMemoryKeyStore } from 'near-api-js/lib/key_stores';
import { InMemorySigner } from 'near-api-js/lib/signer';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

import { NearNetwork } from '../interfaces';
import { getPermissions } from './permissions';

const nearNetwork = {
  mainnet: 397,
  testnet: 1,
};

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
    throw Error('Private key is not defined');
  }

  const buf = Buffer.from(node.privateKey.substring(2), 'hex');
  const seed = Uint8Array.from(buf);

  const { secretKey } = nacl.sign.keyPair.fromSeed(seed);
  return KeyPair.fromString(bs58.encode(secretKey));
}

export async function getSigner(snap: SnapsGlobalObject, network: NearNetwork) {
  const keyPair = await getKeyPair(snap, network);
  const accountId = Buffer.from(keyPair.getPublicKey().data).toString('hex');

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
    heading('You need to activate your account.'),
    text(
      `**Send 0.1 NEAR** to **your ${params.network} address** to have your account appear on the blockchain.`,
    ),

    copyable(account.accountId),

    text(
      `**Without this, you won't be able to use dApps.** After sending, make sure that your balance has replenished.`,
    ),
  ]);

  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: view,
    },
  });
}

export async function getAccount(
  snap: SnapsGlobalObject,
  network: NearNetwork,
  origin: string,
) {
  const account = await getSigner(snap, network);
  const permissions = await getPermissions({ network, origin, snap });
  const publicKey = account.publicKey.toString();

  if (!permissions) {
    throw Error('Access is denied. Call near_connect first');
  }

  return { publicKey, accountId: account.accountId, permissions };
}
