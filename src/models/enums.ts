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

export enum RegionLocation {
  // eslint-disable-next-line no-unused-vars
  CORETIME_CHAIN,
  // eslint-disable-next-line no-unused-vars
  REGIONX_CHAIN,
  // eslint-disable-next-line no-unused-vars
  MARKET,
}

export enum ISMPRecordStatus {
  // eslint-disable-next-line no-unused-vars
  AVAILABLE,
  // eslint-disable-next-line no-unused-vars
  PENDING,
  // eslint-disable-next-line no-unused-vars
  UNAVAILABLE,
}

export enum SalePhase {
  // eslint-disable-next-line no-unused-vars
  Interlude = 'Interlude phase',
  // eslint-disable-next-line no-unused-vars
  Leadin = 'Leadin phase',
  // eslint-disable-next-line no-unused-vars
  Regular = 'Fixed price phase',
}

export enum ParaState {
  // eslint-disable-next-line no-unused-vars
  RESERVED,
  // eslint-disable-next-line no-unused-vars
  ONBOARDING,
  // eslint-disable-next-line no-unused-vars
  ONDEMAND_PARACHAIN,
  // eslint-disable-next-line no-unused-vars
  IDLE_PARA,
  // eslint-disable-next-line no-unused-vars
  ACTIVE_PARA,
  // eslint-disable-next-line no-unused-vars
  ACTIVE_RENEWABLE_PARA,
  // eslint-disable-next-line no-unused-vars
  IN_WORKPLAN,
  // eslint-disable-next-line no-unused-vars
  LEASE_HOLDING,
  // eslint-disable-next-line no-unused-vars
  SYSTEM,
}

// eslint-disable-next-line no-unused-vars
export enum ContextStatus {
  // eslint-disable-next-line no-unused-vars
  UNINITIALIZED,
  // eslint-disable-next-line no-unused-vars
  LOADING,
  // eslint-disable-next-line no-unused-vars
  LOADED,
}
