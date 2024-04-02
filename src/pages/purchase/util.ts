import { SaleInfo, SalePhase } from '@/models';

export const getCurrentPhase = (
  saleInfo: SaleInfo,
  blockNumber: number
): SalePhase => {
  if (saleInfo.saleStart > blockNumber) {
    return SalePhase.Interlude;
  } else if (saleInfo.saleStart + saleInfo.leadinLength > blockNumber) {
    return SalePhase.Leadin;
  } else {
    return SalePhase.Regular;
  }
};
