import React, { useContext, useEffect, useReducer } from 'react';

import { ApiState } from '@/contexts/apis/types';
import { useToast } from '@/contexts/Toast';

import { connect, initialState, reducer } from '../common';
import { WS_CORETIME_CHAIN } from '../consts';

const defaultValue = {
  state: { ...initialState },
  connectCoretime: (): void => {
    /** */
  },
};

const CoretimeApiContext = React.createContext(defaultValue);

const CoretimeApiContextProvider = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { toastError, toastSuccess } = useToast();

  useEffect(() => {
    state.apiError &&
      toastError(
        `Failed to connect to Coretime chain: error = ${state.apiError.toString()}`
      );
  }, [state.apiError]);

  useEffect(() => {
    state.apiState === ApiState.READY &&
      toastSuccess('Successfully connected to the Coretime chain');
  }, [state.apiState]);

  const connectCoretime = () => connect(state, WS_CORETIME_CHAIN, dispatch);

  return (
    <CoretimeApiContext.Provider value={{ state, connectCoretime }}>
      {props.children}
    </CoretimeApiContext.Provider>
  );
};

const useCoretimeApi = () => useContext(CoretimeApiContext);

export { CoretimeApiContextProvider, useCoretimeApi };
