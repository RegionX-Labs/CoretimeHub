import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { Listing } from '@/models';

import { Props } from '.';

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

const Sort = ({ listings, setFilteredListings }: Props) => {
  type Option = {
    sortOption: SortOption;
    label: string;
  };

  const options: Option[] = [
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

  const [selectedOption, setSelectedOption] = useState<SortOption>(
    SortOption.CheapestFirst
  );

  const handleChange = (event: SelectChangeEvent) => {
    const filteredListings = new Array(...listings);
    const sortOption = event.target.value as SortOption;
    setSelectedOption(sortOption);

    switch (sortOption) {
      case SortOption.CheapestFirst: {
        filteredListings.sort(
          (a: Listing, b: Listing) => a.currentPrice - b.currentPrice
        );
        break;
      }
      case SortOption.ExpensiveFirst: {
        filteredListings.sort(
          (a: Listing, b: Listing) => b.currentPrice - a.currentPrice
        );
        break;
      }
      case SortOption.LowestPptFirst: {
        filteredListings.sort(
          (a: Listing, b: Listing) => a.timeslicePrice - b.timeslicePrice
        );
        break;
      }
      case SortOption.HighestPptFirst: {
        filteredListings.sort(
          (a: Listing, b: Listing) => b.timeslicePrice - a.timeslicePrice
        );
        break;
      }
    }

    setFilteredListings(filteredListings);
  };

  return (
    <Box width={240}>
      <Typography marginBottom={'.5em'}>Sort By</Typography>
      <FormControl fullWidth>
        <InputLabel id='range-dropdown-label'>Sort</InputLabel>
        <Select
          labelId='range-dropdown-label'
          id='range-dropdown'
          value={selectedOption.toString()}
          label='Range'
          onChange={handleChange}
        >
          {options.map((option) => (
            <MenuItem key={option.label} value={option.sortOption}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default Sort;
