import { ApiPromise } from '@polkadot/api';

import { NetworkType } from '@/models';

export const getBlockTimestamp = async (
  api: ApiPromise,
  height: number,
  network?: NetworkType
): Promise<number> => {
  try {
    const blockTime = network !== undefined ? getBlockTime(network) : 6 * 1000;
    const currentHeight = (await api.query.system.number()).toJSON() as number;
    const currentTimestamp = (await api.query.timestamp.now()).toJSON() as number;
    return currentTimestamp + (height - currentHeight) * blockTime;
  } catch {
    return 0;
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
  const currentHeight = (await api.query.system.number()).toJSON() as number;
  const now = (await api.query.timestamp.now()).toJSON() as number;
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

export const getBlockTime = (network: NetworkType): number => {
  // Coretime on Rococo has async backing and due to this it has a block time of 6 seconds.
  switch (network) {
    case NetworkType.ROCOCO:
      return 6 * 1000;
    case NetworkType.KUSAMA:
      return 12 * 1000;
    default:
      return 0;
  }
};
