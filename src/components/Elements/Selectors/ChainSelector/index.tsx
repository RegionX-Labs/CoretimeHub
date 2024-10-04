import { FormControl } from '@mui/material';
import { Select } from '@region-x/components';
import Image from 'next/image';

import { useCoretimeApi, useRegionXApi, useRelayApi } from '@/contexts/apis';
import { ChainType, NetworkType } from '@/models';

interface ChainSelectorProps {
  chain: ChainType;
  setChain: (_: ChainType) => void;
}

import { enableRegionX } from '@/utils/functions';

import {
  Kusama,
  KusamaCoretime,
  Polkadot,
  PolkadotCoretime,
  RegionX,
  Rococo,
  RococoCoretime,
  Westend,
  WestendCoretime,
} from '@/assets/networks';
import { useNetwork } from '@/contexts/network';

const coretimeIcons = {
  [NetworkType.POLKADOT]: PolkadotCoretime,
  [NetworkType.KUSAMA]: KusamaCoretime,
  [NetworkType.ROCOCO]: RococoCoretime,
  [NetworkType.WESTEND]: WestendCoretime,
  [NetworkType.NONE]: '',
};

const relayIcons = {
  [NetworkType.POLKADOT]: Polkadot,
  [NetworkType.KUSAMA]: Kusama,
  [NetworkType.ROCOCO]: Rococo,
  [NetworkType.WESTEND]: Westend,
  [NetworkType.NONE]: '',
};

export const ChainSelector = ({ chain, setChain }: ChainSelectorProps) => {
  const { network } = useNetwork();

  const {
    state: { name: coretimeChain },
  } = useCoretimeApi();
  const {
    state: { name: relayChain },
  } = useRelayApi();
  const {
    state: { name: regionXChain },
  } = useRegionXApi();

  const menuItems = [
    {
      icon: (
        <Image
          src={relayIcons[network]}
          alt=''
          style={{ width: '28px', height: '28px', marginRight: '0.5rem', borderRadius: '100%' }}
        />
      ),
      label: relayChain,
      value: ChainType.RELAY,
    },
    {
      icon: (
        <Image
          src={coretimeIcons[network]}
          alt=''
          style={{ width: '28px', height: '28px', marginRight: '0.5rem', borderRadius: '100%' }}
        />
      ),
      label: coretimeChain,
      value: ChainType.CORETIME,
    },
    ...(enableRegionX(network)
      ? [
          {
            icon: (
              <Image
                src={RegionX}
                alt=''
                style={{
                  width: '28px',
                  height: '28px',
                  marginRight: '0.5rem',
                  borderRadius: '100%',
                }}
              />
            ),
            label: regionXChain,
            value: ChainType.REGIONX,
          },
        ]
      : []),
  ];
  return (
    <FormControl fullWidth>
      <Select
        options={menuItems}
        selectedValue={chain}
        onChange={(c) => setChain(c || ChainType.RELAY)}
      />
    </FormControl>
  );
};
