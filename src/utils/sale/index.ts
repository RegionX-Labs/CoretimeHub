import { NetworkType, SaleInfo, SalePhase } from '@/models';

import { leadinFactorAt } from '../coretime';

export const getCurrentPhase = (
  saleInfo: SaleInfo,
  blockNumber: number
): SalePhase => {
  if (blockNumber < saleInfo.saleStart) {
    return SalePhase.Interlude;
  } else if (blockNumber < saleInfo.saleStart + saleInfo.leadinLength) {
    return SalePhase.Leadin;
  } else {
    return SalePhase.Regular;
  }
};

// The price of a core at a specific block number.
export const getCorePriceAt = (
  blockNumber: number,
  saleInfo: SaleInfo,
  network: NetworkType
) => {
  const { saleStart, leadinLength, price } = saleInfo;
  const num = Math.min(blockNumber - saleStart, leadinLength);
  const through = num / leadinLength;

  return Number((leadinFactorAt(network, through) * price).toFixed());
};
