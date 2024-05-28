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

// The block number at which the sale starts, i.e., the leading phase.
export const getSaleStartInRelayBlocks = (
  saleInfo: SaleInfo,
  timeslicePeriod: number
) => {
  // We know that the previous sale started when the previous regions began. Assuming
  // the region duration doesn't change (which is a valid assumption), we can get the
  // sale start in timeslices by getting the region start of the previous sale.
  const regionDuration = saleInfo.regionEnd - saleInfo.regionBegin;
  return (saleInfo.regionBegin - regionDuration) * timeslicePeriod;
};

// The block number at which the sale ends, i.e., the end of the fixed price phase.
export const getSaleEndInRelayBlocks = (
  saleInfo: SaleInfo,
  timeslicePeriod: number
) => {
  return saleInfo.regionBegin * timeslicePeriod;
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
