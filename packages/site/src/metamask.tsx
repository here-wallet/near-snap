import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { NearSnap, NearSnapAccount, NearSnapStatus } from '@near-snap/sdk';

export type MetamaskState = {
  installSnap: () => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
  setError: (_: Error) => void;
  status: NearSnapStatus | null;
  account: NearSnapAccount | null;
  error: Error | null;
  snap: NearSnap;
};

export const snap = new NearSnap({
  id: process.env.GATSBY_SNAP_ORIGIN ?? 'npm:@near-snap/plugin',
});

export const MetaMaskContext = createContext<MetamaskState>({
  installSnap: () => {},
  connectWallet: () => {},
  disconnectWallet: () => {},
  setError: (_: Error) => {},
  status: null,
  account: null,
  error: null,
  snap,
});

export const MetaMaskProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<NearSnapStatus | null>(null);
  const [account, setAccount] = useState<NearSnapAccount | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    snap.getStatus().then(setStatus).catch(setError);
  }, [snap]);

  useEffect(() => {
    let timeoutId: number;
    if (error) {
      timeoutId = window?.setTimeout(() => setError(null), 10000);
    }

    return () => window?.clearTimeout(timeoutId);
  }, [error]);

  const installSnap = useCallback(async () => {
    try {
      await snap.install();
      setStatus(NearSnapStatus.INSTALLED);
    } catch (e) {
      setError(e);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      const snapAccount = await NearSnapAccount.connect('testnet', snap);
      setAccount(snapAccount);
    } catch (e) {
      setError(e);
    }
  }, []);

  const disconnectWallet = useCallback(() => setAccount(null), []);

  return (
    <MetaMaskContext.Provider
      value={{
        installSnap,
        disconnectWallet,
        connectWallet,
        setError,
        status,
        account,
        error,
        snap,
      }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
};
