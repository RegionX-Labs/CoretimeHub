export const XCM_VERSION = 3;

export const CoretimeChain = {
  parents: 1,
  interior: {
    X1: {
      Parachain: 1005,
    },
  },
};

export const ContractsChain = {
  parents: 1,
  interior: {
    X1: {
      Parachain: 2000,
    },
  },
};

export const CoretimeRegionFromCoretimePerspective = {
  parents: 0,
  interior: {
    X1: {
      PalletInstance: 50,
    },
  },
};

export const CoretimeRegionFromContractsPerspective = {
  parents: 1,
  interior: {
    X2: [{ Parachain: 1005 }, { PalletInstance: 50 }],
  },
};
