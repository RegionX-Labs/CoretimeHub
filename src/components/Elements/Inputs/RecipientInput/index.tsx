import { Box, Button, Input, InputAdornment, Typography } from '@mui/material';

import { isValidAddress } from '@/utils/functions';

import { useAccounts } from '@/contexts/account';

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

  return (
    <Box>
      <Typography>Recipient</Typography>
      <Input
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        fullWidth
        type='text'
        placeholder='Address of the recipient'
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
        error={recipient.length > 0 && !isValidAddress(recipient)}
      />
    </Box>
  );
};
