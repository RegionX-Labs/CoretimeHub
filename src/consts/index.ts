import { NetworkType } from '@/models';

export const APP_NAME = 'Corehub';

export const SUBSCAN_CORETIME_API = {
  [NetworkType.ROCOCO]: process.env.SUBSCAN_CORETIME_ROCOCO_API ?? '',
  [NetworkType.KUSAMA]: process.env.SUBSCAN_CORETIME_KUSAMA_API ?? '',
  [NetworkType.NONE]: '',
};

export const SUSBCAN_CORETIME_URL = {
  [NetworkType.ROCOCO]: 'https://coretime-rococo.subscan.io',
  [NetworkType.KUSAMA]: 'https://coretime-kusama.subscan.io',
  [NetworkType.NONE]: '',
};

export const SUSBCAN_RELAY_URL = {
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
export const WS_REGIONX_COCOS_CHAIN = process.env.WS_REGIONX_COCOS_CHAIN ?? '';
export const EXPERIMENTAL = process.env.EXPERIMENTAL == 'true' ? true : false;
