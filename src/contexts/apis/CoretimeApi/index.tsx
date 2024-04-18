import React, { useContext, useEffect, useReducer } from 'react';

import { ApiState } from '@/contexts/apis/types';
import { useToast } from '@/contexts/toast';

import { connect, disconnect, initialState, reducer } from '../common';
import { WS_ROCOCO_CORETIME_CHAIN, WS_KUSAMA_CORETIME_CHAIN } from '../consts';
import { useRouter } from 'next/router';

const types = {
  CoreIndex: 'u32',
  CoreMask: 'Vec<u8>',
  Timeslice: 'u32',
  RegionId: {
    begin: 'Timeslice',
    core: 'CoreIndex',
    mask: 'CoreMask',
  },
  RegionRecord: {
    end: 'Timeslice',
    owner: 'AccountId',
    paid: 'Option<Balance>',
  },
};

const defaultValue = {
  state: { ...initialState },
  disconnectCoretime: (): void => {
    /** */
  },
};

const CoretimeApiContext = React.createContext(defaultValue);

const CoretimeApiContextProvider = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { toastError, toastSuccess } = useToast();

  const router = useRouter();
  const { network } = router.query;

  useEffect(() => {
    state.apiError && toastError(`Failed to connect to Coretime chain`);
  }, [state.apiError, toastError]);

  useEffect(() => {
    state.apiState === ApiState.READY &&
      toastSuccess('Successfully connected to the Coretime chain');
  }, [state.apiState, toastSuccess]);

  const getUrl = (network: any): string => {
    if (!network || network == 'rococo') {
      return WS_ROCOCO_CORETIME_CHAIN;
    } else if (network == 'kusama') {
      return WS_KUSAMA_CORETIME_CHAIN;
    } else {
      console.error(`Network: ${network} not recognized`);
      // Default to rococo.
      return WS_ROCOCO_CORETIME_CHAIN;
    }
  };

  const disconnectCoretime = () => disconnect(state);

  useEffect(() => {
    if (!network || state.socket == getUrl(network)) return;
    const updateNetwork = network != '' && state.socket != getUrl(network);
    connect(state, getUrl(network), dispatch, updateNetwork, types);
  }, [network]);

  return (
    <CoretimeApiContext.Provider value={{ state, disconnectCoretime }}>
      {props.children}
    </CoretimeApiContext.Provider>
  );
};

const useCoretimeApi = () => useContext(CoretimeApiContext);

export { CoretimeApiContextProvider, useCoretimeApi };
