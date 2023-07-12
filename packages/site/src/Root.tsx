import { createContext, FunctionComponent, ReactNode, useState } from 'react';
import { ThemeProvider } from 'styled-components';

// eslint-disable-next-line import/no-unassigned-import
import './buffer';

import { getThemePreference } from './theme';
import { setLocalStorage } from './theme/utils';
import { dark, light } from './theme/config';
import { MetaMaskProvider } from './metamask';

export type RootProps = {
  children: ReactNode;
};

type ToggleTheme = () => void;

export const ToggleThemeContext = createContext<ToggleTheme>(
  (): void => undefined,
);

export const Root: FunctionComponent<RootProps> = ({ children }) => {
  const [darkTheme, setDarkTheme] = useState(getThemePreference());

  const toggleTheme: ToggleTheme = () => {
    setLocalStorage('theme', darkTheme ? 'light' : 'dark');
    setDarkTheme(!darkTheme);
  };

  return (
    <ToggleThemeContext.Provider value={toggleTheme}>
      <ThemeProvider theme={darkTheme ? dark : light}>
        <MetaMaskProvider>{children}</MetaMaskProvider>
      </ThemeProvider>
    </ToggleThemeContext.Provider>
  );
};
