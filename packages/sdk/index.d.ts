/* eslint-disable*/
import { MetaMaskInpageProvider } from '@metamask/providers';

/*
 * Window type extension to support ethereum
 */
declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

export type GetSnapsResponse = Record<string, Snap>;

export type Snap = {
  permissionName: string;
  id: string;
  version: string;
  initialPermissions: Record<string, unknown>;
};
