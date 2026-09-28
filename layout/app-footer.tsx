import { AppBar, Toolbar } from '@mui/material';
import { observer } from 'mobx-react-lite';

export const AppFooter = observer(() => {
  const currentYear = new Date().getFullYear();

  return (
    <AppBar
      component="footer"
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        top: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Toolbar>Footer - {currentYear}</Toolbar>
    </AppBar>
  );
});
