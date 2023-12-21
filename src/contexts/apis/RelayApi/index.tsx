import React, { useContext, useEffect, useReducer } from 'react';

import { ApiState } from '@/contexts/apis/types';
import { useToast } from '@/contexts/Toast';

import { connect, initialState, reducer } from '../common';
import { WS_RELAY_CHAIN } from '../consts';

const defaultValue = {
  state: initialState,
  connectRelay: (): void => {
    /** */
  },
};

const RelayApiContext = React.createContext(defaultValue);

const RelayApiContextProvider = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { toastError, toastSuccess } = useToast();

  useEffect(() => {
    state.apiError &&
      toastError(
        `Failed to connect to relay chain: error = ${state.apiError.toString()}`
      );
  }, [state.apiError]);

  useEffect(() => {
    state.apiState === ApiState.READY &&
      toastSuccess('Successfully connected to relay chain');
  }, [state.apiState]);

  const connectRelay = () => connect(state, WS_RELAY_CHAIN, dispatch);

  return (
    <RelayApiContext.Provider value={{ state, connectRelay }}>
      {props.children}
    </RelayApiContext.Provider>
  );
};

const useRelayApi = () => useContext(RelayApiContext);

export { RelayApiContextProvider, useRelayApi };
