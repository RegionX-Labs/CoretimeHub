import { ApiPromise } from '@polkadot/api';
import { formatBalance as polkadotFormatBalance } from '@polkadot/util';
import Decimal from 'decimal.js';

import { CORETIME_DECIMALS, REGIONX_DECIMALS } from '@/models';

import { parseHNString } from './common';

export const formatBalance = (balance: string, regionXChain: boolean) => {
  Decimal.config({ rounding: Decimal.ROUND_DOWN });
  const decimals = regionXChain ? REGIONX_DECIMALS : CORETIME_DECIMALS;

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
