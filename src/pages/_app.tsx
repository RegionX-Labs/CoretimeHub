import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { UseInkathonProvider } from '@scio-labs/use-inkathon';
import { Id } from 'coretime-utils';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as React from 'react';
import '../../styles/global.scss';

import createEmotionCache from '@/utils/createEmotionCache';
import theme from '@/utils/muiTheme';

import { Layout } from '@/components';

import {
  CoretimeApiContextProvider,
  RelayApiContextProvider,
} from '@/contexts/apis';
import {
  WS_KUSAMA_CORETIME_CHAIN,
  WS_ROCOCO_CORETIME_CHAIN,
} from '@/contexts/apis/consts';
import { ContextDataProvider } from '@/contexts/common';
import { MarketProvider } from '@/contexts/market';
import { NetworkProvider } from '@/contexts/network';
import { RegionDataProvider } from '@/contexts/regions';
import { SaleInfoProvider } from '@/contexts/sales';
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

export default function MyApp(props: MyAppProps) {
  const router = useRouter();
  const { network } = router.query;

  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  const getUrl = (network: any): string => {
    if (!network || network === 'rococo') {
      return WS_ROCOCO_CORETIME_CHAIN;
    } else if (network === 'kusama') {
      return WS_KUSAMA_CORETIME_CHAIN;
    } else {
      /* eslint-disable no-console */
      console.error(`Network: ${network} not recognized`);
      // default to rococo.
      return WS_ROCOCO_CORETIME_CHAIN;
    }
  };

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name='viewport' content='initial-scale=1, width=device-width' />
        <title>CoreHub</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
          <NetworkProvider>
            <CoretimeApiContextProvider>
              <RelayApiContextProvider>
                <UseInkathonProvider
                  appName='CoreHub'
                  connectOnInit={false}
                  defaultChain={{
                    network: '',
                    name: '',
                    rpcUrls: [getUrl(network)],
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
          </NetworkProvider>
        </ToastProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
