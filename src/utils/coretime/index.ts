// TODO: should be queried from runtime api instead.
//
// https://github.com/paritytech/polkadot-sdk/pull/3485

import { RegionId } from 'coretime-utils';

export const leadinFactorAt = (network: any, when: number) => {
  if (network === 'rococo') return 2 - when;
  else {
    return 5 - 4 * when;
  }
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
    mask: ('0x' + mask.toString(16)).padEnd(22, '0'),
  };
};

export const rcBlockToParachainBlock = (
  network: any,
  blockNumber: number
): number => {
  // Coretime on Rococo has async backing and due to this it has a block time of 6 seconds.
  return network == 'rococo' ? blockNumber : Math.floor(blockNumber / 2);
};
