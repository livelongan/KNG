import { alpha } from '@mui/material/styles'

export const darkPaletteConfig = {
  palette: {
    mode: 'dark' as const,
    primary: { main: '#eb0249', light: '#ff4f86', dark: '#b80039', contrastText: '#fff5fa' },
    secondary: { main: '#3d57d8', light: '#8ea0ff', dark: '#2d3fa8', contrastText: '#f5f7ff' },
    success: { main: '#22c55e', light: '#4ade80', dark: '#15803d', contrastText: '#062610' },
    info: { main: '#38bdf8', light: '#7dd3fc', dark: '#0284c7', contrastText: '#052432' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706', contrastText: '#2f1b00' },
    error: { main: '#f87171', light: '#fca5a5', dark: '#dc2626', contrastText: '#320606' },
    background: { default: '#0b1220', paper: '#111a2c' },
    text: { primary: '#f5f7ff', secondary: '#b7c2da' },
    divider: alpha('#9db4d4', 0.24),
    action: {
      active: alpha('#f5f7ff', 0.9),
      hover: alpha('#f5f7ff', 0.08),
      selected: alpha('#f5f7ff', 0.16),
      disabled: alpha('#f5f7ff', 0.42),
      disabledBackground: alpha('#f5f7ff', 0.14),
      focus: alpha('#f5f7ff', 0.2),
    },
  },
  custom: {
    barBackground: 'linear-gradient(90deg, rgba(15, 118, 110, 0.2), rgba(15, 23, 42, 0.7))',
    cardBackground: 'linear-gradient(165deg, rgba(17, 26, 44, 0.95), rgba(12, 19, 33, 0.92))',
    pageBackground:
      'radial-gradient(circle at 0% 0%, rgba(45, 212, 191, 0.22), transparent 40%), radial-gradient(circle at 100% 100%, rgba(251, 146, 60, 0.2), transparent 45%), linear-gradient(180deg, #0b1220 0%, #0a1020 100%)',
  },
}
