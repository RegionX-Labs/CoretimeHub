import { useState, useEffect } from 'react';
import { ChainType, AssetType, RegionMetadata, RegionLocation } from '@/models';
import { useRegions } from '@/contexts/regions';
import { useCoretimeApi, useRelayApi, useRegionXApi } from '@/contexts/apis';

export const useTransferState = () => {
  const { regions, fetchRegions } = useRegions();

  const {
    state: { api: coretimeApi, apiState: coretimeApiState, symbol },
  } = useCoretimeApi();
  const {
    state: { api: regionXApi, apiState: regionxApiState },
  } = useRegionXApi();
  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();

  const [originChain, setOriginChain] = useState<ChainType>(ChainType.RELAY);
  const [destinationChain, setDestinationChain] = useState<ChainType>(
    ChainType.CORETIME
  );
  const [selectedRegion, setSelectedRegion] = useState<RegionMetadata | null>(
    null
  );
  const [filteredRegions, setFilteredRegions] = useState<Array<RegionMetadata>>(
    []
  );
  const [asset, setAsset] = useState<AssetType>(AssetType.TOKEN);

  useEffect(() => {
    if (originChain === ChainType.CORETIME) {
      setFilteredRegions(
        regions.filter((r) => r.location === RegionLocation.CORETIME_CHAIN)
      );
    } else if (originChain === ChainType.RELAY) {
      setFilteredRegions(
        regions.filter((r) => r.location === RegionLocation.REGIONX_CHAIN)
      );
    } else {
      setFilteredRegions([]);
    }
  }, [originChain, regions]);

  return {
    originChain,
    setOriginChain,
    destinationChain,
    setDestinationChain,
    selectedRegion,
    setSelectedRegion,
    filteredRegions,
    asset,
    setAsset,
    symbol,
    coretimeApi,
    coretimeApiState,
    regionXApi,
    regionxApiState,
    relayApi,
    relayApiState,
    fetchRegions,
  };
};
