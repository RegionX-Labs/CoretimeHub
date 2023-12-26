import React, { useContext, useEffect, useReducer } from 'react';

import { ApiState } from '@/contexts/apis/types';
import { useToast } from '@/contexts/toast';

import { connect, disconnect, initialState, reducer } from '../common';
import { WS_RELAY_CHAIN } from '../consts';

const defaultValue = {
  state: initialState,
  connectRelay: (): void => {
    /** */
  },
  disconnectRelay: (): void => {
    /** */
  },
};

const RelayApiContext = React.createContext(defaultValue);

const RelayApiContextProvider = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { toastError, toastSuccess } = useToast();

  useEffect(() => {
    state.apiError && toastError(`Failed to connect to relay chain`);
  }, [state.apiError]);

  useEffect(() => {
    state.apiState === ApiState.READY &&
      toastSuccess('Successfully connected to the relay chain');
  }, [state.apiState]);

  const connectRelay = () => connect(state, WS_RELAY_CHAIN, dispatch);
  const disconnectRelay = () => disconnect(state);

  return (
    <RelayApiContext.Provider value={{ state, connectRelay, disconnectRelay }}>
      {props.children}
    </RelayApiContext.Provider>
  );
};

const useRelayApi = () => useContext(RelayApiContext);

export { RelayApiContextProvider, useRelayApi };
