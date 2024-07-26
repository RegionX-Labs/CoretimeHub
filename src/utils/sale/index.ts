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
export const getCorePriceAt = (now: number, saleInfo: SaleInfo) => {
  /* NOTE: the runtime api is not implemented for Kusama.
  const salePrice = await coretimeApi.rpc.state.call('BrokerApi_sale_price', '');
  const price = coretimeApi.createType('Option<u128>', salePrice);
  */

  const { saleStart, leadinLength, price: endPrice } = saleInfo;

  const num = Math.min(now - saleStart, leadinLength);
  const through = num / leadinLength;

  const price = leadinFactorAt(through) * endPrice;
  return Number(price.toFixed());
};

export const isNewPricing = (now: number, network: NetworkType): boolean => {
  return (
    (network == NetworkType.KUSAMA && now >= 485639) ||
    (network == NetworkType.ROCOCO && now >= 1796462)
  );
};
