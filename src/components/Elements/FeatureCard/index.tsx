import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material';
import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';

import styles from './index.module.scss';

interface FeatureCardProps {
  title: string;
  buttonText: string;
  image: StaticImageData;
  enabled: boolean;
  href: string;
}

export const FeatureCard = ({
  title,
  buttonText,
  image,
  enabled,
  href,
}: FeatureCardProps) => {
  const { push, query } = useRouter();

  return (
    <Card className={styles.card}>
      <CardContent>
        <Image className={styles.icon} src={image} alt='' />
      </CardContent>
      <Typography variant='h5' component='h2' gutterBottom>
        {title}
      </Typography>
      <CardActions>
        <Button
          onClick={() => enabled && push({ pathname: href, query })}
          size='small'
          variant='text'
          disabled={!enabled}
          className={styles.button}
        >
          {buttonText}
        </Button>
      </CardActions>
    </Card>
  );
};
