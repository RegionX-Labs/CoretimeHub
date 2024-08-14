import { AssetType, ChainType } from '@/models';

export const assetType = (
  originChain: ChainType,
  destinationChain: ChainType
): AssetType => {
  if (
    (originChain === ChainType.CORETIME &&
      destinationChain === ChainType.REGIONX) ||
    (originChain === ChainType.REGIONX &&
      destinationChain === ChainType.CORETIME)
  )
    return AssetType.REGION;
  else return AssetType.TOKEN;
};
