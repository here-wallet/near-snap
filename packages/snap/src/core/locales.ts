import { number, string } from 'superstruct';
import { locales } from '../data/en';
import { InputAssertError, accountId, inputAssert, url } from './validations';

export const asserts: Record<string, (v: string) => void> = {
  URL: (value: string) => inputAssert(value, url()),
  ACCOUNT: (value: string) => inputAssert(value, accountId()),
  NUMBER: (value: string) => inputAssert(Number(value), number()),
  STRING: (value: string) => inputAssert(value, string()),
};

export const t = (key: string, ...args: any[]) => {
  const path = key.split('.');
  const txt: string = path.reduce(
    (root: any, k) => (typeof root === 'object' ? root[k] : null),
    locales,
  );

  if (!txt) {
    return key;
  }

  let index = -1;
  return txt.replaceAll(
    /\$\{([a-zA-Z]+)\}/gu,
    (_: any, validateName: string) => {
      if (!(typeof asserts[validateName] === 'function')) {
        throw new InputAssertError(
          `Unknown i18n text validator: ${validateName}`,
        );
      }

      index += 1;
      asserts[validateName](args[index]);
      return args[index];
    },
  );
};
