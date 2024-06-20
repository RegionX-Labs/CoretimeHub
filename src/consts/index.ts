import { NetworkType } from '@/models';

export const SUBSCAN_CORETIME_API = {
  [NetworkType.ROCOCO]: process.env.SUBSCAN_CORETIME_ROCOCO_API ?? '',
  [NetworkType.KUSAMA]: process.env.SUBSCAN_CORETIME_KUSAMA_API ?? '',
  [NetworkType.NONE]: '',
};

export const SUBSCAN_URL = {
  [NetworkType.ROCOCO]: 'https://rococo.subscan.io',
  [NetworkType.KUSAMA]: 'https://kusama.subscan.io',
  [NetworkType.NONE]: '',
};

export const WS_ROCOCO_RELAY_CHAIN = process.env.WS_ROCOCO_RELAY_CHAIN ?? '';
export const WS_KUSAMA_RELAY_CHAIN = process.env.WS_KUSAMA_RELAY_CHAIN ?? '';
export const WS_ROCOCO_CORETIME_CHAIN =
  process.env.WS_ROCOCO_CORETIME_CHAIN ?? '';
export const WS_KUSAMA_CORETIME_CHAIN =
  process.env.WS_KUSAMA_CORETIME_CHAIN ?? '';
export const WS_REGIONX_CHAIN = process.env.WS_REGIONX_CHAIN ?? '';
export const EXPERIMENTAL = process.env.EXPERIMENTAL == 'true' ? true : false;
