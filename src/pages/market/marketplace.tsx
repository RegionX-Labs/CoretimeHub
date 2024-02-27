import { Box, Typography } from '@mui/material';
import { useState } from 'react';

import theme from '@/utils/muiTheme';

import { ListingCard } from '@/components/elements/ListingCard';
import { PurchaseModal } from '@/components/Modals/Purchase';

import { useMarket } from '@/contexts/market';
import { Listing } from '@/models';

const Page = () => {
  const { listedRegions } = useMarket();

  const [purchaseModalOpen, openPurhcaseModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const onPurchase = (listing: Listing) => {
    setSelectedListing(listing);
    openPurhcaseModal(true);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.secondary }}
          >
            Explore all the regions listed on the marketplace
          </Typography>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.text.primary }}
          >
            Explore the market
          </Typography>
        </Box>
      </Box>
      <Box marginTop={'2rem'}>
        {listedRegions.map((listing, indx) => (
          <ListingCard
            key={indx}
            listing={listing}
            readOnly={false}
            onPurchase={onPurchase}
          />
        ))}
      </Box>
      {selectedListing && (
        <PurchaseModal
          open={purchaseModalOpen}
          onClose={() => openPurhcaseModal(false)}
          listing={selectedListing}
        />
      )}
    </Box>
  );
};

export default Page;
