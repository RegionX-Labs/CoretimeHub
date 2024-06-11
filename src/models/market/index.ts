import { BN } from '@polkadot/util';
import { ContextData, Region } from 'coretime-utils';

import { Address, Percentage } from '../common';

export class Listing {
  /// The reigon listed on sale.
  public region: Region;
  /// The percentage of the region that got consumed by now.
  public regionConsumed: Percentage;
  /// The percentage of the core the region ocucupies.
  public regionCoreOccupancy: Percentage;
  /// The seller of the region.
  public seller: string;
  /// The price per timeslice set by the seller.
  public timeslicePrice: BN;
  /// The current total price of the region.
  public currentPrice: BN;
  /// The recepient of the sale.
  public saleRecepient: string | null;

  public static construct(
    context: ContextData,
    region: Region,
    seller: Address,
    timeslicePrice: BN,
    currentPrice: BN,
    saleRecepient: Address | null
  ): Listing {
    return new Listing(
      region,
      region.consumed(context),
      region.coreOccupancy(),
      seller,
      timeslicePrice,
      currentPrice,
      saleRecepient
    );
  }

  constructor(
    region: Region,
    regionConsumed: Percentage,
    regionCoreOccupancy: Percentage,
    seller: string,
    timeslicePrice: BN,
    currentPrice: BN,
    saleRecepient: string | null
  ) {
    this.region = region;
    this.regionConsumed = regionConsumed;
    this.regionCoreOccupancy = regionCoreOccupancy;
    this.seller = seller;
    this.timeslicePrice = timeslicePrice;
    this.currentPrice = currentPrice;
    this.saleRecepient = saleRecepient;
  }
}

export type ListingRecord = {
  seller: Address;
  timeslicePrice: number;
  saleRecipient: Address | null;
};
