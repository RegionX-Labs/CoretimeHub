import { Box } from '@mui/material';
import TransferHeader from './transferHeader';
import TransferForm from './transferForm';
import TransferActions from './transferActions';
import { TransferStateProvider } from './contexts/transferState';

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
