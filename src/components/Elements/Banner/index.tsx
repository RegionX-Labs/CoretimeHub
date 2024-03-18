import CloseIcon from '@mui/icons-material/Close';
import { Alert, IconButton } from '@mui/material';
import React, { useState } from 'react';

interface BannerProps {
  content: string;
  severity: 'info' | 'error' | 'warning' | 'success';
}

export const Banner = ({ content, severity }: BannerProps) => {
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
    </Alert>
  );
};
