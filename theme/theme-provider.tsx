import { CssBaseline, ThemeProvider } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'dayjs/locale/zh-cn';
import { observer } from 'mobx-react-lite';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useStores } from '../store';
import { createAppTheme } from './theme';

type AppThemeProviderProps = {
  children: ReactNode;
};

export const AppThemeProvider = observer(({ children }: AppThemeProviderProps) => {
  const {
    baseStore: { themeMode },
  } = useStores();
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );
});
