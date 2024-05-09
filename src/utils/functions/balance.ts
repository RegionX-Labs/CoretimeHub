import { ApiPromise } from '@polkadot/api';
import { formatBalance as polkadotFormatBalance } from '@polkadot/util';
import Decimal from 'decimal.js';

import { parseHNString } from './common';

export const formatBalance = (balance: string, decimals: number) => {
  Decimal.config({ rounding: Decimal.ROUND_DOWN });

  return polkadotFormatBalance(balance, {
    decimals,
    withUnit: false,
    withSiFull: true,
  });
};

export const fetchBalance = async (
  api: ApiPromise,
  address: string
): Promise<number> => {
  const coretimeAccount = (
    await api.query.system.account(address)
  ).toHuman() as any;

  return parseHNString(coretimeAccount.data.free.toString());
};
