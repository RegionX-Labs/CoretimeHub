import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useState } from 'react';

import { Listing } from '@/models';

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

interface SortProps {
  listings: Array<Listing>;
  filter: (_listing: Listing) => boolean;
  setFilteredListings: (_listings: Array<Listing>) => void;
}

const Sort = ({ listings, setFilteredListings, filter }: SortProps) => {
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
        filteredListings.sort((a: Listing, b: Listing) =>
          a.currentPrice.cmp(b.currentPrice)
        );
        break;
      }
      case SortOption.ExpensiveFirst: {
        filteredListings.sort((a: Listing, b: Listing) =>
          b.currentPrice.cmp(a.currentPrice)
        );
        break;
      }
      case SortOption.LowestPptFirst: {
        filteredListings.sort((a: Listing, b: Listing) =>
          a.timeslicePrice.cmp(b.timeslicePrice)
        );
        break;
      }
      case SortOption.HighestPptFirst: {
        filteredListings.sort((a: Listing, b: Listing) =>
          b.timeslicePrice.cmp(a.timeslicePrice)
        );
        break;
      }
    }

    setFilteredListings(filteredListings.filter(filter));
  };

  return (
    <Box width={200}>
      <Box>
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
    </Box>
  );
};

export default Sort;
