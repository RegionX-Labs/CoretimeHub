import { Box, useTheme } from '@mui/material';
import React from 'react';
interface LinkProps {
  href: string;
  target?: string;
  children: React.ReactNode;
}

export const Link = ({ href, target = '_blank', children }: LinkProps) => {
  const theme = useTheme();

  const onClick = () => {
    if (!href) return;
    window.open(href, target);
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        color: theme.palette.primary.main,
      }}
    >
      {children}
    </Box>
  );
};
