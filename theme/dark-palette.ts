import { alpha } from '@mui/material/styles';

export const darkPaletteConfig = {
  palette: {
    mode: 'dark' as const,
    primary: {
      main: '#0f766e',
    },
    secondary: {
      main: '#ea580c',
    },
    background: {
      default: '#0b1220',
      paper: '#111a2c',
    },
    text: {
      primary: '#e6edf6',
      secondary: '#adc0da',
    },
    divider: alpha('#9db4d4', 0.24),
  },
  appBarBackgroundImage:
    'linear-gradient(90deg, rgba(15, 118, 110, 0.2), rgba(15, 23, 42, 0.7))',
  cardBackgroundImage:
    'linear-gradient(165deg, rgba(17, 26, 44, 0.95), rgba(12, 19, 33, 0.92))',
  inputLabelColor: alpha('#e6edf6', 0.86),
};
