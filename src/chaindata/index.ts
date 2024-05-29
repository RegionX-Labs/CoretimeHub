import { NetworkType } from '@/models';

import KusamaChains from './kusama';
import leases from './leases.json';
import RococoChains from './rococo';
import { BaseChainInfo, ChainDetails } from './types';

const transformData = (data: ChainDetails[]): Record<number, BaseChainInfo> => {
  const mapping: Record<number, BaseChainInfo> = {};
  data.forEach(({ paraId, text, ui: { logo }, homepage }) => {
    mapping[paraId] = { name: text, logo, homepage };
  });
  return mapping;
};

const chainData: Record<NetworkType, Record<number, BaseChainInfo>> = {
  [NetworkType.KUSAMA]: transformData(KusamaChains),
  [NetworkType.ROCOCO]: transformData(RococoChains),
};

export { chainData, leases };
