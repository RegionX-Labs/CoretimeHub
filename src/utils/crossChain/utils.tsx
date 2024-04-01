import { SAFE_XCM_VERSION } from '@/models';

export const versionedWrap = (xcm: any) => {
  return {
    [`V${SAFE_XCM_VERSION}`]: xcm,
  };
};

export const versionedNonfungibleAssetWrap = (
  assetLocation: any,
  index: string
) => {
  return versionedWrap([
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
