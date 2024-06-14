import { NetworkType } from '@/models';

export const SUBSCAN_URL = {
  [NetworkType.ROCOCO]: process.env.SUBSCAN_CORETIME_ROCOCO ?? '',
  [NetworkType.KUSAMA]: process.env.SUBSCAN_CORETIME_KUSAMA ?? '',
  [NetworkType.NONE]: '',
};
