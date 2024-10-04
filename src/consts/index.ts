import { NetworkType } from '@/models';

export const APP_NAME = 'coretime-hub';

export const API_CORETIME_INDEXER = {
  [NetworkType.POLKADOT]: process.env.POLKADOT_CORETIME_INDEXER ?? '',
  [NetworkType.KUSAMA]: process.env.KUSAMA_CORETIME_INDEXER ?? '',
  [NetworkType.PASEO]: process.env.PASEO_CORETIME_INDEXER ?? '',
  [NetworkType.ROCOCO]: process.env.ROCOCO_CORETIME_INDEXER ?? '',
  [NetworkType.WESTEND]: process.env.SUBSCAN_CORETIME_WESTEND_INDEXER ?? '',
  [NetworkType.NONE]: '',
};

export const API_CORETIME_DICT = {
  [NetworkType.POLKADOT]: process.env.POLKADOT_CORETIME_DICT ?? '',
  [NetworkType.KUSAMA]: process.env.KUSAMA_CORETIME_DICT ?? '',
  [NetworkType.PASEO]: process.env.PASEO_CORETIME_DICT ?? '',
  [NetworkType.ROCOCO]: process.env.ROCOCO_CORETIME_DICT ?? '',
  [NetworkType.WESTEND]: process.env.SUBSCAN_CORETIME_WESTEND_DICT ?? '',
  [NetworkType.NONE]: '',
};

export const API_COCOS_INDEXER = process.env.COCOS_INDEXER ?? '';

export const SUSBCAN_CORETIME_URL = {
  [NetworkType.POLKADOT]: 'https://coretime-polkadot.subscan.io',
  [NetworkType.KUSAMA]: 'https://coretime-kusama.subscan.io',
  [NetworkType.PASEO]: 'https://coretime-paseo.subscan.io',
  [NetworkType.ROCOCO]: 'https://coretime-rococo.subscan.io',
  [NetworkType.WESTEND]: 'https://coretime-westend.subscan.io',
  [NetworkType.NONE]: '',
};

export const SUSBCAN_RELAY_URL = {
  [NetworkType.POLKADOT]: 'https://polkadot.subscan.io',
  [NetworkType.KUSAMA]: 'https://kusama.subscan.io',
  [NetworkType.PASEO]: 'https://paseo.subscan.io',
  [NetworkType.ROCOCO]: 'https://rococo.subscan.io',
  [NetworkType.WESTEND]: 'https://westend.subscan.io/',
  [NetworkType.NONE]: '',
};

export const WS_POLKADOT_RELAY_CHAIN = process.env.WS_POLKADOT_RELAY_CHAIN ?? '';
export const WS_KUSAMA_RELAY_CHAIN = process.env.WS_KUSAMA_RELAY_CHAIN ?? '';
export const WS_PASEO_RELAY_CHAIN = process.env.WS_PASEO_RELAY_CHAIN ?? '';
export const WS_ROCOCO_RELAY_CHAIN = process.env.WS_ROCOCO_RELAY_CHAIN ?? '';
export const WS_WESTEND_RELAY_CHAIN = process.env.WS_WESTEND_RELAY_CHAIN ?? '';

export const WS_POLKADOT_CORETIME_CHAIN = process.env.WS_POLKADOT_CORETIME_CHAIN ?? '';
export const WS_KUSAMA_CORETIME_CHAIN = process.env.WS_KUSAMA_CORETIME_CHAIN ?? '';
export const WS_PASEO_CORETIME_CHAIN = process.env.WS_PASEO_CORETIME_CHAIN ?? '';
export const WS_ROCOCO_CORETIME_CHAIN = process.env.WS_ROCOCO_CORETIME_CHAIN ?? '';
export const WS_WESTEND_CORETIME_CHAIN = process.env.WS_WESTEND_CORETIME_CHAIN ?? '';

export const WS_REGIONX_COCOS_CHAIN = process.env.WS_REGIONX_COCOS_CHAIN ?? '';
export const EXPERIMENTAL = process.env.EXPERIMENTAL == 'true' ? true : false;
