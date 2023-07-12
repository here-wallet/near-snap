import { ComponentProps, useContext } from 'react';
import styled from 'styled-components';
import { NearSnapStatus } from '@near-snap/sdk';

import { ReactComponent as FlaskFox } from '../assets/flask_fox.svg';
import { MetaMaskContext } from '../metamask';

const Link = styled.a`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.theme.fontSizes.small};
  border-radius: ${(props) => props.theme.radii.button};
  border: 1px solid ${(props) => props.theme.colors.background.inverse};
  background-color: ${(props) => props.theme.colors.background.inverse};
  color: ${(props) => props.theme.colors.text.inverse};
  text-decoration: none;
  font-weight: bold;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: transparent;
    border: 1px solid ${(props) => props.theme.colors.background.inverse};
    color: ${(props) => props.theme.colors.text.default};
  }

  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    box-sizing: border-box;
  }
`;

const SButton = styled.button`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  margin-top: auto;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
  }
`;

const ButtonText = styled.span`
  margin-left: 1rem;
`;

const ConnectedContainer = styled.div`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.theme.fontSizes.small};
  border-radius: ${(props) => props.theme.radii.button};
  border: 1px solid ${(props) => props.theme.colors.background.inverse};
  background-color: ${(props) => props.theme.colors.background.inverse};
  color: ${(props) => props.theme.colors.text.inverse};
  font-weight: bold;
  padding: 1.2rem;
`;

const ConnectedIndicator = styled.div`
  content: ' ';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: green;
`;

export const InstallFlaskButton = () => (
  <Link href="https://metamask.io/flask/" target="_blank">
    <FlaskFox />
    <ButtonText>Install MetaMask Flask</ButtonText>
  </Link>
);

export const MetamaskButton = (
  props: ComponentProps<typeof SButton> & { children: string },
) => {
  return (
    <SButton {...props}>
      <FlaskFox />
      <ButtonText>{props.children}</ButtonText>
    </SButton>
  );
};

export const Button = (
  props: ComponentProps<typeof SButton> & { children: string },
) => {
  return <SButton {...props}>{props.children}</SButton>;
};

export const HeaderButtons = () => {
  const { status, snap, installSnap } = useContext(MetaMaskContext);

  if (status === null || status === NearSnapStatus.NOT_SUPPORTED) {
    return <InstallFlaskButton />;
  }

  if (status === NearSnapStatus.NOT_INSTALLED) {
    return <MetamaskButton onClick={installSnap}>Install</MetamaskButton>;
  }

  if (status === NearSnapStatus.INSTALLED && snap.isLocal) {
    return <MetamaskButton onClick={installSnap}>Reinstall</MetamaskButton>;
  }

  return (
    <ConnectedContainer>
      <ConnectedIndicator />
      <ButtonText>Installed</ButtonText>
    </ConnectedContainer>
  );
};
