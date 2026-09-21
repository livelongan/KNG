export const formThemeConfig = {
  input: {
    size: 'small' as const,
    variant: 'outlined' as const,
    width: 450,
    maxWidth: '100%',
    notched: false,
    borderRadius: 0,
    outlineBorderWidth: 1,
  },
  label: {
    fontSize: '0.9375rem',
    fontWeight: 400,
    focusFontWeight: 600,
    shrink: true,
    disableAnimation: true,
    position: 'static' as const,
    transform: 'none',
    maxWidth: '100%',
    pointerEvents: 'auto' as const,
  },
} as const;
