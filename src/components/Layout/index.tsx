import { Typography } from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react';

import { enableRegionX } from '@/utils/functions';

import { useCoretimeApi, useRegionXApi, useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';

import styles from './index.module.scss';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';

interface Props {
  children: ReactElement | ReactElement[];
}

export const Layout = ({ children }: Props) => {
  const { network } = useNetwork();
  const {
    state: { api: coretiemApi, apiState: coretimeApiState },
  } = useCoretimeApi();
  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();
  const {
    state: { api: regionXApi, apiState: regionXApiState },
  } = useRegionXApi();

  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if ((coretiemApi === null) !== (coretimeApiState !== ApiState.READY)) {
      setError(
        'Please check if you are connected to the Coretime chain and the API is ready to use.'
      );
      setConnecting(coretiemApi !== null);
    } else if ((relayApi === null) !== (relayApiState !== ApiState.READY)) {
      setError(
        'Please check if you are connected to the Relay chain and the API is ready to use.'
      );
      setConnecting(relayApi !== null);
    } else if (
      enableRegionX(network) &&
      (regionXApi === null) !== (regionXApiState !== ApiState.READY)
    ) {
      setError(
        'Please check if you are connected to the RegionX chain and the API is ready to use.'
      );
      setConnecting(regionXApi !== null);
    } else {
      setError(null);
      setConnecting(false);
    }
  }, [
    network,
    coretiemApi,
    coretimeApiState,
    relayApi,
    relayApiState,
    regionXApi,
    regionXApiState,
  ]);

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.content}>
        <Header />
        <div className={styles.main}>
          {error !== null ? (
            connecting ? (
              <></>
            ) : (
              <Typography>{error}</Typography>
            )
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};
