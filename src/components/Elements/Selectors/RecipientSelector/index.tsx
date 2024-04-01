import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useState } from 'react';

export interface RecipientSelectorProps {
  setRecipient: (_: string) => void;
  recipient: string;
}

export const RecipientSelector = ({
  setRecipient,
  recipient,
}: RecipientSelectorProps) => {
  const [recipientKind, setRecipientKind] = useState('Me');

  const handleRecipientKindChange = (event: any) => {
    setRecipient('');
    setRecipientKind(event.target.value);
  };

  const handleOtherRecipientChange = (event: any) => {
    setRecipient(event.target.value);
  };

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id='recipient-selector-label'>Recipient</InputLabel>
        <Select
          labelId='recipient-selector-label'
          id='recipient-selector'
          value={recipientKind}
          label='Recipient'
          onChange={handleRecipientKindChange}
        >
          <MenuItem value='Me'>Me</MenuItem>
          <MenuItem value='Other'>Other</MenuItem>
        </Select>
      </FormControl>
      {recipientKind === 'Other' && (
        <TextField
          label='Recipient'
          fullWidth
          margin='normal'
          value={recipient}
          onChange={handleOtherRecipientChange}
        />
      )}
    </div>
  );
};
