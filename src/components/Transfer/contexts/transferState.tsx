import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useRegions } from '@/contexts/regions';
import { AssetType, ChainType, RegionLocation, RegionMetadata } from '@/models';

interface TransferState {
  originChain: ChainType;
  setOriginChain: (_chain: ChainType) => void;
  destinationChain: ChainType;
  setDestinationChain: (_chain: ChainType) => void;
  selectedRegion: RegionMetadata | null;
  setSelectedRegion: (_region: RegionMetadata | null) => void;
  filteredRegions: RegionMetadata[];
  asset: AssetType;
  setAsset: (_asset: AssetType) => void;
  fetchRegions: () => void;
}

const defaultTasksData: TransferState = {
  originChain: ChainType.NONE,
  setOriginChain: () => {
    /** */
  },
  destinationChain: ChainType.NONE,
  setDestinationChain: () => {
    /** */
  },
  selectedRegion: null,
  setSelectedRegion: () => {
    /** */
  },
  filteredRegions: [],
  asset: AssetType.TOKEN,
  setAsset: () => {
    /** */
  },
  fetchRegions: () => {
    /** */
  },
};

const TransferStateContext = createContext<TransferState>(defaultTasksData);

export const TransferStateProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { regions, fetchRegions } = useRegions();

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

  return (
    <TransferStateContext.Provider
      value={{
        originChain,
        setOriginChain,
        destinationChain,
        setDestinationChain,
        selectedRegion,
        setSelectedRegion,
        filteredRegions,
        asset,
        setAsset,
        fetchRegions,
      }}
    >
      {children}
    </TransferStateContext.Provider>
  );
};

export const useTransferState = () => useContext(TransferStateContext);
