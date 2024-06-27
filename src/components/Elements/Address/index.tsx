import { IconButton, Stack } from '@mui/material';
import Identicon from '@polkadot/react-identicon';

import { truncateAddres, writeToClipboard } from '@/utils/functions';

import { useToast } from '@/contexts/toast';

interface AddressProps {
  value: string;
  isShort?: boolean;
  isCopy?: boolean;
  size?: number;
}

export const Address = ({
  value,
  isShort,
  isCopy,
  size = 32,
}: AddressProps) => {
  const { toastInfo } = useToast();

  const onCopy = () => {
    if (!isCopy) return;

    const asyncCopy = async () => {
      await writeToClipboard(value);
      toastInfo('Address copied');
    };
    asyncCopy();
  };

  return (
    <Stack direction='row' gap='0.5rem' alignItems='center' width='fit-content'>
      <IconButton onClick={onCopy}>
        <Identicon value={value} theme='polkadot' size={size} />
      </IconButton>
      <p data-cy='address'>{isShort ? truncateAddres(value) : value}</p>
    </Stack>
  );
};
