import { Box, Typography, useTheme } from '@mui/material';

interface LabelProps {
  text: string;
  color: 'primary' | 'success';
  width?: string;
}
export const Label = ({ text, color, width }: LabelProps) => {
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
        width,
      }}
    >
      <Typography variant='h2'>{text}</Typography>
    </Box>
  );
};
