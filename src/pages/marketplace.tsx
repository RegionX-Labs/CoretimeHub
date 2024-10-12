import {
  Backdrop,
  Box,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { OnChainRegionId } from 'coretime-utils';
import { useConfirm } from 'material-ui-confirm';
import moment from 'moment';
import { useEffect, useState } from 'react';

import { useSubmitExtrinsic } from '@/hooks/submitExtrinsic';

import { Balance, MarketFilter, MarketRegion, PurchaseModal } from '@/components';

import { useAccounts } from '@/contexts/account';
import { useRegionXApi } from '@/contexts/apis/RegionXApi';
import { useMarket } from '@/contexts/market';
import { useToast } from '@/contexts/toast';
import { ContextStatus, Listing, MarketFilterOptions } from '@/models';

// eslint-disable-next-line no-unused-vars
enum SortOption {
  // eslint-disable-next-line no-unused-vars
  CheapestFirst = 'CheapestFirst',
  // eslint-disable-next-line no-unused-vars
  ExpensiveFirst = 'ExpensiveFirst',
  // 'ppt' stands for price per timeslice
  // eslint-disable-next-line no-unused-vars
  LowestPptFirst = 'LowestPptFirst',
  // eslint-disable-next-line no-unused-vars
  HighestPptFirst = 'HighestPptFirst',
}
type Option = {
  sortOption: SortOption;
  label: string;
};
const sortOptions: Option[] = [
  { sortOption: SortOption.CheapestFirst, label: 'Cheapest first' },
  { sortOption: SortOption.ExpensiveFirst, label: 'Expensive first' },
  {
    sortOption: SortOption.LowestPptFirst,
    label: 'Lowest price per timeslice first',
  },
  {
    sortOption: SortOption.HighestPptFirst,
    label: 'Highest price per timeslice first',
  },
];

const Marketplace = () => {
  const confirm = useConfirm();
  const theme = useTheme();

  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();
  const { fetchMarket, listedRegions, status } = useMarket();

  const {
    state: { api: regionXApi, isApiReady: isRegionXReady, decimals, symbol },
  } = useRegionXApi();
  const { toastError, toastSuccess, toastWarning, toastInfo } = useToast();
  const { submitExtrinsicWithFeeInfo } = useSubmitExtrinsic();

  const [purchaseModalOpen, openPurhcaseModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);

  const [filterOptions, setFilterOptions] = useState<MarketFilterOptions>({});
  const [orderBy, setOrderBy] = useState<SortOption>(SortOption.CheapestFirst);

  const onPurchase = (listing: Listing) => {
    setSelectedListing(listing);
    openPurhcaseModal(true);
  };

  const unlistRegion = async (regionId: OnChainRegionId) => {
    if (!regionXApi || !isRegionXReady) {
      toastWarning('Please check the connection to RegionX Chain');
      return;
    }
    if (!activeAccount || !activeSigner) {
      toastWarning('Please connect your wallet');
      return;
    }

    const txUnlist = regionXApi.tx.market.unlistRegion(regionId);

    submitExtrinsicWithFeeInfo(symbol, decimals, txUnlist, activeAccount.address, activeSigner, {
      ready: () => {
        toastInfo('Transaction was initiated');
      },
      inBlock: () => toastInfo('In Block'),
      finalized: () => {
        /** */
      },
      success: () => {
        toastSuccess('Transaction successful');
        fetchMarket();
      },
      fail: () => {
        toastError(`Failed to unlist the region`);
      },
      error: (e) => {
        toastError(
          `Failed to unlist the region. Error: ${
            e.errorMessage === 'Error' ? 'Please check your balance.' : e.errorMessage
          }`
        );
      },
    });
  };

  const onUnlist = (listing: Listing) => {
    confirm({
      description: 'Do you want to unlist the region from the marketplace?',
    }).then(() => unlistRegion(listing.region.getOnChainRegionId()));
  };

  useEffect(() => {
    const checkConditions = (listing: Listing): boolean => {
      const { region, beginTimestamp, endTimestamp, currentPrice } = listing;
      const { startDate, endDate, coreOccupancy, minDuration, price } = filterOptions;

      if (startDate && !moment(beginTimestamp).isSameOrAfter(moment(startDate), 'day'))
        return false;
      if (endDate && !moment(endTimestamp).isSameOrAfter(moment(endDate), 'day')) return false;

      const occupancy = region.coreOccupancy();
      if (coreOccupancy && !(occupancy >= coreOccupancy.min && occupancy <= coreOccupancy.max))
        return false;

      const duration = endTimestamp - beginTimestamp;
      if (minDuration && duration < minDuration) return false;

      if (price && !(currentPrice.cmp(price.min) >= 0 && currentPrice.cmp(price.max) <= 0)) {
        return false;
      }

      return true;
    };
    const filtered: Array<Listing> = [];

    listedRegions.forEach((listing) => {
      if (checkConditions(listing)) filtered.push(listing);
    });

    filtered.sort((a: Listing, b: Listing) => {
      switch (orderBy) {
        case SortOption.CheapestFirst:
          return a.currentPrice.sub(b.currentPrice).toNumber();
        case SortOption.ExpensiveFirst:
          return b.currentPrice.sub(a.currentPrice).toNumber();
        case SortOption.LowestPptFirst:
          return a.timeslicePrice.sub(b.timeslicePrice).toNumber();
        case SortOption.HighestPptFirst:
          return b.timeslicePrice.sub(a.timeslicePrice).toNumber();
      }
    });

    setFilteredListings(filtered);
  }, [listedRegions, filterOptions, orderBy]);

  return (
    <Box>
      {status !== ContextStatus.LOADED && (
        <Backdrop open>
          <CircularProgress />
        </Backdrop>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: '1rem' }}>
        <Balance rxNativeBalance rxRcCurrencyBalance />
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant='subtitle1' sx={{ color: theme.palette.common.black }}>
            Explore the market
          </Typography>
          <Typography variant='subtitle2' sx={{ color: theme.palette.text.primary }}>
            Explore all the regions listed on the marketplace
          </Typography>
        </Box>
        <Stack direction='row' gap='0.5rem'>
          <MarketFilter onChange={(options) => setFilterOptions(options)} />

          <Select
            sx={{
              width: '16rem',
              '.MuiOutlinedInput-input': {
                borderRadius: '2rem',
                background: theme.palette.common.white,
                color: theme.palette.common.black,
              },
              '.MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
            value={orderBy}
            onChange={(e) => setOrderBy(e.target.value as SortOption)}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.label} value={option.sortOption}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Box>

      {filteredListings.length > 0 && (
        <Box marginTop='2rem' display='flex' flexWrap='wrap' justifyContent='space-around'>
          {filteredListings.map((listing, index) => (
            <MarketRegion
              listing={listing}
              onPurchase={onPurchase}
              onUnlist={onUnlist}
              key={index}
            />
          ))}
        </Box>
      )}
      {selectedListing && (
        <PurchaseModal
          open={purchaseModalOpen}
          onClose={() => {
            openPurhcaseModal(false);
          }}
          listing={selectedListing}
        />
      )}
    </Box>
  );
};

export default Marketplace;
