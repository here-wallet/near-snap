import { useContext, useEffect, useState } from 'react';
import { NearSnapStatus } from '@near-snap/sdk';
import { toast } from 'react-toastify';

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

export const TGAS = Math.pow(10, 12);

const Index = () => {
  const context = useContext(MetaMaskContext);
  const { installSnap, connectWallet, disconnectWallet } = context;
  const { error, status, snap, account } = context;
  const [messages, setMessages] = useState<any[]>([]);
  const [value, setValue] = useState('');

  const swithTo = account?.network === 'mainnet' ? 'testnet' : 'mainnet';
  const contractId =
    account?.network === 'mainnet' ? 'guest-book.near' : 'guest-book.testnet';

  useEffect(() => {
    if (!account) {
      return;
    }

    account
      .viewFunction({ contractId, methodName: 'getMessages' })
      .then(setMessages);
  }, [account]);

  const signMessage = async () => {
    try {
      const signed = await account?.authenticate('Near Snap', value);
      setValue('');
      toast(`Signed by ${signed?.accountId}`);
    } catch (e) {
      toast(JSON.stringify(e));
    }
  };

  const sendMessage = async () => {
    const executing = account?.executeTransaction({
      receiverId: contractId,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: 'addMessage',
            args: { text: value },
            gas: String(30 * TGAS),
            deposit: '0',
          },
        },
      ],
    });

    if (!executing) {
      return;
    }

    toast.promise(executing, {
      pending: 'Transaction is pending',
      error: {
        pauseOnHover: true,
        render({ data }: any) {
          try {
            return JSON.stringify(data);
          } catch {
            return 'Failed!';
          }
        },
      },
      success: {
        render() {
          const msg = { sender: account?.accountId, text: value };
          setMessages((t) => [...t, msg]);
          setValue('');
          return 'Success!';
        },
      },
    });
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

      <CardContainer style={{ marginTop: 32 }}>
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
              button: (
                <div style={{ display: 'flex', gap: 16, marginTop: 'auto' }}>
                  <Button
                    style={{ flex: 1 }}
                    onClick={() => connectWallet('mainnet')}
                  >
                    Mainnet
                  </Button>
                  <Button
                    style={{ flex: 1 }}
                    onClick={() => connectWallet('testnet')}
                  >
                    Testnet
                  </Button>
                </div>
              ),
            }}
          />
        )}

        {account && (
          <>
            <Card
              content={{
                title: 'Hello',
                description: account.accountId,
                button: <Button onClick={disconnectWallet}>Disconnect</Button>,
              }}
            />
            <Card
              content={{
                title: 'Switch network',
                description: 'Near Snap support mainnet and testnet, try both!',
                button: (
                  <Button onClick={() => connectWallet(swithTo)}>
                    To {swithTo}
                  </Button>
                ),
              }}
            />
          </>
        )}

        {account && (
          <div style={{ marginTop: 32 }}>
            <Heading>Guest book</Heading>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                gap: 8,
              }}
            >
              <input
                value={value}
                style={{ flex: 1 }}
                onChange={(e) => setValue(e.target.value)}
              />

              <Button style={{ width: 80 }} onClick={sendMessage}>
                Send
              </Button>
              <Button style={{ width: 80 }} onClick={signMessage}>
                Sign
              </Button>
            </div>

            <CardContainer>
              {messages
                .map((m, index) => ({ ...m, index }))
                .reverse()
                .map((msg) => (
                  <Card
                    key={msg.index}
                    style={{ flex: 1, gap: 8 }}
                    content={{ title: msg.sender, description: msg.text }}
                  />
                ))}
            </CardContainer>
          </div>
        )}
      </CardContainer>
    </Container>
  );
};

export default Index;
