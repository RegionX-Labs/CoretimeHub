import React, { createContext, useContext, useState } from 'react';

import { Network, NetworkContext } from '@/models';

const defaultNetworkData = {
  network: 'rococo',
  setNetwork: (_n: Network): void => {
    /** */
  },
};

const NetworkContextData = createContext<NetworkContext>(defaultNetworkData);

interface Props {
  children: React.ReactNode;
}

const NetworkDataProvider = ({ children }: Props) => {
  const [network, setNetwork] = useState<Network>('rococo');

  return (
    <NetworkContextData.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContextData.Provider>
  );
};

const useNetwork = () => useContext(NetworkContextData);

export { NetworkDataProvider, useNetwork };
