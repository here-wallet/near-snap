import crypto from 'crypto';
import { PublicKey } from 'near-api-js/lib/utils';
import { serialize } from 'near-api-js/lib/utils/serialize';

export type SignMessageOptionsNEP0413 = {
  message: string; // The message that wants to be transmitted.
  recipient: string; // The recipient to whom the message is destined (e.g. "alice.near" or "myapp.com").
  nonce: Buffer; // A nonce that uniquely identifies this instance of the message, denoted as a 32 bytes array (a fixed `Buffer` in JS/TS).
  callbackUrl?: string; // Optional, applicable to browser wallets (e.g. MyNearWallet). The URL to call after the signing process. Defaults to `window.location.href`.
};

export type SignedMessageNEP0413 = {
  signature: string;
  publicKey: string;
  accountId: string;
};

export class AuthPayload implements SignMessageOptionsNEP0413 {
  readonly message: string;

  readonly recipient: string;

  readonly nonce: Buffer;

  readonly callbackUrl?: string | undefined;

  readonly tag: number;

  constructor({
    message,
    nonce,
    recipient,
    callbackUrl,
  }: SignMessageOptionsNEP0413) {
    this.tag = 2147484061;
    this.message = message;
    this.nonce = nonce;
    this.recipient = recipient;
    if (callbackUrl) {
      this.callbackUrl = callbackUrl;
    }
  }
}

export const authPayloadSchema = new Map([
  [
    AuthPayload,
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

// eslint-disable-next-line jsdoc/require-jsdoc
export function verifySignature(
  request: SignMessageOptionsNEP0413,
  result: SignedMessageNEP0413,
) {
  // Reconstruct the payload that was **actually signed**
  const payload = new AuthPayload(request);
  const borsh_payload = serialize(authPayloadSchema, payload);
  const hash = crypto.createHash('sha256');
  const to_sign = Uint8Array.from(hash.update(borsh_payload).digest());

  // Reconstruct the signature from the parameter given in the URL
  const real_signature = new Uint8Array(
    Buffer.from(result.signature, 'base64'),
  );

  // Use the public Key to verify that the private-counterpart signed the message
  const myPK = PublicKey.from(result.publicKey);
  return myPK.verify(to_sign, real_signature);
}
