import { Divider, Paper, useTheme } from '@mui/material';
import React, { ReactElement } from 'react';

import styles from './index.module.scss';
import Banner from '../Banner';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';

interface Props {
  children: ReactElement | ReactElement[];
}

export const Layout = ({ children }: Props) => {
  const theme = useTheme();
  return (
    <div className={styles.layout}>
      <Header />
      <Banner
        content='The UI is still under active development and is released only for testing purposes!'
        severity='error'
      />
      <div className={styles.content}>
        <div className={styles.sidebar}>
          <Sidebar />
        </div>
        <Paper
          color='secondary'
          sx={{
            display: 'flex',
            flexGrow: 1,
            margin: '1rem 0.5rem 0 2rem',
            borderTopLeftRadius: '1rem',
            borderBottomLeftRadius: '1rem',
            paddingTop: '1rem',
            paddingBottom: '2rem',
          }}
        >
          <Divider
            sx={{ borderWidth: '1px', borderColor: theme.palette.grey[100] }}
          />
          <div className={styles.main}>{children}</div>
        </Paper>
      </div>
    </div>
  );
};
