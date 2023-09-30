import { number, string } from 'superstruct';
import { locales } from '../data/en';
import { InputAssertError, accountId, inputAssert, url } from './validations';

export const formats: Record<string, (v: string) => string> = {
  URL: (value: string) => {
    inputAssert(value, url());
    return value;
  },

  ACCOUNT: (value: string) => {
    inputAssert(value, accountId());
    return value;
  },

  NUMBER: (value: string) => {
    inputAssert(Number(value), number());
    return Number(value).toString();
  },

  STRING: (value: string) => {
    inputAssert(value, string());
    return value
      .replace(/[\r\n]/gmu, '')
      .replace(/\s+/gu, ' ')
      .trim();
  },
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
      if (typeof formats[validateName] !== 'function') {
        throw new InputAssertError(
          `Unknown i18n text formatter: ${validateName}`,
        );
      }

      index += 1;
      return formats[validateName](args[index]);
    },
  );
};
