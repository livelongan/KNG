import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import {
  AppBar,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  SwipeableDrawer,
  Toolbar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ButtonFlat, TitleLevel1 } from '../component';
import { useCommon } from '../hook';
import { useStores } from '../store';

type IProps = { loading?: boolean };

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/form-demo', label: 'Form Demo' },
] as const;

const navDrawerMinHeight = 220;
const navDrawerMaxHeight = 600;

export const AppHeader = observer(({ loading }: IProps) => {
  const { baseStore } = useStores();
  const { isSmall } = useCommon();
  const isDarkMode = baseStore.themeMode === 'dark';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Toolbar>
        <TitleLevel1 variant="h6" sx={{ flex: 1 }}>
          React 19.3
        </TitleLevel1>

        {isSmall ? (
          <>
            <IconButton
              color="inherit"
              aria-label={
                isMenuOpen ? 'close navigation drawer' : 'open navigation drawer'
              }
              aria-controls={isMenuOpen ? 'header-navigation-drawer' : undefined}
              aria-haspopup="true"
              aria-expanded={isMenuOpen ? true : undefined}
              onClick={() => (isMenuOpen ? closeMenu() : openMenu())}
            >
              <MenuOpenIcon />
            </IconButton>
            <SwipeableDrawer
              id="header-navigation-drawer"
              anchor="bottom"
              open={isMenuOpen}
              onOpen={openMenu}
              onClose={closeMenu}
              swipeAreaWidth={24}
              slotProps={{
                paper: {
                  sx: {
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.7),
                    backdropFilter: 'blur(12px) saturate(130%)',
                    WebkitBackdropFilter: 'blur(6px) saturate(130%)',
                    minHeight: navDrawerMinHeight,
                    maxHeight: navDrawerMaxHeight,
                    height: '42vh',
                    overflowY: 'auto',
                  },
                },
              }}
            >
              <List>
                {navItems.map((item) => (
                  <ListItemButton
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    onClick={closeMenu}
                  >
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                ))}
              </List>
            </SwipeableDrawer>
          </>
        ) : (
          navItems.map((item) => (
            <ButtonFlat key={item.to} color="inherit" component={RouterLink} to={item.to}>
              {item.label}
            </ButtonFlat>
          ))
        )}

        <IconButton
          color="inherit"
          onClick={() => baseStore.toggleThemeMode()}
          aria-label={isDarkMode ? 'switch to light mode' : 'switch to dark mode'}
          sx={{
            ml: 1,
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          {isDarkMode ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
        </IconButton>
      </Toolbar>
      {loading && <LinearProgress color="secondary" />}
    </AppBar>
  );
});
