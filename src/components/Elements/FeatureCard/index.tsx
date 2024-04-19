import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
  useTheme,
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
  const { push } = useRouter();
  const theme = useTheme();

  return (
    <Card className={styles.card}>
      <CardContent>
        <Image className={styles.icon} src={image} alt='' />
      </CardContent>
      <Typography variant='h1' gutterBottom>
        {title}
      </Typography>
      <CardActions>
        <Button
          onClick={() => enabled && push(href)}
          size='small'
          variant='text'
          disabled={!enabled}
          className={styles.button}
          sx={{
            background: '#e8eff7',
            color: theme.palette.text.secondary,
          }}
        >
          {buttonText}
        </Button>
      </CardActions>
    </Card>
  );
};
