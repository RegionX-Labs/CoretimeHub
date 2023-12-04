import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { shibuya, UseInkathonProvider } from '@scio-labs/use-inkathon';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import * as React from 'react';
import '../../styles/global.scss';

import createEmotionCache from '@/utils/createEmotionCache';
import theme from '@/utils/muiTheme';

import { Layout } from '@/components/Layout';

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
        <title>Coretime UI</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UseInkathonProvider
          appName='Coretime UI'
          connectOnInit={false}
          defaultChain={shibuya}
        >
          {getLayout(<Component {...pageProps} />)}
        </UseInkathonProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
