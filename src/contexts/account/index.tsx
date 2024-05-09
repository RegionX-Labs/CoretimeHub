import type { Signer } from '@polkadot/api/types';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import React, { createContext, useContext, useEffect, useReducer } from 'react';

const APP_NAME = 'Corehub';
const LOCAL_STORAGE_ACCOUNTS = 'accounts';
const LOCAL_STORAGE_ACTIVE_ACCOUNT = 'active-account';

export enum KeyringState {
  // eslint-disable-next-line no-unused-vars
  DISCONNECTED = 'disconnected',
  // eslint-disable-next-line no-unused-vars
  LOADING = 'loading',
  // eslint-disable-next-line no-unused-vars
  READY = 'ready',
  // eslint-disable-next-line no-unused-vars
  ERROR = 'error',
}

type State = {
  status: KeyringState;
  accounts: InjectedAccountWithMeta[];
  activeAccount: InjectedAccountWithMeta | null;
  activeSigner: Signer | null;
};

const initialState: State = {
  status: KeyringState.DISCONNECTED,
  accounts: [],
  activeAccount: null,
  activeSigner: null,
};

interface Props {
  children: React.ReactNode;
}

const reducer = (state: State, action: any) => {
  switch (action.type) {
    case 'LOAD_KEYRING':
      return { ...state, keyringState: KeyringState.LOADING };
    case 'KEYRING_READY':
      return { ...state, KeyringState: KeyringState.READY };
    case 'KEYRING_ERROR':
      return { ...state, keyring: null, keyringState: KeyringState.ERROR };
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload };
    case 'SET_ACTIVE_ACCOUNT':
      return { ...state, activeAccount: action.payload };
    case 'SET_ACTIVE_SIGNER':
      return { ...state, activeSigner: action.payload } as State;
    case 'DISCONNECT':
      return {
        status: KeyringState.DISCONNECTED,
        accounts: [],
        activeAccount: null,
        activeSigner: null,
      } as State;
    default:
      throw new Error(`Unknown type: ${action.type}`);
  }
};

interface AccountData {
  state: State;
  setActiveAccount: (_acct: InjectedAccountWithMeta) => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const defaultAccountData: AccountData = {
  state: initialState,
  setActiveAccount: (_acct: InjectedAccountWithMeta) => {
    /** */
  },
  connectWallet: () => {
    /** */
  },
  disconnectWallet: () => {
    /** */
  },
};

const AccountDataContext = createContext<AccountData>(defaultAccountData);

const AccountProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setActiveAccount = (acct: any) => {
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_ACCOUNT, JSON.stringify(acct));
    dispatch({ type: 'SET_ACTIVE_ACCOUNT', payload: acct });
  };

  const connectWallet = () => {
    dispatch({ type: 'LOAD_KEYRING' });
    const asyncLoadAccounts = async () => {
      try {
        const extensionDapp = await import('@polkadot/extension-dapp');
        const { web3Accounts } = extensionDapp;
        const accounts: InjectedAccountWithMeta[] = await web3Accounts();
        dispatch({ type: 'KEYRING_READY' });
        dispatch({ type: 'SET_ACCOUNTS', payload: accounts });
      } catch (e) {
        dispatch({ type: 'KEYRING_ERROR' });
      }
    };
    asyncLoadAccounts();
  };

  useEffect(() => {
    const accounts = state.accounts;
    if (accounts.length) {
      const activeAccount = localStorage.getItem(LOCAL_STORAGE_ACTIVE_ACCOUNT);
      const account = activeAccount ? JSON.parse(activeAccount) : accounts[0];

      dispatch({ type: 'SET_ACTIVE_ACCOUNT', payload: account });

      localStorage.setItem(LOCAL_STORAGE_ACCOUNTS, JSON.stringify(accounts));
    }
  }, [state.accounts]);

  useEffect(() => {
    const getInjector = async () => {
      if (!state.activeAccount) return;
      const { web3FromSource } = await import('@polkadot/extension-dapp');
      const injector = await web3FromSource(state.activeAccount.meta.source);
      dispatch({ type: 'SET_ACTIVE_SIGNER', payload: injector.signer });
    };
    getInjector();
  }, [state.activeAccount]);

  const disconnectWallet = () => dispatch({ type: 'DISCONNECT' });

  useEffect(() => {
    const asyncLoad = async () => {
      const { web3Enable } = await import('@polkadot/extension-dapp');
      await web3Enable(APP_NAME);

      const item = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS);
      if (!item) return;
      try {
        const accounts = JSON.parse(item) as InjectedAccountWithMeta[];
        if (accounts.length > 0) {
          // load accounts automatically
          dispatch({ type: 'KEYRING_READY' });
          dispatch({ type: 'SET_ACCOUNTS', payload: accounts });
        }
      } catch {
        // error handling
      }
    };

    if ((window as any).injectedWeb3) asyncLoad();
  }, []);

  return (
    <AccountDataContext.Provider
      value={{ state, setActiveAccount, connectWallet, disconnectWallet }}
    >
      {children}
    </AccountDataContext.Provider>
  );
};

const useAccounts = () => useContext(AccountDataContext);

export { AccountProvider, useAccounts };
