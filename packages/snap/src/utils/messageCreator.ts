import { ActionWithParams, TransactionJson } from '../interfaces';

export type Message = {
  message: string;
  value: unknown | undefined;
};

export const messageCreator = (txArray: TransactionJson[]): string => {
  const messages: Message[] = [];
  for (const txData of txArray) {
    const msgTo = { message: 'to:', value: txData.receiverId };
    messages.push(msgTo);

    for (const txDataAction of txData.actions) {
      messages.push({
        message: 'Transaction data action:',
        value: txDataAction.type,
      });

      if ((txDataAction as unknown as ActionWithParams).params) {
        const { params } = txDataAction as unknown as ActionWithParams;
        for (const [key, value] of Object.entries(params)) {
          if (typeof value !== 'object') {
            messages.push({ message: `${key}: `, value });
            continue;
          }

          if (value === undefined || value === null) {
            continue;
          }

          messages.push({ message: `${key}: `, value: '' });
          for (const [keyDeep, valueDeep] of Object.entries(value)) {
            messages.push({
              message: `  ${keyDeep}: `,
              value: valueDeep,
            });
          }
        }
      }
    }
  }

  return messages.map(({ message, value }) => `${message} ${value}`).join('\n');
};
