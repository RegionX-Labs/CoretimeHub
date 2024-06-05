import { NetworkType } from '@/models';

export const CORETIME_API = {
  [NetworkType.ROCOCO]: process.env.ROCOCO_CORETIME_API ?? '',
  [NetworkType.KUSAMA]: process.env.KUSAMA_CORETIME_API ?? '',
  [NetworkType.NONE]: '',
};

export const SUBSCAN_URL = {
  [NetworkType.ROCOCO]: 'https://rococo.subscan.io',
  [NetworkType.KUSAMA]: 'https://kusama.subscan.io',
  [NetworkType.NONE]: '',
};
