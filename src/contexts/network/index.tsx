import { useRouter } from 'next/router';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { NetworkType } from '@/models';

interface NetworkData {
  network: NetworkType;
  setNetwork: (_network: NetworkType) => void;
}

const defaultNetworkData: NetworkData = {
  network: NetworkType.ROCOCO,
  setNetwork: (_network: NetworkType) => {
    /** */
  },
};

const NetworkDataContext = createContext<NetworkData>(defaultNetworkData);

interface Props {
  children: React.ReactNode;
}

const NetworkProvider = ({ children }: Props) => {
  const [activeNetwork, setActiveNetwork] = useState<NetworkType>(NetworkType.NONE);

  const router = useRouter();
  const { network } = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    if (network === 'polkadot') setActiveNetwork(NetworkType.POLKADOT);
    else if (network === 'kusama') setActiveNetwork(NetworkType.KUSAMA);
    else if (network === 'paseo') setActiveNetwork(NetworkType.PASEO);
    else if (network === 'rococo') setActiveNetwork(NetworkType.ROCOCO);
    else if (network === 'westend') setActiveNetwork(NetworkType.WESTEND);
    else {
      // invalid network param. redirect to the default chain: polkadot
      router.push(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            network: 'polkadot',
          },
        },
        undefined,
        { shallow: false }
      );
    }
  }, [network, router, router.isReady]);

  const setNetwork = (network: NetworkType) => setActiveNetwork(network);

  return (
    <NetworkDataContext.Provider value={{ network: activeNetwork, setNetwork }}>
      {children}
    </NetworkDataContext.Provider>
  );
};

const useNetwork = () => useContext(NetworkDataContext);

export { NetworkProvider, useNetwork };
