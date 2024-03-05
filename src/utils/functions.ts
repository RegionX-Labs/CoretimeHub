import { ApiPromise } from '@polkadot/api';

import { RELAY_CHAIN_BLOCK_TIME, UNIT_DECIMALS } from '@/models';

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

export const formatBalance = (balance: number) => {
  return (balance / UNIT_DECIMALS).toPrecision(2);
};

// TODO: should be queried from runtime api instead.
export const leadinFactorAt = (when: number) => {
  return 2 - when;
};
