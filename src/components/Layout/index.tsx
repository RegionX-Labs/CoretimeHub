import { Paper } from '@mui/material';
import React, { ReactElement } from 'react';

import styles from './index.module.scss';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';

interface Props {
  children: ReactElement | ReactElement[];
}

export const Layout = ({ children }: Props) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.content}>
        <Header />
        <Paper
          color='secondary'
          sx={{
            display: 'flex',
            flexGrow: 1,
            margin: '1rem 2rem',
            borderRadius: '1rem',
            py: '1rem',
          }}
        >
          <div className={styles.main}>{children}</div>
        </Paper>
      </div>
    </div>
  );
};
