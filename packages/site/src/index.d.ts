/* eslint-disable import/no-unassigned-import */
/* eslint-disable*/
import { MetaMaskInpageProvider } from '@metamask/providers';
import React from 'react';
import 'styled-components';

/**
 * styled-component default theme extension
 */
declare module 'styled-components' {
  /* eslint-disable @typescript-eslint/consistent-type-definitions */
  export interface DefaultTheme {
    fonts: Record<string, string>;
    fontSizes: Record<string, string>;
    breakpoints: string[];
    mediaQueries: Record<string, string>;
    radii: Record<string, string>;
    shadows: Record<string, string>;
    colors: Record<string, Record<string, string>>;
  }
}

declare module '*.svg' {
  export const ReactComponent: React.FunctionComponent<
    React.SVGAttributes<SVGElement>
  >;
}

/*
 * Window type extension to support ethereum
 */
declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}
