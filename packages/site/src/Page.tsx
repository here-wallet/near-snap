import { useContext } from 'react';
import { KeyPairEd25519 } from '@near-js/crypto/lib/key_pair_ed25519';
import { AddKeyAction } from '@near-wallet-selector/core';
import { NearSnapStatus } from '@near-snap/sdk';

import { MetaMaskContext } from './metamask';
import {
  InstallFlaskButton,
  Card,
  Container,
  Heading,
  Subtitle,
  CardContainer,
  ErrorMessage,
  Span,
  MetamaskButton,
  Button,
} from './components';

const Index = () => {
  const context = useContext(MetaMaskContext);
  const { installSnap, connectWallet, disconnectWallet, setError } = context;
  const { error, status, snap, account } = context;

  const handleSignTransactionClick = async () => {
    try {
      const keyPair = KeyPairEd25519.fromRandom();
      const addKey: AddKeyAction = {
        type: 'AddKey',
        params: {
          publicKey: keyPair.publicKey.toString(),
          accessKey: {
            permission: { receiverId: 'storage.herewallet.near' },
          },
        },
      };

      await account?.executeTransaction({
        receiverId: account.accountId,
        actions: [addKey],
      });
    } catch (e) {
      console.error(e);
      setError(e);
    }
  };

  if (status === null) {
    return (
      <Container>
        <Heading>
          Welcome to <Span>near-snap</Span>
        </Heading>
        <Subtitle>Interact with NEAR Protocol in your Metamask easy</Subtitle>
        <CardContainer>
          {error && (
            <ErrorMessage>
              <b>An error happened:</b> {error.message}
            </ErrorMessage>
          )}
        </CardContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Heading>
        Welcome to <Span>near-snap</Span>
      </Heading>
      <Subtitle>Interact with NEAR Protocol in your Metamask easy</Subtitle>
      <CardContainer>
        {error && (
          <ErrorMessage>
            <b>An error happened:</b> {error.message}
          </ErrorMessage>
        )}

        {status === NearSnapStatus.NOT_SUPPORTED && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
          />
        )}

        {status === NearSnapStatus.NOT_INSTALLED && (
          <Card
            content={{
              title: 'Install Snap',
              description:
                'Get started by connecting to and installing the Near Snap.',
              button: (
                <MetamaskButton onClick={installSnap}>
                  Install Snap
                </MetamaskButton>
              ),
            }}
          />
        )}

        {status === NearSnapStatus.INSTALLED && snap.isLocal && (
          <Card
            content={{
              title: 'Reinstall',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <MetamaskButton onClick={installSnap}>Reinstall</MetamaskButton>
              ),
            }}
          />
        )}

        {account === null && (
          <Card
            disabled={status !== NearSnapStatus.INSTALLED}
            content={{
              title: 'Connect wallet',
              description:
                'Display a NEAR Protocol address within a confirmation screen in MetaMask.',
              button: <Button onClick={connectWallet}>Connect</Button>,
            }}
          />
        )}

        {account !== null && (
          <Card
            content={{
              title: 'Hello',
              description: account.accountId,
              button: <Button onClick={disconnectWallet}>Disconnect</Button>,
            }}
          />
        )}

        <Card
          disabled={!account}
          content={{
            title: 'Sign transaction',
            description:
              'Sign a NEAR Protocol transaction within a confirmation screen in MetaMask.',
            button: (
              <Button onClick={handleSignTransactionClick} disabled={!account}>
                Sign transaction
              </Button>
            ),
          }}
        />

        <Card
          disabled
          content={{
            title: 'Sign message',
            description:
              'Sign a NEAR Protocol message within a confirmation screen in MetaMask.',
            button: <Button disabled>Sign message</Button>,
          }}
        />
      </CardContainer>
    </Container>
  );
};

export default Index;
