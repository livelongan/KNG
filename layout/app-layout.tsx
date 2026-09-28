import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { Outlet, useNavigation } from 'react-router-dom';
import { Loading } from '../component';
import { AppFooter } from './app-footer';
import { AppHeader } from './app-header';
import { RootWrapper } from './root-wrapper';

export const AppLayout = observer(() => {
  const navigation = useNavigation();
  const loading = navigation.state !== 'idle';

  return (
    <RootWrapper>
      <AppHeader loading={loading} />
      <Box component="main" sx={{ position: 'relative', padding: 2, flexGrow: 1 }}>
        <Outlet />
        {loading && <Loading />}
      </Box>
      <AppFooter />
    </RootWrapper>
  );
});
