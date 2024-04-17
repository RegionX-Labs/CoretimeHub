import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { UseInkathonProvider } from '@scio-labs/use-inkathon';
import { Id } from 'coretime-utils';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import * as React from 'react';
import '../../styles/global.scss';

import createEmotionCache from '@/utils/createEmotionCache';
import theme from '@/utils/muiTheme';

import { Layout } from '@/components';

import {
  CoretimeApiContextProvider,
  RelayApiContextProvider,
} from '@/contexts/apis';
import { WS_ROCOCO_CORETIME_CHAIN } from '@/contexts/apis/consts';
import { ContextDataProvider } from '@/contexts/common';
import { MarketProvider } from '@/contexts/market';
import { RegionDataProvider } from '@/contexts/regions';
import { SaleInfoProvider } from '@/contexts/sales';
import { TaskDataProvider } from '@/contexts/tasks';
import { ToastProvider } from '@/contexts/toast';
import { NetworkDataProvider } from '@/contexts/network';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();
export type NextPageWithLayout<P = unknown, IP = P> = NextPage<P, IP> & {
  getLayout?: (_page: React.ReactElement) => React.ReactNode;
};
interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name='viewport' content='initial-scale=1, width=device-width' />
        <title>CoreHub</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
          <NetworkDataProvider>
            <CoretimeApiContextProvider>
              <RelayApiContextProvider>
                <UseInkathonProvider
                  appName='CoreHub'
                  connectOnInit={false}
                  defaultChain={{
                    network: '',
                    name: '',
                    rpcUrls: [WS_ROCOCO_CORETIME_CHAIN],
                  }}
                  apiOptions={{ types: { Id } }}
                >
                  <ContextDataProvider>
                    <TaskDataProvider>
                      <RegionDataProvider>
                        <MarketProvider>
                          <SaleInfoProvider>
                            {getLayout(<Component {...pageProps} />)}
                          </SaleInfoProvider>
                        </MarketProvider>
                      </RegionDataProvider>
                    </TaskDataProvider>
                  </ContextDataProvider>
                </UseInkathonProvider>
              </RelayApiContextProvider>
            </CoretimeApiContextProvider>
          </NetworkDataProvider>
        </ToastProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
