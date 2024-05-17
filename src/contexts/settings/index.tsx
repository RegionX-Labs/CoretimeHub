import { createContext, useContext, useEffect, useState } from 'react';

const KEY_SETTINGS = 'settings';

// Stores and manages settings in and from the local storage
interface SettingsData {
  watchList: number[];
  setWatchList: (_watchList: number[]) => void;
}

const defaultSettingsData: SettingsData = {
  watchList: [],
  setWatchList: (_watchList: number[]) => {
    /** */
  },
};

const SettingDataContext = createContext<SettingsData>(defaultSettingsData);

interface Props {
  children: React.ReactNode;
}

const SettingsProvider = ({ children }: Props) => {
  const [watchList, setWatchList] = useState<number[]>([]);

  useEffect(() => {
    const strItem = localStorage.getItem(KEY_SETTINGS);
    if (!strItem) {
      setWatchList([]);
      return;
    }
    const watchList = JSON.parse(strItem) as number[];
    setWatchList(watchList);
  }, []);

  const updateWatchList = (watchList: number[]) => {
    setWatchList(watchList);
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(watchList));
  };

  return (
    <SettingDataContext.Provider
      value={{ watchList, setWatchList: updateWatchList }}
    >
      {children}
    </SettingDataContext.Provider>
  );
};

const useSettings = () => useContext(SettingDataContext);

export { SettingsProvider, useSettings };
