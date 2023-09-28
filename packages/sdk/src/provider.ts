import { Snap, GetSnapsResponse } from './types';

class NearSnapProvider {
  async isSnapsAvailable(minVersion = 11) {
    const provider = window.ethereum;
    const clientVersion = await provider
      ?.request<string>({ method: 'web3_clientVersion' })
      .catch(() => null);

    if (!(typeof clientVersion === 'string')) {
      return false;
    }

    const version = clientVersion.replace('MetaMask/v', '').split('.')[0];
    return Number(version) >= minVersion;
  }

  async getSnaps(): Promise<GetSnapsResponse> {
    return (await window.ethereum.request({
      method: 'wallet_getSnaps',
    })) as unknown as GetSnapsResponse;
  }

  async connectSnap(
    snapId: string,
    params: Record<'version' | string, unknown> = {},
  ) {
    await window.ethereum.request({
      method: 'wallet_requestSnaps',
      params: { [snapId]: params },
    });
  }

  async getSnap(id: string, version?: string): Promise<Snap | undefined> {
    try {
      const snaps = await this.getSnaps();
      return Object.values(snaps).find(
        (snap) => snap.id === id && (!version || snap.version === version),
      );
    } catch (e) {
      console.log('Failed to obtain installed snap', e);
      return undefined;
    }
  }

  async invokeSnap<R, T = object>(id: string, method: string, params: T) {
    return await window.ethereum.request<R>({
      method: 'wallet_invokeSnap',
      params: {
        snapId: id,
        request: { method, params },
      },
    });
  }
}

export default NearSnapProvider;
