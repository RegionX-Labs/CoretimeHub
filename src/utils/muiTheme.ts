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
      contrastText: '#ecedef',
      main: '#3868a9',
    },
    success: {
      main: '#68a938',
    },
    grey: {
      100: '#eeeff4',
      200: '#8c8c8c',
    },
    text: {
      primary: '#7e8591',
      secondary: '#3868a9',
    },
    common: {
      white: '#fff',
    },
    warning: {
      main: '#A93868',
    },
    divider: '#efefef',
  },
  typography: {
    subtitle1: {
      fontSize: 20,
      fontWeight: 700,
    },
    subtitle2: {
      fontSize: 16,
      fontWeight: 400,
    },
    h1: {
      fontSize: 20,
      fontWeight: 700,
      lineHeight: 1,
    },
    h2: {
      fontSize: 13,
      fontWeight: 700,
      lineHeight: 1,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'capitalize',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          padding: '0.5rem',
          width: 'fit-content',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          display: 'flex',
          gap: '1rem',
          flexGrow: 1,
          padding: '0 1.5rem 2rem 1.5rem',
          '> button': {
            flexGrow: 1,
            borderRadius: '2rem',
            height: '3rem',
            textTransform: 'capitalize',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: `1px solid #e8e9ed`,
          boxShadow: '2px 2px 55px rgba(0, 0, 0, 0.08)',
          borderRadius: '0.5rem',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 5,
        },
        bar2Buffer: {
          background: '#eeeff4',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          background: 'white',
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        lastButton: {
          borderLeft: '1px solid',
        },
      },
    },
  },
});

// add responsive MUI responsiveFontSize
theme = responsiveFontSizes(theme);

export default theme;
