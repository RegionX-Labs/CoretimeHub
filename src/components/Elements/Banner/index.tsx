import theme from '@/utils/muiTheme';
import CloseIcon from '@mui/icons-material/Close';
import { Alert, IconButton } from '@mui/material';
import React, { useState } from 'react';

interface BannerProps {
  content: string;
  severity: 'info' | 'error' | 'warning' | 'success';
  link?: {
    title: string;
    href: string;
  };
}

export const Banner = ({ content, severity, link }: BannerProps) => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  if (!open) {
    return null;
  }

  return (
    <Alert
      severity={severity}
      action={
        <IconButton
          aria-label='close'
          color='inherit'
          size='small'
          onClick={handleClose}
        >
          <CloseIcon fontSize='inherit' />
        </IconButton>
      }
    >
      {content}
      {link && (
        <a
          style={{ color: theme.palette.primary.light }}
          rel='noopener noreferrer'
          target='_blank'
          href={link.href}
        >
          {link.title}
        </a>
      )}
    </Alert>
  );
};
