import { BN } from '@polkadot/util';
import { ContextData, Region, RegionId } from 'coretime-utils';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { parseHNString, timesliceToTimestamp } from '@/utils/functions';

import { ContextStatus, Listing, ListingRecord } from '@/models';

import { useCoretimeApi, useRelayApi } from '../apis';
import { useRegionXApi } from '../apis/RegionXApi';
import { ApiState } from '../apis/types';
import { useNetwork } from '../network';

interface MarketData {
  status: ContextStatus;
  listedRegions: Array<Listing>;
  fetchMarket: () => void;
}

const defaultMarketData: MarketData = {
  status: ContextStatus.UNINITIALIZED,
  listedRegions: [],
  fetchMarket: () => {
    /** */
  },
};

const MarketDataContext = createContext<MarketData>(defaultMarketData);

interface Props {
  children: React.ReactNode;
}

const MarketProvider = ({ children }: Props) => {
  const {
    state: { api: regionXApi, apiState: regionXApiState },
  } = useRegionXApi();
  const { timeslicePeriod } = useCoretimeApi();
  const {
    state: { api: relayApi, apiState: relayApiState, height: relayBlockNumber },
  } = useRelayApi();
  const { network } = useNetwork();

  const [status, setStatus] = useState(ContextStatus.UNINITIALIZED);
  const [listedRegions, setListedRegions] = useState<Array<Listing>>([]);

  const fetchMarket = useCallback(async () => {
    if (
      !regionXApi ||
      regionXApiState !== ApiState.READY ||
      !relayApi ||
      relayApiState !== ApiState.READY ||
      !relayBlockNumber
    )
      return;

    try {
      setStatus(ContextStatus.LOADING);

      const regionEntries = await regionXApi.query.regions.regions.entries();
      const regions: Region[] = [];

      for (const [key, value] of regionEntries) {
        const [{ begin, core, mask }] = key.toHuman() as [any];
        const { owner, record } = value.toJSON() as any;

        if (!record.available) continue;
        const region = new Region(
          { begin: parseHNString(begin), core: parseHNString(core), mask } as RegionId,
          {
            ...record.available,
            owner,
          }
        );
        regions.push(region);
      }

      const listingEntries = await regionXApi.query.market.listings.entries();

      const records: Listing[] = [];

      for await (const [key, value] of listingEntries) {
        const [{ begin, core, mask }] = key.toHuman() as [any];
        const { seller, timeslicePrice, saleRecipient } =
          value.toJSON() as ListingRecord;

        const regionId = {
          begin: parseHNString(begin),
          core: parseHNString(core),
          mask,
        } as RegionId;

        const region = regions.find(
          (item) =>
            JSON.stringify(item.getRegionId()) === JSON.stringify(regionId)
        );
        if (!region) continue;
        const beginTimestamp = await timesliceToTimestamp(
          relayApi,
          region.getBegin(),
          timeslicePeriod
        );
        const endTimestamp = await timesliceToTimestamp(
          relayApi,
          region.getEnd(),
          timeslicePeriod
        );
        const record: Listing = Listing.construct(
          { timeslicePeriod, relayBlockNumber } as ContextData,
          region,
          seller,
          new BN(timeslicePrice),
          new BN(timeslicePrice * (region.getEnd() - region.getBegin())),
          saleRecipient,
          beginTimestamp,
          endTimestamp
        );
        records.push(record);
      }

      setListedRegions(records);

      setStatus(ContextStatus.LOADED);
    } catch {
      setStatus(ContextStatus.ERROR);
      setListedRegions([]);
    }
  }, [regionXApi, regionXApiState, relayApi, relayApiState, relayBlockNumber]);

  useEffect(() => {
    if (relayBlockNumber > 0 && status === ContextStatus.UNINITIALIZED)
      fetchMarket();
  }, [
    regionXApi,
    regionXApiState,
    relayApiState,
    relayApi,
    relayBlockNumber,
    status,
    fetchMarket,
  ]);

  useEffect(() => {
    setStatus(ContextStatus.UNINITIALIZED);
  }, [network]);

  return (
    <MarketDataContext.Provider value={{ status, listedRegions, fetchMarket }}>
      {children}
    </MarketDataContext.Provider>
  );
};

const useMarket = () => useContext(MarketDataContext);

export { MarketProvider, useMarket };
