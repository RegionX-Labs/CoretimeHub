import { useSaleInfo } from '@/contexts/sales';
import { Box, Typography, useTheme } from '@mui/material';

const Purchase = () => {
  const theme = useTheme();

  const { saleInfo, loading } = useSaleInfo();

  console.log(saleInfo);
  console.log(loading);

  return (
    <Box>
      <Box>
        <Typography
          variant='subtitle2'
          sx={{ color: theme.palette.text.secondary }}
        >
          Purchase a core directly from the Coretime chain
        </Typography>
        <Typography
          variant='subtitle1'
          sx={{ color: theme.palette.text.primary }}
        >
          Purchase a core
        </Typography>
      </Box>
      <Box>
        {loading ? (
          <>
            <Typography variant='h4' align='center'>
              Connect your wallet
            </Typography>
          </>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};

export default Purchase;
