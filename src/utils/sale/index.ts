import { Timeslice } from 'coretime-utils';

import { NetworkType, SaleInfo, SalePhase } from '@/models';

import { leadinFactorAt, rcBlockToParachainBlock } from '../coretime';

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
export const getSaleStartInBlocks = (saleInfo: SaleInfo) => {
  return saleInfo.saleStart;
};

// The block number at which the sale ends, i.e., the end of the fixed price phase.
export const getSaleEndInBlocks = (
  saleInfo: SaleInfo,
  lastCommittedTimeslice: Timeslice,
  network: NetworkType
) => {
  const timeslicesUntilSaleEnd = saleInfo.regionBegin - lastCommittedTimeslice;
  return (
    saleInfo.saleStart +
    rcBlockToParachainBlock(network, 80 * timeslicesUntilSaleEnd)
  );
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
