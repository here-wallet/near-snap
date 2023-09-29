import { DelegateAction, SignedDelegate } from '@near-js/transactions';
import { base_encode } from 'near-api-js/lib/utils/serialize';
import { transactions } from 'near-api-js';

export type DelegateProvderProtocol = {
  payer: string;
  activateAccount(
    accountId: string,
    publicKey: string,
    network: string,
  ): Promise<void>;
  isCanDelegate(action: DelegateAction, network?: string): Promise<boolean>;
  sendDelegate(action: SignedDelegate, network?: string): Promise<string>;
};

export class DelegateNotAllowed extends Error {}

export class DelegateRequestError extends Error {}

export class HEREDelegateProvider implements DelegateProvderProtocol {
  endpoint = 'https://api.herewallet.app/api/v1';

  payer = 'here'; // allow: here, pagoda, banyan, foundation

  async activateAccount(accountId: string, publicKey: string, network: string) {
    const response = await fetch(`${this.endpoint}/user/create_near_username`, {
      method: 'POST',
      body: JSON.stringify({
        near_account_id: accountId,
        device_id: 'metamask',
        public_key: publicKey,
        sign: '',
      }),
      headers: {
        Network: network,
      },
    });

    if (!response.ok) {
      throw new DelegateRequestError(await response.text());
    }
  }

  async isCanDelegate(action: DelegateAction, network = 'mainnet') {
    if (network !== 'mainnet') {
      return false;
    }

    const trxBase64 = Buffer.from(
      transactions.encodeDelegateAction(action),
    ).toString('base64');

    const response = await fetch(`${this.endpoint}/transactions/is_delegate`, {
      body: JSON.stringify({ transaction: trxBase64 }),
      method: 'POST',
    });

    if (!response.ok) {
      throw new DelegateRequestError(await response.text());
    }

    const { allowed } = await response.json();
    return allowed;
  }

  async sendDelegate(action: SignedDelegate, network = 'mainnet') {
    if (network !== 'mainnet') {
      throw new DelegateNotAllowed();
    }

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

    if (!response.ok) {
      throw new DelegateRequestError(await response.text());
    }

    const { hash } = await response.json();
    return hash;
  }
}
