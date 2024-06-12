import { NetworkType, SaleInfo, SalePhase } from '@/models';

import { leadinFactorAt, leadinFactorAtLegacy } from '../coretime';

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
  now: number,
  saleInfo: SaleInfo,
  network: NetworkType
) => {
  /* NOTE: the runtime api is not implemented for Kusama.
  const salePrice = await coretimeApi.rpc.state.call('BrokerApi_sale_price', '');
  const price = coretimeApi.createType('Option<u128>', salePrice);
  */

  if (!isNewPricing(now, network)) {
    return getCorePriceAtLegacy(now, saleInfo, network);
  }

  const { saleStart, leadinLength, price: endPrice } = saleInfo;
  const num = Math.min(now - saleStart, leadinLength);
  const through = num / leadinLength;

  const price = leadinFactorAt(through) * endPrice;
  return Number(price.toFixed());
};

// TODO: remove when transitioned to new pricing model
export const getCorePriceAtLegacy = (
  blockNumber: number,
  saleInfo: SaleInfo,
  network: NetworkType
) => {
  const { saleStart, leadinLength, price } = saleInfo;
  const num = Math.min(blockNumber - saleStart, leadinLength);
  const through = num / leadinLength;

  return Number((leadinFactorAtLegacy(network, through) * price).toFixed());
};

export const isNewPricing = (now: number, network: NetworkType): boolean => {
  // The new pricing model is used after block 485639 for Kusama CT.
  return (
    (network == NetworkType.KUSAMA && now >= 485639) ||
    (network == NetworkType.ROCOCO && now >= 1897262)
  ); // The new pricing is applied right away.
};
