import React, { useContext, useEffect, useReducer } from 'react';

import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';
import { useToast } from '@/contexts/toast';
import { NetworkType } from '@/models';

import { connect, disconnect, initialState, reducer } from '../common';
import { WS_KUSAMA_REGIONX_CHAIN, WS_ROCOCO_CORETIME_CHAIN } from '../consts';

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
  disconnectRegionX: (): void => {
    /** */
  },
};

const RegionXApiContext = React.createContext(defaultValue);

const RegionXApiContextProvider = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { toastError, toastSuccess } = useToast();

  const { network } = useNetwork();

  useEffect(() => {
    state.apiError && toastError(`Failed to connect to RegionX chain`);
  }, [state.apiError, toastError]);

  useEffect(() => {
    state.apiState === ApiState.READY &&
      state.name &&
      toastSuccess(`Successfully connected to ${state.name}`);
  }, [state.apiState, state.name, toastSuccess]);

  const getUrl = (network: any): string => {
    return network === NetworkType.ROCOCO
      ? WS_ROCOCO_CORETIME_CHAIN // TODO
      : WS_KUSAMA_REGIONX_CHAIN;
  };

  const disconnectRegionX = () => disconnect(state);

  useEffect(() => {
    if (network === NetworkType.NONE || state.socket == getUrl(network)) return;
    const updateNetwork = state.socket != getUrl(network);
    if (updateNetwork) {
      disconnectRegionX();
      connect(state, getUrl(network), dispatch, updateNetwork, types);
    }
  }, [network, state]);

  return (
    <RegionXApiContext.Provider value={{ state, disconnectRegionX }}>
      {props.children}
    </RegionXApiContext.Provider>
  );
};

const useRegionXApi = () => useContext(RegionXApiContext);

export { RegionXApiContextProvider, useRegionXApi };
