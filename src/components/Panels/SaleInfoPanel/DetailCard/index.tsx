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
  items?: {
    left: ItemDetail;
    right: ItemDetail;
  };
  children?: React.ReactNode;
}

const ItemContainer = ({ label, value }: ItemDetail) => {
  const theme = useTheme();
  return (
    <Box className={styles.infoItem}>
      <Typography sx={{ color: theme.palette.text.primary }}>
        {label}
      </Typography>
      <Typography
        sx={{
          color: theme.palette.common.black,
          fontWeight: 700,
          marginRight: '0.2em',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

export const DetailCard = ({
  icon,
  title,
  items,
  children,
}: DetailCardProps) => {
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
      <Box
        className={styles.infoSection}
        sx={{ color: theme.palette.common.black }}
      >
        {items ? (
          <>
            <ItemContainer {...items.left} />
            <ItemContainer {...items.right} />
          </>
        ) : (
          children
        )}
      </Box>
    </Paper>
  );
};
