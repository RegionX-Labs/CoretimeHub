import { SAFE_XCM_VERSION } from '@/models';

export const versionWrap = (xcm: any) => {
  return {
    [`V${SAFE_XCM_VERSION}`]: xcm,
  };
};

export const nonFungibleAsset = (assetLocation: any, index: string) => {
  return {
    id: {
      Concrete: assetLocation,
    },
    fun: {
      NonFungible: {
        Index: index,
      },
    },
  };
};

export const fungibleAsset = (assetLocation: any, amount: string) => {
  return {
    id: {
      Concrete: assetLocation,
    },
    fun: {
      Fungible: amount,
    },
  };
};
