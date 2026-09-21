import { Stack } from '@mui/material';
import { observer } from 'mobx-react-lite';

type IProps = { children: React.ReactNode };

export const ButtonWrapper = observer(({ children }: IProps) => {
  return (
    <Stack direction="row" spacing={2}>
      {children}
    </Stack>
  );
});
