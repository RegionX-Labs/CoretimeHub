import ArrowDownward from '@mui/icons-material/ArrowDownwardOutlined';
import {
  Box,
  Button,
  DialogActions,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import theme from '@/utils/muiTheme';
import { LoadingButton } from '@mui/lab';
import { useRegions } from '@/contexts/regions';
import { RegionCard } from '@/components';
import { RegionLocation, RegionMetadata } from '@/models';

const Page = () => {
  const { regions } = useRegions();
  const [filteredRegions, setFilteredRegions] = useState<Array<RegionMetadata>>(
    []
  );

  const [newOwner, setNewOwner] = useState('');

  const [originChain, setOriginChain] = useState('');
  const [destination, setDestinationChain] = useState('');

  const [selectedRegion, setSelectedRegion] = useState<RegionMetadata | null>(
    null
  );

  useEffect(() => {
    setFilteredRegions(
      regions.filter((r) => r.location != RegionLocation.MARKET)
    );
  }, [regions]);

  const handleRegionChange = (indx: number) => {
    console.log(regions[indx]);
    setSelectedRegion(regions[indx]);
  };

  const handleOriginChange = (newOrigin: string) => {
    setOriginChain(newOrigin);
    if (newOrigin === 'CoretimeChain')
      setFilteredRegions(
        regions.filter((r) => r.location == RegionLocation.CORETIME_CHAIN)
      );
    else {
      setFilteredRegions(
        regions.filter((r) => r.location == RegionLocation.CONTRACTS_CHAIN)
      );
    }
  };

  return (
    <Box>
      <Box>
        <Typography
          variant='subtitle2'
          sx={{ color: theme.palette.text.secondary }}
        >
          Cross-chain transfer regions
        </Typography>
        <Typography
          variant='subtitle1'
          sx={{ color: theme.palette.text.primary }}
        >
          Cross-Chain Transfer
        </Typography>
      </Box>
      <Box width={'60%'} margin={'2em auto'}>
        <Stack margin={'1em 0'} direction='column' gap={1}>
          <Typography>Origin chain:</Typography>
          <ChainSelectorProps
            chain={originChain}
            setChain={handleOriginChange}
          />
        </Stack>
        <Stack margin={'1em 0'} direction='column' gap={1}>
          <Typography>Destination chain:</Typography>
          <ChainSelectorProps
            chain={destination}
            setChain={setDestinationChain}
          />
        </Stack>
        {originChain && (
          <Stack margin={'1em 0'} direction='column' gap={1}>
            <Typography>Region</Typography>
            <RegionSelector
              regions={filteredRegions}
              selectedRegion={selectedRegion}
              handleRegionChange={handleRegionChange}
            />
          </Stack>
        )}
        {selectedRegion && (
          <Box
            sx={{
              transform: 'scale(0.8)',
              transformOrigin: 'center',
            }}
          >
            <RegionCard regionMetadata={selectedRegion} />
          </Box>
        )}
        <Stack margin={'2em 0'} direction='column' gap={1} alignItems='center'>
          <Typography>Transfer</Typography>
          <ArrowDownward />
        </Stack>
        <Stack direction='column' gap={1}>
          <Typography>Transfer to:</Typography>
          <DestinationSelector
            destination={newOwner}
            setDestination={setNewOwner}
          />
        </Stack>
        <Box margin={'2em 0'}>
          <DialogActions>
            <Link href='/'>
              <Button onClick={() => {}} variant='outlined'>
                Home
              </Button>
            </Link>
            <LoadingButton
              onClick={() => {}}
              variant='contained'
              loading={false}
            >
              Transfer
            </LoadingButton>
          </DialogActions>
        </Box>
      </Box>
    </Box>
  );
};

interface RegionSelectorProps {
  regions: Array<RegionMetadata>;
  selectedRegion: RegionMetadata | null;
  handleRegionChange: (_indx: number) => void;
}

const RegionSelector = ({
  regions,
  selectedRegion,
  handleRegionChange,
}: RegionSelectorProps) => {
  return (
    <FormControl fullWidth>
      <InputLabel id='destination-selector-label'>Region Name</InputLabel>
      <Select
        labelId='destination-selector-label'
        id='destination-selector'
        value={selectedRegion?.name}
        label='Destination'
        onChange={(e) => handleRegionChange(Number(e.target.value))}
      >
        {regions.map((region, indx) => (
          <MenuItem value={indx}>{region.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

interface ChainSelectorProps {
  chain: string;
  setChain: (_: string) => void;
}

const ChainSelectorProps = ({ chain, setChain }: ChainSelectorProps) => {
  return (
    <FormControl fullWidth>
      <InputLabel id='origin-selector-label'>Chain</InputLabel>
      <Select
        labelId='origin-selector-label'
        id='origin-selector'
        value={chain}
        label='Origin'
        onChange={(e) => setChain(e.target.value)}
      >
        <MenuItem value='CoretimeChain'>Coretime Chain</MenuItem>
        <MenuItem value='ContractsChain'>Contracts Chain</MenuItem>
      </Select>
    </FormControl>
  );
};

interface DestinationSelectorProps {
  setDestination: (_: string) => void;
  destination: string;
}

const DestinationSelector = ({
  setDestination,
  destination,
}: DestinationSelectorProps) => {
  const [destinationKind, setDestinationKind] = useState('Me');

  const handleDestinationKindChange = (event: any) => {
    setDestination('');
    setDestinationKind(event.target.value);
  };

  const handleOtherDestinationChange = (event: any) => {
    setDestination(event.target.value);
  };

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id='destination-selector-label'>Destination</InputLabel>
        <Select
          labelId='destination-selector-label'
          id='destination-selector'
          value={destinationKind}
          label='Destination'
          onChange={handleDestinationKindChange}
        >
          <MenuItem value='Me'>Me</MenuItem>
          <MenuItem value='Other'>Other</MenuItem>
        </Select>
      </FormControl>
      {destinationKind === 'Other' && (
        <TextField
          label='Specify sale destination'
          fullWidth
          margin='normal'
          value={destination}
          onChange={handleOtherDestinationChange}
        />
      )}
    </div>
  );
};

export default Page;
