/* eslint-disable no-template-curly-in-string */
export const locales = {
  needActivation: {
    title: 'You need to activate your account.',
    text: '**Send 0.1 NEAR** to **your ${ACCOUNT} address** to have your account appear on the blockchain.',
    info: "**Without this, you won't be able to use dApps.** After sending, make sure that your balance has replenished.",
  },

  notify: {
    silentFunctionCall: 'Call ${STRING} for ${ACCOUNT}',
  },

  signMessage: {
    site: 'Site **${URL}**',
    header: 'Sign Message',
    recipient: 'Recipient:',
    msgToBeSigned: 'Message to be signed:',
    nonceNot32bytes: 'Expected nonce to be a 32 bytes buffer',
    account: 'Sign message with **${ACCOUNT}** account: ',
    accessDenied: 'Access is denied',
  },

  getAccount: {
    accessDenied: 'Access is denied. Call **near_connect** first',
  },

  getKeyPair: {
    privateNotDefined: 'Private key is not defined',
  },

  connectApp: {
    site: 'Site **${URL}**',
    accessDenied: 'Access is denied',
    header: 'Asks for permission to connect:',
    authorizeContract: 'You authorize the contract:',
    allowMethods: 'To call the following **not payable** methods:',
    allowAllMethods: 'To call **all not payable methods!**',
    askingPublicData: 'Asking for your public data:',
    yourTypeAddress: 'Your **${ACCOUNT}** address:',
    yourPublicKey: 'Your public key:',
  },

  viewDelegate: {
    site: 'Site **${URL}**',
    header: 'Sign Transaction',
    accessDenied: 'Access is denied',
    balance: 'Account balance: **${NUMBER} NEAR**',
    yourAccount: 'Your **${ACCOUNT}** account:',
    receiver: 'Receiver:',
    gasFree: 'GAS Free:',
    gasFreeText:
      'The commission of this transaction will be paid by **${STRING}**.',
  },

  viewTransactions: {
    site: 'Site **${URL}**',
    header: 'Sign Transaction (${NUMBER}/${NUMBER})',
    yourAccount: 'Your **${ACCOUNT}** account:',
    balance: 'Account balance: **${NUMBER}** NEAR',
    receiver: 'Receiver:',
    gasFree: 'GAS Free:',
    gasFreeText:
      'The commission of this transaction will be paid by **${STRING}**.',
  },

  FunctionCall: {
    ftTransfer: 'Transfer ${STRING}',
    ftAmount: 'Amount: **${NUMBER} ${STRING}**',
    deposit: 'Deposit: **${NUMBER} NEAR**',
    yoctoDeposit: 'Deposit: **${NUMBER} YoctoNear**',
    method: 'Method: **${STRING}**',
    gas: 'Gas: **${NUMBER}** TGas',
    args: 'Args:',
  },

  Transfer: {
    deposit: 'Deposit: **${NUMBER} NEAR**',
    yoctoDeposit: 'Deposit: **${NUMBER} YoctoNear**',
  },

  DeleteKey: {
    key: 'Public key:',
  },

  AddKey: {
    fullAccess:
      '**WARNING! With this key you give access to all your NEAR account assets.**',
    key: 'Public key:',
    receiver: 'Receiver:',
    allowance: 'Allowance: **${NUMBER} NEAR**',
    methods: 'Methods:',
  },
};
