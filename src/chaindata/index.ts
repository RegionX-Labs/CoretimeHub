import { NetworkType } from '@/models';

import KusamaChains from './kusama.json';
import leases from './leases.json';
import RococoChains from './rococo.json';

type ParachainRecord = {
  name: string;
  paraId: number;
};

const transformData = (data: ParachainRecord[]) => {
  const mapping: Record<number, string> = {};
  data.forEach(({ paraId, name }) => {
    mapping[paraId] = name;
  });
  return mapping;
};

const chainData = {
  [NetworkType.NONE]: {} as Record<number, string>,
  [NetworkType.KUSAMA]: transformData(KusamaChains),
  [NetworkType.ROCOCO]: transformData(RococoChains),
};

export { chainData, leases };
