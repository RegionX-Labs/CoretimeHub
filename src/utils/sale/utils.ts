import { Timeslice } from 'coretime-utils';

import { leadinFactorAt, rcBlockToParachainBlock } from '@/utils/functions';

import { BlockNumber, SaleConfig, SaleInfo, SalePhase } from '@/models';

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

export const getSaleStartInBlocks = (saleInfo: SaleInfo) => {
  // `saleInfo.saleStart` defines the start of the leadin phase.
  // However, we want to account for the interlude period as well.
  return saleInfo.saleStart;
};

export const getSaleEndInBlocks = (
  saleInfo: SaleInfo,
  blockNumber: BlockNumber,
  lastCommittedTimeslice: Timeslice,
  network: any
) => {
  const timeslicesUntilSaleEnd = saleInfo.regionBegin - lastCommittedTimeslice;
  return (
    blockNumber + rcBlockToParachainBlock(network, 80 * timeslicesUntilSaleEnd)
  );
};

// Returns a range between 0 and 100.
export const getSaleProgress = (
  saleInfo: SaleInfo,
  config: SaleConfig,
  blockNumber: number,
  lastCommittedTimeslice: number,
  network: any
): number => {
  const start = getSaleStartInBlocks(saleInfo) - config.interludeLength;
  const end = getSaleEndInBlocks(
    saleInfo,
    blockNumber,
    lastCommittedTimeslice,
    network
  );

  const saleDuration = end - start;
  const elapsed = blockNumber - start;

  const progress = elapsed / saleDuration;
  return Number((progress * 100).toFixed(2));
};

export const getCurrentPrice = (
  saleInfo: SaleInfo,
  blockNumber: number,
  network: any
) => {
  const num = Math.min(blockNumber - saleInfo.saleStart, saleInfo.leadinLength);
  const through = num / saleInfo.leadinLength;

  return Number((leadinFactorAt(network, through) * saleInfo.price).toFixed());
};
