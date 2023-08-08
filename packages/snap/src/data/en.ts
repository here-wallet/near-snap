/* eslint-disable no-template-curly-in-string */
export const locales = {
  needActivation: {
    title: 'You need to activate your account.',
    text: '**Send 0.1 NEAR** to **your ${0} address** to have your account appear on the blockchain.',
    info: "**Without this, you won't be able to use dApps.** After sending, make sure that your balance has replenished.",
  },

  signMessage: {
    accessDenied: 'Access is denied',
    nonceNot32bytes: 'Expected nonce to be a 32 bytes buffer',
    header: 'Sign Message',
    site: 'Site **${0}**',
    recipient: 'Recipient:',
    account: 'Sign message with ${0} account: ',
    msgToBeSigned: 'Message to be signed:',
  },

  getAccount: {
    accessDenied: 'Access is denied. Call **near_connect** first',
  },

  getKeyPair: {
    privateNotDefined: 'Private key is not defined',
  },

  connectApp: {
    site: 'Site **${0}**',
    accessDenied: 'Access is denied',
    header: 'Asks for permission to connect:',
    allowMethods:
      '_You authorize the contract_ **${0}** _to call the following_ **not payable** _methods:_',
    allowAllMethods:
      '_You authorize the contract_ **${0}** _to call_ **all not payable methods**',
    askingPublicData: 'Asking for your public data:',
    yourTypeAddress: 'Your ${0} address:',
    yourPublicKey: 'Your public key:',
  },

  viewDelegate: {
    header: 'Sign Transaction',
    accessDenied: 'Access is denied',
    site: 'Site **${0}**',
    yourAccount: 'Your account: ${0} **${1}**',
    receiver: 'Receiver: **${0}**',
    gasFree: 'GAS Free:',
    gasFreeText: 'The commission of this transaction will be paid by **${0}**.',
  },

  viewTransactions: {
    site: 'Site **${0}**',
    header: 'Sign Transaction (${0}/${1})',
    yourAccount: 'Your account: ${0} **${1}**',
    receiver: 'Receiver: **${0}**',
    gasFree: 'GAS Free:',
    gasFreeText: 'The commission of this transaction will be paid by **${0}**.',
  },

  FunctionCall: {
    method: 'Method: **${0}**',
    deposit: 'Deposit: **${0}**',
    gas: 'Gas: **${0}** TGas',
    args: 'Args:',
  },

  Transfer: {
    deposit: 'Deposit: **${0}**',
  },

  DeleteKey: {
    key: 'Public key:',
  },

  AddKey: {
    fullAccess:
      '**WARNING! With this key you give access to all your NEAR account assets.**',
    key: 'Public key:',
    receiver: 'Receiver: **${0}**',
    allowance: 'Allowance: **${0}**',
    methods: 'Methods: **${0}**',
  },
};
