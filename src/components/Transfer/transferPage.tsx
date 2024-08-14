import { Box } from '@mui/material';

import { TransferStateProvider } from './contexts/transferState';
import TransferActions from './transferActions';
import TransferForm from './transferForm';
import TransferHeader from './transferHeader';

const TransferPage = () => {
  return (
    <Box sx={{ maxHeight: 'calc(100% - 2rem)' }}>
      <TransferStateProvider>
        <TransferHeader />
        <TransferForm />
        <TransferActions />
      </TransferStateProvider>
    </Box>
  );
};

export default TransferPage;
