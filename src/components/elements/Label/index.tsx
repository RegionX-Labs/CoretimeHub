import { Box, Typography, useTheme } from '@mui/material';

interface LabelProps {
  text: string;
  color: 'primary' | 'success';
}
export const Label = ({ text, color }: LabelProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        borderRadius: '5px',
        padding: '0.5rem 1rem',
        background:
          color === 'success'
            ? theme.palette.success.main
            : theme.palette.primary.main,
        color: theme.palette.common.white,
        fontWeight: 400,
      }}
    >
      <Typography variant='h2'>{text}</Typography>
    </Box>
  );
};
