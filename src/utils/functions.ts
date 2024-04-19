import { ApiPromise } from '@polkadot/api';
import { formatBalance as polkadotFormatBalance } from '@polkadot/util';
import { CoreMask, RegionId } from 'coretime-utils';
import Decimal from 'decimal.js';

import {
  CORETIME_DECIMALS,
  REGIONX_DECIMALS,
  RELAY_CHAIN_BLOCK_TIME,
} from '@/models';

// parse human readable number string
export const parseHNString = (str: string): number => {
  return parseInt(parseHNStringToString(str));
};

export const parseHNStringToString = (str: string): string => {
  return str.replace(/,/g, '');
};

export const getBlockTimestamp = async (
  api: ApiPromise,
  height: number
): Promise<number> => {
  const [resHeight, resTimestamp] = await Promise.all([
    api.query.system.number(),
    api.query.timestamp.now(),
  ]);
  const currentHeight = parseHNString(resHeight.toString());
  const currentTimestamp = parseHNString(resTimestamp.toString());
  if (height <= currentHeight) {
    try {
      const hash = await api.rpc.chain.getBlockHash(height);
      const apiAt = await api.at(hash);
      const timestamp = Number((await apiAt.query.timestamp.now()).toJSON());
      return timestamp;
    } catch (_) {
      return (
        currentTimestamp - (currentHeight - height) * RELAY_CHAIN_BLOCK_TIME
      );
    }
  } else {
    return currentTimestamp + (height - currentHeight) * RELAY_CHAIN_BLOCK_TIME;
  }
};

export const timesliceToTimestamp = async (
  api: ApiPromise,
  timeslice: number,
  timeslicePeriod: number
): Promise<number> => {
  const blockHeight = timeslice * timeslicePeriod;
  const timestamp = await getBlockTimestamp(api, blockHeight);

  return timestamp;
};

export const timestampToTimeslice = async (
  api: ApiPromise,
  timestamp: EpochTimeStamp,
  timeslicePeriod: number
): Promise<number> => {
  // We have the current block number and the corresponding timestamp.
  // Assume that 1 block ~ 6 seconds..
  const [resHeight, resTimestamp] = await Promise.all([
    api.query.system.number(),
    api.query.timestamp.now(),
  ]);
  const currentHeight = parseHNString(resHeight.toString());
  const now = parseHNString(resTimestamp.toString());
  if (now > timestamp) {
    // timestamps are in millis
    const diffInBlocks = currentHeight - (now - timestamp) / 6000;
    return diffInBlocks / timeslicePeriod;
  } else {
    // timestamps are in millis
    const diffInBlocks = currentHeight + (timestamp - now) / 6000;
    return diffInBlocks / timeslicePeriod;
  }
};

export const formatBalance = (balance: string, regionXChain: boolean) => {
  Decimal.config({ rounding: Decimal.ROUND_DOWN });
  const decimals = regionXChain ? REGIONX_DECIMALS : CORETIME_DECIMALS;

  return polkadotFormatBalance(balance, {
    decimals,
    withUnit: false,
    withSiFull: true,
  });
};

// TODO: should be queried from runtime api instead.
//
// https://github.com/paritytech/polkadot-sdk/pull/3485
export const leadinFactorAt = (when: number) => {
  return 2 - when;
};

export const extractRegionIdFromRaw = (rawRegionId: bigint): RegionId => {
  // Extract 'begin' (top 32 bits) and explicitly cast to number
  const begin = Number(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (rawRegionId >> BigInt(96)) & BigInt(0xffffffff)
  );

  // Extract 'core' (next 16 bits) and explicitly cast to number
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const core = Number((rawRegionId >> BigInt(80)) & BigInt(0xffff));

  // Extract 'mask' (lowest 80 bits)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const mask: bigint = rawRegionId & BigInt('0xFFFFFFFFFFFFFFFFFFFF');

  return {
    begin,
    core,
    mask: new CoreMask(('0x' + mask.toString(16)).padEnd(22, '0')),
  };
};

export const fetchBalance = async (api: ApiPromise, address: string): Promise<number> => {
  const coretimeAccount = (
    await api.query.system.account(address)
  ).toHuman() as any;

  return parseHNString(coretimeAccount.data.free.toString());
}
