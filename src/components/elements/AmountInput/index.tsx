import { Stack, TextField, Typography } from '@mui/material';

interface AmountInputProps {
  amount: string;
  currency: string;
  title: string;
  caption: string;
  setAmount: (amount: string) => void;
}

// TODO: Fetch dot price and show how much is the currency amount worth.

const AmountInput = ({
  amount,
  currency,
  title,
  caption,
  setAmount,
}: AmountInputProps) => {
  const extractValue = (str: string): string => {
    const firstSpaceIndex = str.indexOf(' ');

    let result = '';
    if (firstSpaceIndex != -1) {
      result = str.substring(0, firstSpaceIndex);
    } else {
      result = str;
    }

    if (result == currency) {
      return '';
    }

    return result;
  };

  const setCursor = (event: any) => {
    // Set the cursor at the start.
    setTimeout(() => {
      event.target.selectionStart = 0;
      event.target.selectionEnd = 0;
    }, 0);
  };

  return (
    <>
      <Stack alignItems='center' direction='row' gap={1}>
        <Typography variant='h6'>{title}</Typography>
        <Typography>{caption}</Typography>
      </Stack>
      <TextField
        value={`${amount} ${currency}`}
        placeholder={`Enter ${currency} amount`}
        onChange={(e) => {
          setAmount(extractValue(e.target.value));
        }}
        onFocus={setCursor}
        fullWidth
      />
    </>
  );
};

export default AmountInput;
