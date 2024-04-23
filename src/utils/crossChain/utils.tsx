import { SAFE_XCM_VERSION } from '@/models';

export const versionWrap = (xcm: any) => {
  return {
    [`V${SAFE_XCM_VERSION}`]: xcm,
  };
};

export const versionWrappeddNonfungibleAsset = (
  assetLocation: any,
  index: string
) => {
  return versionWrap([
    {
      id: {
        Concrete: assetLocation,
      },
      fun: {
        NonFungible: {
          Index: index,
        },
      },
    },
  ]);
};

export const versionWrappeddFungibleAsset = (
  assetLocation: any,
  amount: string
) => {
  return versionWrap([
    {
      id: {
        Concrete: assetLocation,
      },
      fun: {
        Fungible: amount,
      },
    },
  ]);
};
