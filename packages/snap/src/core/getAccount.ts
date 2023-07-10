import { JsonBIP44Node } from '@metamask/key-tree';
import { KeyPair } from '@near-js/crypto/lib/key_pair';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

import { SnapsGlobalObject } from '@metamask/snaps-types';
import { NearNetwork } from '../interfaces';

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

export async function getAccount(
  snap: SnapsGlobalObject,
  network: NearNetwork,
): Promise<{
  accountId: string;
  publicKey: string;
}> {
  const keyPair = await getKeyPair(snap, network);
  const accountId = Buffer.from(keyPair.getPublicKey().data).toString('hex');
  const publicKey = keyPair.getPublicKey().toString();
  return {
    accountId,
    publicKey,
  };
}
