import { DelegateAction, SignedDelegate } from '@near-js/transactions';
import { base_encode } from 'near-api-js/lib/utils/serialize';
import { transactions } from 'near-api-js';

export type DelegateProvderProtocol = {
  payer: string;
  isCanDelegate(action: DelegateAction): Promise<boolean>;
  sendDelegate(action: SignedDelegate): Promise<string>;
};

export class DelegateNotAllowed extends Error {}

export class HEREDelegateProvider implements DelegateProvderProtocol {
  endpoint = 'https://api.herewallet.app/api/v1';

  payer = 'HERE Wallet';

  async isCanDelegate(action: DelegateAction) {
    const trxBase64 = Buffer.from(
      transactions.encodeDelegateAction(action),
    ).toString('base64');

    const response = await fetch(`${this.endpoint}/transactions/is_delegate`, {
      body: JSON.stringify({ transaction: trxBase64 }),
      method: 'POST',
    });

    const { allowed } = await response.json();
    return allowed;
  }

  async sendDelegate(action: SignedDelegate) {
    const trxBase64 = Buffer.from(
      transactions.encodeDelegateAction(action.delegateAction),
    ).toString('base64');

    const response = await fetch(
      `${this.endpoint}/transactions/call_delegate`,
      {
        method: 'POST',
        body: JSON.stringify({
          signature: base_encode(action.signature.data),
          transaction: trxBase64,
        }),
      },
    );

    const { hash } = await response.json();
    return hash;
  }
}
