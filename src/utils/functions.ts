import { ApiPromise } from '@polkadot/api';

import {
  CoreMask,
  OnChainRegionId,
  RELAY_CHAIN_BLOCK_TIME,
  Timestamp,
} from '@/models';

// parse human readable number string
export const parseHNString = (str: string): number => {
  return parseInt(str.replace(',', ''));
};

export const getBlockTimestamp = async (
  api: ApiPromise,
  height: number
): Promise<Timestamp> => {
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

export const stringifyOnChainId = (regionId: OnChainRegionId): string => {
  const { begin, core, mask } = regionId;
  return `${begin}-${core}-${mask}`;
};

export const parseOnChainId = (str: string): OnChainRegionId => {
  const strs = str.split('-');
  return {
    begin: Number(strs[0]),
    core: Number(strs[1]),
    mask: strs[2],
  } as OnChainRegionId;
};

export const countOne = (mask: CoreMask): number => {
  let count = 0;
  for (let i = 2; i < mask.length; ++i) {
    let v = parseInt(mask.slice(i, i + 1), 16);
    while (v > 0) {
      if (v & 1) ++count;
      v >>= 1;
    }
  }
  return count;
};
