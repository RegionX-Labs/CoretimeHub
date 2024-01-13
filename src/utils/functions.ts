import { ApiPromise } from '@polkadot/api';

import {
  RELAY_CHAIN_BLOCK_TIME,
} from '@/models';
import { OnChainRegionId } from 'coretime-utils';

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
    const hash = await api.rpc.chain.getBlockHash(height);
    const apiAt = await api.at(hash);
    const timestamp = Number((await apiAt.query.timestamp.now()).toJSON());
    return timestamp;
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
}
