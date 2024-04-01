import { BROKER_PALLET_ID, CORETIME_CHAIN_PARA_ID } from "@/models";

export const CoretimeChain = {
  parents: 1,
  interior: {
    X1: {
      Parachain: CORETIME_CHAIN_PARA_ID,
    },
  },
};

export const ContractsChain = {
  parents: 1,
  interior: {
    X1: {
      Parachain: CORETIME_CHAIN_PARA_ID,
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

export const CoretimeRegionFromContractsPerspective = {
  parents: 1,
  interior: {
    X2: [{ Parachain: CORETIME_CHAIN_PARA_ID }, { PalletInstance: BROKER_PALLET_ID }],
  },
};
