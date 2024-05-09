import { BROKER_PALLET_ID, CORETIME_PARA_ID, REGIONX_PARA_ID } from '@/models';

export const CoretimeChain = {
  parents: 1,
  interior: {
    X1: {
      Parachain: CORETIME_PARA_ID,
    },
  },
};

export const CoretimeChainFromRelayPerspective = {
  parents: 0,
  interior: {
    X1: {
      Parachain: CORETIME_PARA_ID,
    },
  },
};

export const RegionXChain = {
  parents: 1,
  interior: {
    X1: {
      Parachain: REGIONX_PARA_ID,
    },
  },
};

export const CoretimeRegionFromCoretimePerspective = {
  parents: 0,
  interior: {
    X1: {
      PalletInstance: BROKER_PALLET_ID,
    },
  },
};

export const CoretimeRegionFromRegionXPerspective = {
  parents: 1,
  interior: {
    X2: [{ Parachain: CORETIME_PARA_ID }, { PalletInstance: BROKER_PALLET_ID }],
  },
};

export const RelayChainFromParachainPerspective = {
  parents: 1,
  interior: 'Here',
};

export const RcTokenFromParachainPerspective = {
  parents: 1,
  interior: 'Here',
};

export const RcTokenFromRelayPerspective = {
  parents: 0,
  interior: 'Here',
};
