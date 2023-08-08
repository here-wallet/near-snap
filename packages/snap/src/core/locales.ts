import { locales } from '../data/en';

export const t = (key: string, ...args: any[]) => {
  const path = key.split('.');
  const txt = path.reduce(
    (root: any, k) => (typeof root === 'object' ? root[k] : null),
    locales,
  );

  return txt.replaceAll(
    /\$\{(\d+)\}/gu,
    (_: any, i: number) => args[Number(i)],
  );
};
