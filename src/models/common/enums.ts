export enum AssetType {
  // eslint-disable-next-line no-unused-vars
  NONE = 0,
  // eslint-disable-next-line no-unused-vars
  TOKEN = 1,
  // eslint-disable-next-line no-unused-vars
  REGION = 2,
}

export enum ChainType {
  // eslint-disable-next-line no-unused-vars
  NONE = 0,
  // eslint-disable-next-line no-unused-vars
  CORETIME = 1,
  // eslint-disable-next-line no-unused-vars
  RELAY = 2,
  // eslint-disable-next-line no-unused-vars
  REGIONX = 3,
}

export enum NetworkType {
  // eslint-disable-next-line no-unused-vars
  ROCOCO = 'rococo',
  // eslint-disable-next-line no-unused-vars
  KUSAMA = 'kusama',
  // eslint-disable-next-line no-unused-vars
  NONE = 'none',
}

export enum FinalityType {
  // eslint-disable-next-line no-unused-vars
  FINAL = 'Final',
  // eslint-disable-next-line no-unused-vars
  PROVISIONAL = 'Provisional',
}

// eslint-disable-next-line no-unused-vars
export enum ContextStatus {
  // eslint-disable-next-line no-unused-vars
  UNINITIALIZED = 'uninitialized',
  // eslint-disable-next-line no-unused-vars
  LOADING = 'loading',
  // eslint-disable-next-line no-unused-vars
  LOADED = 'loaded',
  // eslint-disable-next-line no-unused-vars
  ERROR = 'error',
}
