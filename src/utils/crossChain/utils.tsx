import { XCM_VERSION } from './consts';

export const versionedWrap = (xcm: any) => {
  return {
    [`V${XCM_VERSION}`]: xcm,
  };
};

export const versionedNonfungibleAssetWrap = (
  assetLocation: any,
  index: string
) => {
  return versionedWrap({
    id: {
      Concrete: assetLocation,
    },
    fun: {
      NonFungible: {
        Index: index,
      },
    },
  });
};
