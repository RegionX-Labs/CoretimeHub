import { NetworkType } from '@/models';

import KusamaChains from './kusama';
import leases from './leases.json';
import PolkadotChains from './polkadot';
import PaseoChains from './paseo';
import RococoChains from './rococo';
import { BaseChainInfo, ChainDetails } from './types';
import WestendChains from './westend';

const transformData = (data: ChainDetails[]): Record<number, BaseChainInfo> => {
  const mapping: Record<number, BaseChainInfo> = {};
  data.forEach(({ paraId, text, ui: { logo }, homepage }) => {
    mapping[paraId] = { name: text, logo, homepage };
  });
  return mapping;
};

const chainData: Record<NetworkType, Record<number, BaseChainInfo>> = {
  [NetworkType.POLKADOT]: transformData(PolkadotChains),
  [NetworkType.KUSAMA]: transformData(KusamaChains),
  [NetworkType.PASEO]: transformData(PaseoChains),
  [NetworkType.ROCOCO]: transformData(RococoChains),
  [NetworkType.WESTEND]: transformData(WestendChains),
  [NetworkType.NONE]: transformData([]),
};

export { chainData, leases };
