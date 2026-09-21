import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../store';

type IProps = {
  children?: React.ReactNode;
};

export const RootWrapper = observer(({ children }: IProps) => {
  const { baseStore } = useStores();
  const isDarkMode = baseStore.themeMode === 'dark';

  return (
    <Box
      className="root-wrapper"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background 260ms ease',
        background: isDarkMode
          ? 'radial-gradient(circle at 0% 0%, rgba(45, 212, 191, 0.22), transparent 40%), radial-gradient(circle at 100% 100%, rgba(251, 146, 60, 0.2), transparent 45%), linear-gradient(180deg, #0b1220 0%, #0a1020 100%)'
          : 'radial-gradient(circle at 0% 0%, rgba(20, 184, 166, 0.16), transparent 40%), radial-gradient(circle at 100% 100%, rgba(249, 115, 22, 0.14), transparent 45%), linear-gradient(180deg, #f5f8fc 0%, #edf3fb 100%)',
      }}
    >
      {children}
    </Box>
  );
});
