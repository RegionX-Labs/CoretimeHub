import { Box, Typography } from '@mui/material';

import theme from '@/utils/muiTheme';

import { Balance } from '../Elements/Balance';

const TransferHeader = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Box>
        <Typography
          variant='subtitle1'
          sx={{ color: theme.palette.common.black }}
        >
          Cross-Chain Transfer
        </Typography>
        <Typography
          variant='subtitle2'
          sx={{ color: theme.palette.text.primary }}
        >
          Cross-chain transfer regions
        </Typography>
      </Box>
      <Balance rcBalance ctBalance rxRcCurrencyBalance />
    </Box>
  );
};

export default TransferHeader;
