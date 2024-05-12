import React, { useContext, useEffect, useReducer } from 'react';

import { ApiState } from '@/contexts/apis/types';
import { useToast } from '@/contexts/toast';

import { connect, disconnect, initialState, reducer } from '../common';
import { EXPERIMENTAL, WS_REGIONX_CHAIN } from '../consts';

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

  useEffect(() => {
    state.apiError && toastError(`Failed to connect to RegionX chain`);
  }, [state.apiError, toastError]);

  useEffect(() => {
    state.apiState === ApiState.READY &&
      state.name &&
      toastSuccess(`Successfully connected to ${state.name}`);
  }, [state.apiState, state.name, toastSuccess]);

  const disconnectRegionX = () => disconnect(state);

  useEffect(() => {
    if (!EXPERIMENTAL) return;
    // TODO: currently we use the RegionX chain only when the experimental flag is on.
    //
    // For this reason we don't have different urls based on the network. However, this
    // should be updated once this is in production.
    connect(state, WS_REGIONX_CHAIN, dispatch, false, types);
  }, [state]);

  return (
    <RegionXApiContext.Provider value={{ state, disconnectRegionX }}>
      {props.children}
    </RegionXApiContext.Provider>
  );
};

const useRegionXApi = () => useContext(RegionXApiContext);

export { RegionXApiContextProvider, useRegionXApi };
