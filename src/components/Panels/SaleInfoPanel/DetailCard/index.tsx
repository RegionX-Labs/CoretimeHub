import { Box, Paper, Typography, useTheme } from '@mui/material';
import Image from 'next/image';
import React from 'react';

import { InfoItem, ItemDetail } from '@/components/Elements';

import styles from './index.module.scss';

interface DetailCardProps {
  icon: any;
  title: string;
  button?: React.ReactNode;
  items?: {
    left: ItemDetail;
    right: ItemDetail;
  };
  children?: React.ReactNode;
}

export const DetailCard = ({ icon, title, items, button, children }: DetailCardProps) => {
  const theme = useTheme();
  return (
    <Paper className={styles.container}>
      <Box className={styles.headerWrapper}>
        <Box className={styles.titleWrapper}>
          <Image src={icon} className={styles.iconWrapper} alt='icon' />
          <Typography variant='subtitle1' sx={{ color: theme.palette.common.black }}>
            {title}
          </Typography>
        </Box>
        {button !== undefined ? <>{button}</> : <></>}
      </Box>
      <Box className={styles.infoSection} sx={{ color: theme.palette.common.black }}>
        {items ? (
          <>
            <InfoItem {...items.left} />
            <InfoItem {...items.right} />
          </>
        ) : (
          children
        )}
      </Box>
    </Paper>
  );
};
