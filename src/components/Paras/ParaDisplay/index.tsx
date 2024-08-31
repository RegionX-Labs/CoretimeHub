import { Stack } from '@mui/material';
import Image from 'next/image';

import { chainData } from '@/chaindata';
import { NetworkType } from '@/models';

import Unknown from '../../../assets/unknown.svg';

interface ParaDisplayProps {
  paraId: number;
  network: NetworkType;
  core?: number;
}

export const ParaDisplay = ({ paraId, network, core }: ParaDisplayProps) => {
  const data = chainData[network][paraId];

  if (data === undefined)
    return (
      <Stack direction='row' alignItems='center' gap='0.5rem'>
        <Image src={Unknown} width={32} height={32} style={{ borderRadius: '100%' }} alt='' />
        Parachain #{paraId}
        {core && <p>| Core {core}</p>}
      </Stack>
    );

  const { name, logo } = data;

  return (
    <Stack direction='row' alignItems='center' gap='0.5rem'>
      {logo === undefined ? (
        <></>
      ) : (
        <Image src={logo} width={32} height={32} style={{ borderRadius: '100%' }} alt='' />
      )}
      {name}
      <p>#{paraId}</p>
      {core && <p>| Core {core}</p>}
    </Stack>
  );
};
