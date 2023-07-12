import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react';

const noop = () => {
  /* */
};

const initialState: MetamaskState = {
  isFlask: false,
  error: undefined,
};

type MetamaskDispatch = { type: MetamaskActions; payload: any };
export type MetamaskState = {
  isFlask: boolean;
  installedSnap?: Snap;
  error?: Error;
};

export const MetaMaskContext = createContext<
  [MetamaskState, Dispatch<MetamaskDispatch>]
>([initialState, noop]);

export enum MetamaskActions {
  SetInstalled = 'SetInstalled',
  SetFlaskDetected = 'SetFlaskDetected',
  SetError = 'SetError',
}

export const useShouldDisplayReconnectButton = () => {
  const [state] = useContext(MetaMaskContext);
  return state.installedSnap && state.installedSnap.id.startWith('local:');
};

/**
 * MetaMask context provider to handle MetaMask and snap status.
 *
 * @param props - React Props.
 * @param props.children - React component to be wrapped by the Provider.
 * @returns JSX.
 */
export const MetaMaskProvider = ({ children }: { children: ReactNode }) => {
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  const [state, dispatch] = useReducer(
    (prevState: MetamaskState, action: MetamaskDispatch) => {
      switch (action.type) {
        case MetamaskActions.SetInstalled:
          return { ...prevState, installedSnap: action.payload };

        case MetamaskActions.SetFlaskDetected:
          return { ...prevState, isFlask: action.payload };

        case MetamaskActions.SetError:
          return { ...prevState, error: action.payload };

        default:
          return prevState;
      }
    },
    initialState,
  );

  useEffect(() => {
    async function detectFlask() {
      const isFlaskDetected = await isFlask();
      dispatch({
        type: MetamaskActions.SetFlaskDetected,
        payload: isFlaskDetected,
      });
    }

    async function detectSnapInstalled() {
      const installedSnap = await getSnap();
      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    }

    detectFlask();
    if (state.isFlask) {
      detectSnapInstalled();
    }
  }, [state.isFlask, window.ethereum]);

  useEffect(() => {
    let timeoutId: number;

    if (state.error) {
      timeoutId = window.setTimeout(() => {
        dispatch({ type: MetamaskActions.SetError, payload: undefined });
      }, 10000);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [state.error]);

  return (
    <MetaMaskContext.Provider value={[state, dispatch]}>
      {children}
    </MetaMaskContext.Provider>
  );
};
