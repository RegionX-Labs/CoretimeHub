import { createTheme, responsiveFontSizes } from '@mui/material/styles';

/* * need to use module augmentation for the theme to accept the value that just added **/

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    dashed: true;
  }
}

let theme = createTheme({
  palette: {
    background: {
      paper: '#fff',
      default: '#f6f7fa',
    },
    primary: {
      main: '#3868a9',
    },
    grey: {
      100: '#eeeff4',
    },
    text: {
      primary: '#000',
      secondary: '#7e8591',
    },
  },
});

// add responsive MUI responsiveFontSize
theme = responsiveFontSizes(theme);

export default theme;
