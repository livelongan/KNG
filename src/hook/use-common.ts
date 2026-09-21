import { useMediaQuery, useTheme } from '@mui/material';

export type CommonBreakpointState = {
  isSmall: boolean;
  isMiddle: boolean;
  isLarge: boolean;
};

export const useCommon = (): CommonBreakpointState => {
  const theme = useTheme();

  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isMiddle = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isLarge = useMediaQuery(theme.breakpoints.up('lg'));

  return { isSmall, isMiddle, isLarge };
};
