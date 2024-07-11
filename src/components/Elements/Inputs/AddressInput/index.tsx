import {
  Box,
  Button,
  IconButton,
  Input,
  InputAdornment,
  Typography,
} from '@mui/material';
import Identicon from '@polkadot/react-identicon';

import { isValidAddress, writeToClipboard } from '@/utils/functions';

import { useAccounts } from '@/contexts/account';
import { useToast } from '@/contexts/toast';

export interface AddressInputProps {
  onChange: (_: string) => void;
  address: string;
  label: string;
}

export const AddressInput = ({
  onChange,
  address,
  label,
}: AddressInputProps) => {
  const {
    state: { activeAccount },
  } = useAccounts();
  const { toastInfo } = useToast();

  const isValid = isValidAddress(address);

  const onCopy = () => {
    const asyncCopy = async () => {
      await writeToClipboard(address);
      toastInfo('Address copied');
    };
    asyncCopy();
  };

  return (
    <Box>
      <Typography>{label}</Typography>
      <Input
        value={address}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        type='text'
        placeholder='Address of the recipient'
        startAdornment={
          isValid ? (
            <IconButton onClick={onCopy}>
              <Identicon value={address} theme='polkadot' size={24} />
            </IconButton>
          ) : (
            <></>
          )
        }
        endAdornment={
          <InputAdornment position='end'>
            <Button
              variant='text'
              color='info'
              onClick={() => activeAccount && onChange(activeAccount.address)}
            >
              Me
            </Button>
          </InputAdornment>
        }
        sx={{ height: '3rem' }}
        error={address.length > 0 && !isValid}
      />
    </Box>
  );
};
