import ArrowDownward from '@mui/icons-material/ArrowDownwardOutlined';
import {
  Box,
  Button,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import theme from '@/utils/muiTheme';
import { LoadingButton } from '@mui/lab';

const Page = () => {
  const [newOwner, setNewOwner] = useState('');

  const [originChain, setOriginChain] = useState('');
  const [destination, setDestinationChain] = useState('');

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
      <Box width={'50%'} margin={'2em auto'}>
        <Stack margin={'1em 0'} direction='column' gap={1}>
          <Typography>Origin chain:</Typography>
          <ChainSelectorProps chain={originChain} setChain={setOriginChain} />
        </Stack>
        <Stack margin={'1em 0'} direction='column' gap={1}>
          <Typography>Destination chain:</Typography>
          <ChainSelectorProps
            chain={destination}
            setChain={setDestinationChain}
          />
        </Stack>
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
            <Button onClick={() => {}} variant='outlined'>
              Home
            </Button>
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
        <MenuItem value='Coretime'>Coretime Chain</MenuItem>
        <MenuItem value='Contracts'>Contracts Chain</MenuItem>
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
        <InputLabel id='destination-selector-label'>
          Sale Destination
        </InputLabel>
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
