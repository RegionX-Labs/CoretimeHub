import { Box } from '@mui/material';
import TransferHeader from './transferHeader';
import TransferForm from './transferForm';
import TransferActions from './transferActions';

const TransferPage = () => {
  return (
    <Box sx={{ maxHeight: 'calc(100% - 2rem)' }}>
      <TransferHeader />
      <TransferForm />
      <TransferActions />
    </Box>
  );
};

export default TransferPage;
