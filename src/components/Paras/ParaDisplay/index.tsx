import { Stack } from '@mui/material';
import Image from 'next/image';

import { chainData } from '@/chaindata';
import { NetworkType } from '@/models';

interface ParaDisplayProps {
  paraId: number;
  network: NetworkType;
}
export const ParaDisplay = ({ paraId, network }: ParaDisplayProps) => {
  const data = chainData[network][paraId];

  if (data === undefined) return <>{paraId}</>;

  const { name, logo } = data;

  return (
    <Stack direction='row' alignItems='center' gap='0.5rem'>
      {paraId}
      {logo === undefined ? (
        <></>
      ) : (
        <Image
          src={logo}
          width={32}
          height={32}
          style={{ borderRadius: '100%' }}
          alt=''
        />
      )}
      {name}
    </Stack>
  );
};
