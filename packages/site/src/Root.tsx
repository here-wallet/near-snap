import React, { createContext, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
// eslint-disable-next-line import/no-unassigned-import
import './buffer';

import { getThemePreference } from './theme';
import { setLocalStorage } from './theme/utils';
import { GlobalStyle, dark, light } from './theme/config';
import { MetaMaskProvider } from './metamask';
import { Footer, Header } from './components';
import Index from './Page';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  max-width: 100vw;
`;

type ToggleTheme = () => void;

export const ToggleThemeContext = createContext<ToggleTheme>(
  (): void => undefined,
);

export const Root = () => {
  const [darkTheme, setDarkTheme] = useState(getThemePreference());

  const toggleTheme: ToggleTheme = () => {
    setLocalStorage('theme', darkTheme ? 'light' : 'dark');
    setDarkTheme(!darkTheme);
  };

  return (
    <ToggleThemeContext.Provider value={toggleTheme}>
      <ThemeProvider theme={darkTheme ? dark : light}>
        <MetaMaskProvider>
          <GlobalStyle />
          <Wrapper>
            <Header />
            <Index />
            <Footer />
          </Wrapper>
        </MetaMaskProvider>
      </ThemeProvider>
    </ToggleThemeContext.Provider>
  );
};
