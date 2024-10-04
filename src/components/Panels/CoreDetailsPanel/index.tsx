import { Box, Paper, Typography, useTheme } from '@mui/material';
import Image from 'next/image';

import Manage from '@/assets/manage.svg';
import { SaleInfo } from '@/models';

import styles from './index.module.scss';

interface DetailItemProps {
  label: string;
  description: string;
  value: number;
  dataCy?: string;
}

const DetailItem = ({ label, description, value, dataCy }: DetailItemProps) => {
  const theme = useTheme();
  return (
    <Paper className={styles.detailWrapper}>
      <Box>
        <Typography
          sx={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: theme.palette.common.black,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontWeight: 400,
            color: theme.palette.text.primary,
          }}
        >
          {description}
        </Typography>
      </Box>
      <Box className={styles.valueWrapper}>
        <Typography
          sx={{
            fontSize: '0.8rem',
            color: theme.palette.text.primary,
            fontWeight: 700,
            lineHeight: 1,
          }}
          data-cy={dataCy}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

interface CoreDetailsPanelProps {
  saleInfo: SaleInfo;
}

export const CoreDetailsPanel = ({ saleInfo }: CoreDetailsPanelProps) => {
  const theme = useTheme();
  return (
    <Paper className={styles.container} data-cy='core-details'>
      <Box className={styles.titleWrapper}>
        <Image src={Manage} alt='graph' className={styles.iconWrapper} />
        <Typography
          sx={{
            color: theme.palette.common.black,
            fontSize: '1rem',
            fontWeight: 700,
          }}
        >
          Core Details
        </Typography>
      </Box>
      <Box className={styles.infoWrapper}>
        <DetailItem
          label='Cores offered'
          description='Numbers of cores which are offered for sale'
          value={saleInfo.coresOffered}
        />
        <DetailItem
          label='Cores sold'
          description='Numbers of cores which have been sold'
          value={saleInfo.coresSold}
          dataCy='cores-sold'
        />
        <DetailItem
          label='Ideal cores sold'
          description='Numbers of cores sold to not affect the price for next sale'
          value={saleInfo.idealCoresSold}
        />
      </Box>
    </Paper>
  );
};
