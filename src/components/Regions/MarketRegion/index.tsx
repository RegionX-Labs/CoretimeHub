import { RegionCard } from '@region-x/components';
import { humanizer } from 'humanize-duration';
import React from 'react';

import { getBalanceString, getTimeStringShort } from '@/utils/functions';

import { useAccounts } from '@/contexts/account';
import { useRelayApi } from '@/contexts/apis';
import { Listing } from '@/models';

interface MarketRegionProps {
  listing: Listing;
  onPurchase: (_listing: Listing) => void;
  onUnlist: (_listing: Listing) => void;
}

export const MarketRegion = ({ listing, onUnlist, onPurchase }: MarketRegionProps) => {
  const formatDuration = humanizer({ units: ['w', 'd', 'h'], round: true });

  const {
    state: { symbol, decimals },
  } = useRelayApi();

  const {
    state: { activeAccount },
  } = useAccounts();

  const { region, regionCoreOccupancy, regionConsumed, beginTimestamp, endTimestamp } = listing;
  const ownedRegion = activeAccount?.address === region.getOwner();

  return (
    <RegionCard
      typeMarketplace={true}
      regionData={{
        rawId: `${region.getRegionId()}`, // TODO: not the same as rawId
        name: `Region ${region.getCore()}`,
        regionStart: `Begin: ${getTimeStringShort(beginTimestamp)}`,
        regionEnd: `End: ${getTimeStringShort(endTimestamp)}`,
        coreIndex: region.getCore(),
        chainColor: 'blueDark',
        chainLabel: 'RegionX',
        consumed: regionConsumed,
        coreOcupaccy: regionCoreOccupancy * 100,
        duration: formatDuration(endTimestamp - beginTimestamp),
        currentUsage: 0,
        onClick: () => {
          ownedRegion ? onUnlist(listing) : onPurchase(listing);
        },
      }}
      ownedRegion={ownedRegion}
      salePrice={getBalanceString(listing.currentPrice.toString(), decimals, symbol)}
      pricePerTimeslice={getBalanceString(listing.timeslicePrice.toString(), decimals, symbol)}
      task=''
    />
  );
};
