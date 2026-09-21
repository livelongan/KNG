import { Box } from '@mui/material';
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { Loading } from '../component';
import { AppLayout } from '../layout/app-layout';
import { routeConfig } from './config';

const RouterHydrateFallback = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      <Loading />
    </Box>
  );
};

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<AppLayout />}
      hydrateFallbackElement={<RouterHydrateFallback />}
    >
      {routeConfig.map((route) =>
        'index' in route ? (
          <Route key="index" index lazy={route.lazy} />
        ) : (
          <Route key={route.path} path={route.path} lazy={route.lazy} />
        ),
      )}
    </Route>,
  ),
);
