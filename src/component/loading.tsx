import { CircularProgress, Stack } from '@mui/material';

export const Loading = () => {
  return (
    <Stack
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        position: 'absolute',
        inset: 0,
      }}
    >
      <CircularProgress size={28} />
    </Stack>
  );
};
