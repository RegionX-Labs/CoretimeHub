import {
  Button,
  Card,
  CardActions,
  CardContent,
  Link,
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
    <Card className={styles.card}>
      <CardContent>
        <Typography variant='h5' component='h2' gutterBottom>
          {title}
        </Typography>
        <Typography component='h2' gutterBottom>
          {content}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DataCardComponent;
