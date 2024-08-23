import { Stack, Typography, useTheme } from '@mui/material';

export type ItemDetail = {
  label: string;
  value: string | React.ReactNode;
};
export const InfoItem = ({ label, value }: ItemDetail) => {
  const theme = useTheme();
  return (
    <Stack direction='column' gap='0.5rem'>
      <Typography sx={{ color: theme.palette.text.primary }}>{label}</Typography>
      <Typography
        sx={{
          color: theme.palette.common.black,
          fontWeight: 700,
          marginRight: '0.2em',
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
};
