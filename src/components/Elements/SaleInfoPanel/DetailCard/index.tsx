import { Box, Paper, Typography, useTheme } from '@mui/material';
import Image from 'next/image';

import styles from './index.module.scss';

interface ItemDetail {
  label: string;
  value: string;
}

interface DetailCardProps {
  icon: any;
  title: string;
  left: ItemDetail;
  right: ItemDetail;
}

const ItemContainer = ({ label, value }: ItemDetail) => {
  const theme = useTheme();
  return (
    <Box className={styles.infoItem}>
      <Typography>{label}</Typography>
      <Typography sx={{ color: theme.palette.common.black, fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  );
};

export const DetailCard = ({ icon, title, left, right }: DetailCardProps) => {
  const theme = useTheme();
  return (
    <Paper className={styles.container}>
      <Box className={styles.titleWrapper}>
        <Image src={icon} className={styles.iconWrapper} alt='icon' />
        <Typography
          variant='subtitle1'
          sx={{ color: theme.palette.common.black }}
        >
          {title}
        </Typography>
      </Box>
      <Box className={styles.infoSection}>
        <ItemContainer {...left} />
        <ItemContainer {...right} />
      </Box>
    </Paper>
  );
};
