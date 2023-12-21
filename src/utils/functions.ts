import { ApiPromise } from '@polkadot/api';

import { CoreMaskString, Timestamp } from '@/models';

// decode core mask hex string into a Uint8Array
export const decodeMaskString = (
  strMask: CoreMaskString,
  len: number
): Uint8Array => {
  const mask = strMask.slice(2);
  const res = [];
  for (let i = 0; i < len; ++i) {
    res.push(parseInt(mask.slice(i * 2, i * 2 + 2), 16));
  }
  res.reverse();
  return new Uint8Array(res);
};

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
