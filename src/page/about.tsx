import { Stack, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';

export const AboutPage = observer(() => {
  return (
    <Stack>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        About
      </Typography>
    </Stack>
  );
});
