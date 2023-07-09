import { Buffer } from 'buffer';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { NearNetwork } from '../interfaces';
import { getKeyPair } from '../near/account';

// eslint-disable-next-line jsdoc/require-jsdoc
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
