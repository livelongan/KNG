import { CircularProgress, Stack } from '@mui/material';

export const Loading = () => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '100%', position: 'absolute', inset: 0 }}
    >
      <CircularProgress size={28} />
    </Stack>
  );
};
