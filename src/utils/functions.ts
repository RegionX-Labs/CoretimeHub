import { ApiPromise } from '@polkadot/api';

import { CoreMask, Timestamp } from '@/models';

// parse human readable number string
export const parseHNString = (str: string): number => {
  return parseInt(str.replace(',', ''));
};

export const getBlockTimestamp = async (
  api: ApiPromise,
  height: number
): Promise<Timestamp> => {
  const hash = await api.rpc.chain.getBlockHash(height);
  const apiAt = await api.at(hash);
  const timestamp = Number((await apiAt.query.timestamp.now()).toJSON());
  return timestamp;
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
  console.log(count);
  return count;
};
