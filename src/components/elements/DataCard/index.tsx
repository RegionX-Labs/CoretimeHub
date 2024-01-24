import {
  Box,
  Typography,
} from '@mui/material';
import React from 'react';

import styles from './index.module.scss';

interface DataCardComponentProps {
  title: string;
  content: string;
}

const DataCardComponent = ({ title, content }: DataCardComponentProps) => {
  return (
    <Box className={styles.card}>
      <Typography variant='h5' component='h2' gutterBottom>
        {title}
      </Typography>
      <Typography component='h2' gutterBottom>
        {content}
      </Typography>
    </Box>
  );
};

export default DataCardComponent;
