import { useContext } from 'react';
import { KeyPairEd25519 } from '@near-js/crypto/lib/key_pair_ed25519';
import { AddKeyAction } from '@near-wallet-selector/core';
import { NearSnapStatus } from '@near-snap/sdk';

import { MetaMaskContext } from '../metamask';
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
} from '../components';

const Index = () => {
  const { installSnap, connectWallet, setError, error, status, snap, account } =
    useContext(MetaMaskContext);

  const handleSignTransactionClick = async () => {
    try {
      const keyPair = KeyPairEd25519.fromRandom();
      const addKey: AddKeyAction = {
        type: 'AddKey',
        params: {
          publicKey: keyPair.publicKey.toString(),
          accessKey: {
            permission: { receiverId: 'herewallet.testnet' },
          },
        },
      };

      await account?.signAndSendTransactions([
        {
          receiverId: account.target.accountId,
          actions: [addKey],
        },
      ]);
    } catch (e) {
      console.error(e);
      setError(e);
    }
  };

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
            fullWidth
          />
        )}

        {status === NearSnapStatus.NOT_INSTALLED && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the Near Snap.',
              button: (
                <MetamaskButton onClick={installSnap}>Connect</MetamaskButton>
              ),
            }}
          />
        )}

        {status === NearSnapStatus.INSTALLED && snap.isLocal && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <MetamaskButton onClick={installSnap}>Reconnect</MetamaskButton>
              ),
            }}
          />
        )}

        <Card
          disabled={status !== NearSnapStatus.INSTALLED}
          fullWidth={status === NearSnapStatus.INSTALLED && !snap.isLocal}
          content={{
            title: 'Connect wallet',
            description:
              'Display a NEAR Protocol address within a confirmation screen in MetaMask.',
            button: <Button onClick={connectWallet}>Connect</Button>,
          }}
        />

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
      </CardContainer>
    </Container>
  );
};

export default Index;
