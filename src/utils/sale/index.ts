import { Timeslice } from 'coretime-utils';

import { BlockNumber, NetworkType, SaleInfo, SalePhase } from '@/models';

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
  blockNumber: BlockNumber,
  lastCommittedTimeslice: Timeslice,
  network: NetworkType
) => {
  const timeslicesUntilSaleEnd = saleInfo.regionBegin - lastCommittedTimeslice;
  return (
    blockNumber + rcBlockToParachainBlock(network, 80 * timeslicesUntilSaleEnd)
  );
};

// The price of a core at a specific block number.
export const getCorePriceAt = (
  blockNumber: number,
  saleInfo: SaleInfo,
  network: NetworkType
) => {
  const num = Math.min(blockNumber - saleInfo.saleStart, saleInfo.leadinLength);
  const through = num / saleInfo.leadinLength;

  return Number((leadinFactorAt(network, through) * saleInfo.price).toFixed());
};
