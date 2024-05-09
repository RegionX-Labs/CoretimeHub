import { isHex } from '@polkadot/util';
import { validateAddress } from '@polkadot/util-crypto';

// parse human readable number string
export const parseHNString = (str: string): number => {
  return parseInt(parseHNStringToString(str));
};

export const parseHNStringToString = (str: string): string => {
  return str.replace(/,/g, '');
};

export const isValidAddress = (chainAddress: string, ss58Prefix = 42) => {
  if (isHex(chainAddress)) return false;
  try {
    validateAddress(chainAddress, true, ss58Prefix);
    return true;
  } catch {
    return false;
  }
};
