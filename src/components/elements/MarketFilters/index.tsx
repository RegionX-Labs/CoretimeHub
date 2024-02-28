import { Listing } from '@/models';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  Typography,
} from '@mui/material';
import { useState } from 'react';

interface Props {
  listings: Array<Listing>;
  setFilteredListings: (_filtered: Array<Listing>) => void;
}

const MarketFilters: React.FC<Props> = (props: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box display={'flex'}>
      <Typography variant='subtitle2'>Search filters: </Typography>
      <Box>
        <Button
          variant='outlined'
          aria-controls='occupancy-menu'
          aria-haspopup='true'
          onClick={handleClick}
        >
          Core Occupancy Filter
        </Button>
        <Menu
          id='occupancy-menu'
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem>
            <CoreOccupancyFilter {...props} />
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

const CoreOccupancyFilter = ({ listings, setFilteredListings }: Props) => {
  type Range = {
    lowerLimit: number;
    upperLimit: number;
  };

  type RangeOption = {
    limit: Range;
    label: string;
  };

  const rangeOptions: RangeOption[] = [
    { limit: { lowerLimit: 0, upperLimit: 0.25 }, label: '0%-25%' },
    { limit: { lowerLimit: 0.25, upperLimit: 0.5 }, label: '25%-50%' },
    { limit: { lowerLimit: 0.5, upperLimit: 0.75 }, label: '50%-75%' },
    { limit: { lowerLimit: 0.75, upperLimit: 1 }, label: '75%-100%' },
  ];

  const [selectedRange, setSelectedRange] = useState<string>(
    JSON.stringify(rangeOptions[0].limit)
  );

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedRange(event.target.value);
  };

  return (
    <Box width={240}>
      <FormControl fullWidth>
        <InputLabel id='range-dropdown-label'>Range</InputLabel>
        <Select
          labelId='range-dropdown-label'
          id='range-dropdown'
          value={selectedRange}
          label='Range'
          onChange={handleChange}
        >
          {rangeOptions.map((option) => (
            <MenuItem key={option.label} value={JSON.stringify(option.limit)}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default MarketFilters;
