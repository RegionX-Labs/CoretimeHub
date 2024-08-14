import React, { ReactElement } from 'react';

import { Header } from './Header';
import styles from './index.module.scss';
import { Sidebar } from './Sidebar';

interface Props {
  children: ReactElement | ReactElement[];
}

export const Layout = ({ children }: Props) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.content}>
        <Header />
        <div className={styles.main}>{children}</div>
      </div>
    </div>
  );
};
