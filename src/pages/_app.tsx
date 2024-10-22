import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Analytics } from '@vercel/analytics/react';
import { ConfirmProvider } from 'material-ui-confirm';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import * as React from 'react';
import '../../styles/global.scss';
import '@region-x/components/dist/index.css';

import createEmotionCache from '@/utils/createEmotionCache';
import theme from '@/utils/muiTheme';

import { Layout } from '@/components';

import { AccountProvider } from '@/contexts/account';
import { CoretimeApiContextProvider, RelayApiContextProvider } from '@/contexts/apis';
import { RegionXApiContextProvider } from '@/contexts/apis/RegionXApi';
import { BalanceProvider } from '@/contexts/balance';
import { MarketProvider } from '@/contexts/market';
import { NetworkProvider } from '@/contexts/network';
import { OrderProvider } from '@/contexts/orders';
import { RegionDataProvider } from '@/contexts/regions';
import { SaleInfoProvider } from '@/contexts/sales';
import { SettingsProvider } from '@/contexts/settings';
import { TaskDataProvider } from '@/contexts/tasks';
import { ToastProvider } from '@/contexts/toast';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();
export type NextPageWithLayout<P = unknown, IP = P> = NextPage<P, IP> & {
  getLayout?: (_page: React.ReactElement) => React.ReactNode;
};
interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}

const ApiProviders = ({ children }: any) => {
  return (
    <RelayApiContextProvider>
      <CoretimeApiContextProvider>
        <RegionXApiContextProvider>{children}</RegionXApiContextProvider>
      </CoretimeApiContextProvider>
    </RelayApiContextProvider>
  );
};

const UtilProviders = ({ children }: any) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <ConfirmProvider>
          <SettingsProvider>{children}</SettingsProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

const CoretimeChainProviders = ({ children }: any) => {
  return (
    <SaleInfoProvider>
      <TaskDataProvider>
        <RegionDataProvider>{children}</RegionDataProvider>
      </TaskDataProvider>
    </SaleInfoProvider>
  );
};

const RegionXDataProivders = ({ children }: any) => {
  return (
    <MarketProvider>
      <OrderProvider>{children}</OrderProvider>
    </MarketProvider>
  );
};

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name='viewport' content='initial-scale=1, width=device-width' />
        <title>Coretime Hub</title>
      </Head>
      <NetworkProvider>
        <UtilProviders>
          <AccountProvider>
            <ApiProviders>
              <BalanceProvider>
                <CoretimeChainProviders>
                  <RegionXDataProivders>
                    {getLayout(<Component {...pageProps} />)}
                  </RegionXDataProivders>
                </CoretimeChainProviders>
              </BalanceProvider>
            </ApiProviders>
          </AccountProvider>
        </UtilProviders>
      </NetworkProvider>
      <Analytics />
    </CacheProvider>
  );
}
