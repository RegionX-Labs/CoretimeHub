import { InputAdornment, Stack, TextField, Typography } from '@mui/material';

interface AmountInputProps {
  amount?: number;
  currency: string;
  title?: string;
  caption?: string;
  setAmount: (_: number) => void;
}

// TODO: Fetch dot price and show how much is the currency amount worth.

export const AmountInput = ({
  amount,
  currency,
  title,
  caption,
  setAmount,
}: AmountInputProps) => {
  return (
    <>
      <Stack alignItems='baseline' direction='row' gap={1} mb='0.5rem'>
        {title && (
          <Typography variant='h6' lineHeight={1}>
            {title}
          </Typography>
        )}
        {caption && <Typography lineHeight={1}>{caption}</Typography>}
      </Stack>
      <TextField
        value={amount?.toString() || ''}
        placeholder={`Enter ${currency} amount`}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>{currency}</InputAdornment>
          ),
          style: {
            borderRadius: '1rem',
            textAlign: 'center',
          },
        }}
        type='text'
        onChange={(e) => {
          if (Number.isNaN(e)) return;
          setAmount(Number(e.target.value));
        }}
        fullWidth
      />
    </>
  );
};
