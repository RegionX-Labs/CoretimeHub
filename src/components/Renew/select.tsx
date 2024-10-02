import { Stack } from '@mui/material';
import { useRouter } from 'next/router';

import { RenewableParachain } from '@/hooks';

import { useNetwork } from '@/contexts/network';
import { Select } from '@region-x/components';
import { SelectOption } from '@region-x/components/dist/types/types';
import { chainData } from '@/chaindata';
import Image from 'next/image';

import Unknown from '@/assets/unknown.svg';

interface SelectParachainProps {
  parachains: RenewableParachain[];
}

export const SelectParachain = ({ parachains }: SelectParachainProps) => {
  const { network } = useNetwork();
  const router = useRouter();

  // Get core and paraId from query params.
  const core = router.query.core ? Number(router.query.core) : null;
  const paraId = router.query.paraId ? Number(router.query.paraId) : null;

  const onParaChange = (_index: number | null) => {
    const index = _index ?? 0;
    const selectedCoreId = core ? parachains[index].core : parachains[0].core;
    const selectedParaId = paraId ? parachains[index].paraId : parachains[0].paraId;

    // Update the URL with the new `core` query param
    router.push({
      pathname: '',
      query: { network, paraId: selectedParaId, core: selectedCoreId },
    });
  };

  const selectOptions: SelectOption<number>[] = parachains.map((p, i) => {
    const data = chainData[network][p.paraId];

    if (data === undefined) {
      return {
        label: `#${p.paraId} | Core ${p.core}`,
        value: i,
        icon: (
          <Image
            src={Unknown}
            width={28}
            height={28}
            style={{ borderRadius: '100%', marginRight: '1rem' }}
            alt=''
          />
        ),
      };
    }

    return {
      label: `${data.name} #${p.paraId} | Core ${p.core}`,
      value: i,
      icon:
        data.logo === undefined ? (
          <Image
            src={Unknown}
            width={28}
            height={28}
            style={{ borderRadius: '100%', marginRight: '1rem' }}
            alt=''
          />
        ) : (
          <Image
            src={data.logo}
            width={28}
            height={28}
            style={{ borderRadius: '100%', marginRight: '1rem' }}
            alt=''
          />
        ),
    };
  });

  return (
    <Stack direction='column' gap={1} margin='1rem 0' width='75%' sx={{ mx: 'auto' }}>
      <Select
        label='Select a parachain to renew'
        selectedValue={parachains.findIndex((p) => p.core === core && p.paraId === paraId)}
        options={selectOptions}
        searchable={true}
        onChange={onParaChange}
      />
    </Stack>
  );
};
