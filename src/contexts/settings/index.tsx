import { createContext, useContext, useEffect, useState } from 'react';

import { NetworkType } from '@/models';

const KEY_SETTINGS = 'settings';

type Parachain = {
  network: NetworkType;
  paraId: number;
};

// Stores and manages settings in and from the local storage
interface SettingsData {
  watchList: Parachain[];
  setWatchList: (_watchList: Parachain[]) => void;
}

const defaultSettingsData: SettingsData = {
  watchList: [],
  setWatchList: (_watchList: Parachain[]) => {
    /** */
  },
};

const SettingDataContext = createContext<SettingsData>(defaultSettingsData);

interface Props {
  children: React.ReactNode;
}

const SettingsProvider = ({ children }: Props) => {
  const [watchList, setWatchList] = useState<Parachain[]>([]);

  useEffect(() => {
    const strItem = localStorage.getItem(KEY_SETTINGS);
    if (!strItem) {
      setWatchList([]);
      return;
    }
    const watchList = JSON.parse(strItem) as Parachain[];
    setWatchList(watchList);
  }, []);

  const updateWatchList = (watchList: Parachain[]) => {
    setWatchList(watchList);
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(watchList));
  };

  return (
    <SettingDataContext.Provider value={{ watchList, setWatchList: updateWatchList }}>
      {children}
    </SettingDataContext.Provider>
  );
};

const useSettings = () => useContext(SettingDataContext);

export { SettingsProvider, useSettings };
