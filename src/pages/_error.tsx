import { Box, Typography } from '@mui/material';
import { ReactElement } from 'react';

const ErrorPage = () => {
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
        An error occured
      </Typography>
    </Box>
  );
};

ErrorPage.getLayout = (page: ReactElement) => {
  return <div>{page}</div>;
};

export default ErrorPage;
