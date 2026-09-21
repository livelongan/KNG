import { alpha } from '@mui/material/styles';

export const lightPaletteConfig = {
  palette: {
    mode: 'light' as const,
    primary: {
      main: '#0f766e',
    },
    secondary: {
      main: '#ea580c',
    },
    background: {
      default: '#f5f8fc',
      paper: '#ffffff',
    },
    text: {
      primary: '#10243a',
      secondary: '#4b6178',
    },
    divider: alpha('#0f2945', 0.15),
  },
  appBarBackgroundImage:
    'linear-gradient(90deg, rgba(15, 118, 110, 0.08), rgba(255, 255, 255, 0.88))',
  cardBackgroundImage:
    'linear-gradient(165deg, rgba(255, 255, 255, 0.96), rgba(246, 251, 255, 0.98))',
  inputLabelColor: alpha('#10243a', 0.8),
};
