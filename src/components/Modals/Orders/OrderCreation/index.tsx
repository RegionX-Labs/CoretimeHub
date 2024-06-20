import { Dialog } from '@mui/material';

interface OrderCreationModalProps {
  open: boolean;
  onClose: () => void;
}

export const OrderCreationModal = ({
  open,
  onClose,
}: OrderCreationModalProps) => {
  return <Dialog open={open} onClose={onClose}></Dialog>;
};
