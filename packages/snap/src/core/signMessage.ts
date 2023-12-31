import { copyable, heading, panel, text } from '@metamask/snaps-ui';
import { SnapsGlobalObject } from '@metamask/snaps-types';
import { serialize } from 'near-api-js/lib/utils/serialize';
import { NearNetwork } from '../interfaces';
import { InputAssertError } from './validations';
import { getSigner } from './getAccount';
import { t } from './locales';

export class SignPayload {
  readonly message: string;

  readonly nonce: number[];

  readonly recipient: string;

  readonly callbackUrl?: string;

  readonly tag: number;

  constructor({
    message,
    nonce,
    recipient,
    callbackUrl,
  }: {
    message: string;
    nonce: number[];
    recipient: string;
    callbackUrl?: string;
  }) {
    this.tag = 2147484061;
    this.message = message;
    this.nonce = nonce;
    this.recipient = recipient;
    if (callbackUrl) {
      this.callbackUrl = callbackUrl;
    }
  }
}

export const signPayloadSchema = new Map([
  [
    SignPayload,
    {
      kind: 'struct',
      fields: [
        ['tag', 'u32'],
        ['message', 'string'],
        ['nonce', [32]],
        ['recipient', 'string'],
        ['callbackUrl', { kind: 'option', type: 'string' }],
      ],
    },
  ],
]);

export const signMessage = async (request: {
  snap: SnapsGlobalObject;
  origin: string;
  message: string;
  recipient: string;
  nonce: number[];
  network: NearNetwork;
}) => {
  const { snap, origin, message, recipient, network, nonce } = request;
  const bufferNonce = Buffer.from(new Uint8Array(nonce));
  if (bufferNonce.byteLength !== 32) {
    throw new InputAssertError(t('signMessage.nonceNot32bytes'));
  }

  const { signer, accountId } = await getSigner(snap, network);
  const confirmation = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading(t('signMessage.header')),
        text(t('signMessage.site', origin)),

        text(t('signMessage.account', network)),
        copyable(accountId),

        text(t('signMessage.recipient')),
        copyable(recipient),

        text(t('signMessage.msgToBeSigned')),
        copyable(message),
      ]),
    },
  });

  if (!confirmation) {
    throw new InputAssertError(t('signMessage.accessDenied'));
  }
  // Create the payload and sign it
  const payload = new SignPayload({
    nonce: Array.from(nonce),
    recipient,
    message,
  });

  const borshPayload = serialize(signPayloadSchema, payload);
  const signature = await signer.signMessage(borshPayload, accountId, network);
  return {
    accountId,
    publicKey: signature.publicKey.toString(),
    signature: Buffer.from(signature.signature).toString('base64'),
  };
};
