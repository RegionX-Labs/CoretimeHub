import React, { useContext, useEffect, useReducer } from 'react';

import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';
import { useToast } from '@/contexts/toast';
import { NetworkType } from '@/models';

import { connect, disconnect, initialState, reducer } from '../common';
import { WS_KUSAMA_CORETIME_CHAIN, WS_ROCOCO_CORETIME_CHAIN } from '../consts';

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

  const { network } = useNetwork();

  useEffect(() => {
    state.apiError && toastError(`Failed to connect to Coretime chain`);
  }, [state.apiError, toastError]);

  useEffect(() => {
    state.apiState === ApiState.READY &&
      state.name &&
      toastSuccess(`Successfully connected to ${state.name}`);
  }, [state.apiState, state.name, toastSuccess]);

  const getUrl = (network: any): string => {
    return network === NetworkType.ROCOCO
      ? WS_ROCOCO_CORETIME_CHAIN
      : WS_KUSAMA_CORETIME_CHAIN;
  };

  const disconnectCoretime = () => disconnect(state);

  useEffect(() => {
    if (network === NetworkType.NONE || state.socket == getUrl(network)) return;
    const updateNetwork = state.socket != getUrl(network);
    if (updateNetwork) {
      disconnectCoretime();
      connect(state, getUrl(network), dispatch, updateNetwork, types);
    }
  }, [network, state]);

  return (
    <CoretimeApiContext.Provider value={{ state, disconnectCoretime }}>
      {props.children}
    </CoretimeApiContext.Provider>
  );
};

const useCoretimeApi = () => useContext(CoretimeApiContext);

export { CoretimeApiContextProvider, useCoretimeApi };
