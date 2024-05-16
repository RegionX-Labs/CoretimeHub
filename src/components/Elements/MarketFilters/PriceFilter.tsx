import { Box, Slider, Typography } from '@mui/material';
import { useState } from 'react';

import { planckBnToUnit } from '@/utils/functions';

import { FilterProps } from '.';

const PriceFilter = ({
  listings,
  filters,
  updateFilters,
  decimals,
}: FilterProps) => {
  const maxValue = (): number => {
    if (listings.length < 1) return 0;
    const sortedListings = new Array(...listings);
    sortedListings.sort((a, b) => b.currentPrice.cmp(a.currentPrice));
    return planckBnToUnit(sortedListings[0].currentPrice.toString(), decimals);
  };

  const [priceLimit, setPriceLimit] = useState(maxValue());

  const handleChange = (_e: Event, newValue: number | number[]) => {
    setPriceLimit(newValue as number);
    updateFilters({
      ...filters,
      priceFilter: (listing) =>
        planckBnToUnit(listing.currentPrice.toString(), decimals) <=
        (newValue as number),
    });
  };

  return (
    <Box>
      <Slider
        defaultValue={70}
        max={maxValue()}
        color='warning'
        value={priceLimit}
        onChange={handleChange}
        aria-label='Always visible'
        valueLabelDisplay='off'
        valueLabelFormat={(value) => `${value} ROC`}
      />
      <Typography variant='h2' textAlign='center'>
        Price Limit: {`${priceLimit} ROC`}
      </Typography>
    </Box>
  );
};

export default PriceFilter;
