import {
  Box,
  Button,
  IconButton,
  Input,
  InputAdornment,
  Typography,
} from '@mui/material';
import Identicon from '@polkadot/react-identicon';

import { isValidAddress } from '@/utils/functions';

import { useAccounts } from '@/contexts/account';
import { useToast } from '@/contexts/toast';

export interface RecipientInputProps {
  setRecipient: (_: string) => void;
  recipient: string;
}

export const RecipientInput = ({
  setRecipient,
  recipient,
}: RecipientInputProps) => {
  const {
    state: { activeAccount },
  } = useAccounts();
  const { toastInfo } = useToast();

  const isValid = isValidAddress(recipient);

  const onCopy = () => {
    const asyncCopy = async () => {
      await navigator.clipboard.writeText(recipient);
      toastInfo('Address copied');
    };
    asyncCopy();
  };

  return (
    <Box>
      <Typography>Recipient</Typography>
      <Input
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        fullWidth
        type='text'
        placeholder='Address of the recipient'
        startAdornment={
          isValid ? (
            <IconButton onClick={onCopy}>
              <Identicon value={recipient} theme='polkadot' size={24} />
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
              onClick={() =>
                activeAccount && setRecipient(activeAccount.address)
              }
            >
              Me
            </Button>
          </InputAdornment>
        }
        sx={{ height: '3rem' }}
        error={recipient.length > 0 && !isValid}
      />
    </Box>
  );
};
