import {
  Box,
  LinearProgress,
  linearProgressClasses,
  styled,
  Typography,
} from '@mui/material';

import theme from '@/utils/muiTheme';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 20,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: '#eeeff4',
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.primary['light'],
  },
}));

export type Section = {
  name: string;
  value: number;
};

interface ProgressProps {
  progress: number;
  sections: Section[];
}

export const Progress = ({ progress, sections }: ProgressProps) => {
  return (
    <Box position='relative' width='100%' height='20px'>
      <BorderLinearProgress variant='determinate' value={progress} />
      {sections
        .filter((s) => s.value > 0)
        .map(({ name, value }, index) => (
          <div key={index}>
            <Box
              key={index}
              position='absolute'
              top='0'
              borderRadius={5}
              left={`${value}%`}
              width='5px'
              height='100%'
              bgcolor={theme.palette.primary['dark']}
              zIndex='1'
            />
            <Box
              position='absolute'
              top='25px' // Position below the divisor
              left={`${value > 0 ? value : -15}%`} // Adjust to center the text below the divisor
              zIndex='2'
            >
              <Typography component='div'>{`${name}`}</Typography>
            </Box>
          </div>
        ))}
    </Box>
  );
};
