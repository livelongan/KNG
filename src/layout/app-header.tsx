import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import {
  AppBar,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  SwipeableDrawer,
  Toolbar,
} from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { ButtonText, TitleLevel1 } from '../component'
import { useCommon } from '../hook'
import { useStores } from '../store'

type IProps = { loading?: boolean }

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/form-demo', label: 'Form Demo' },
] as const

const navDrawerMinHeight = 220
const navDrawerMaxHeight = 600

export const AppHeader = observer(({ loading }: IProps) => {
  const { baseStore } = useStores()
  const { isSmall } = useCommon()
  const isDarkMode = baseStore.themeMode === 'dark'
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const openMenu = () => {
    setIsMenuOpen(true)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{ borderBottom: '1px solid', borderColor: 'divider', backdropFilter: 'blur(8px)' }}
    >
      <Toolbar>
        <TitleLevel1 color="primary" sx={{ flex: 1 }}>
          React 19.3
        </TitleLevel1>

        {isSmall ? (
          <>
            <IconButton
              color="inherit"
              aria-label={isMenuOpen ? 'close navigation drawer' : 'open navigation drawer'}
              aria-controls={isMenuOpen ? 'header-navigation-drawer' : undefined}
              aria-haspopup="true"
              aria-expanded={isMenuOpen ? 'true' : undefined}
              onClick={() => {
                if (isMenuOpen) {
                  closeMenu()
                  return
                }

                openMenu()
              }}
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
                    bgcolor: (theme) => theme.palette.background.paper,
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
            <ButtonText key={item.to} color="inherit" component={RouterLink} to={item.to}>
              {item.label}
            </ButtonText>
          ))
        )}

        <IconButton
          color="inherit"
          onClick={() => baseStore.toggleThemeMode()}
          aria-label={isDarkMode ? 'switch to light mode' : 'switch to dark mode'}
          sx={{ ml: 1 }}
        >
          {isDarkMode ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
        </IconButton>
      </Toolbar>
      {loading && <LinearProgress color="secondary" />}
    </AppBar>
  )
})
