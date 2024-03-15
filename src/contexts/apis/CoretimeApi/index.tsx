import React, { useContext, useEffect, useReducer } from 'react';

import { ApiState } from '@/contexts/apis/types';
import { useToast } from '@/contexts/toast';

import { connect, disconnect, initialState, reducer } from '../common';
import { WS_CORETIME_CHAIN } from '../consts';

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
  connectCoretime: (): void => {
    /** */
  },
  disconnectCoretime: (): void => {
    /** */
  },
};

const CoretimeApiContext = React.createContext(defaultValue);

const CoretimeApiContextProvider = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { toastError, toastSuccess } = useToast();

  useEffect(() => {
    state.apiError && toastError(`Failed to connect to Coretime chain`);
  }, [state.apiError, toastError]);

  useEffect(() => {
    state.apiState === ApiState.READY &&
      toastSuccess('Successfully connected to the Coretime chain');
  }, [state.apiState, toastSuccess]);

  const connectCoretime = () =>
    connect(state, WS_CORETIME_CHAIN, dispatch, types);

  const disconnectCoretime = () => disconnect(state);

  return (
    <CoretimeApiContext.Provider
      value={{ state, connectCoretime, disconnectCoretime }}
    >
      {props.children}
    </CoretimeApiContext.Provider>
  );
};

const useCoretimeApi = () => useContext(CoretimeApiContext);

export { CoretimeApiContextProvider, useCoretimeApi };
