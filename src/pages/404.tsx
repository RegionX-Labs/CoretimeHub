import { Box, Typography } from '@mui/material';
import { ReactElement } from 'react';

const NotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Typography variant='h3' align='center'>
        Page not found
      </Typography>
    </Box>
  );
};

NotFound.getLayout = (page: ReactElement) => {
  return <div>{page}</div>;
};

export default NotFound;
