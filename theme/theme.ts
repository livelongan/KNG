import type { PaletteMode } from '@mui/material'
import { alpha, createTheme, type Shadows } from '@mui/material/styles'
import type {} from '@mui/x-date-pickers/themeAugmentation'
import { darkPaletteConfig } from './dark-palette'
import { formThemeConfig } from './form-config'
import { lightPaletteConfig } from './light-palette'

function isRowStackDirection(direction: unknown): boolean {
  if (direction === 'row' || direction === 'row-reverse') {
    return true
  }

  if (Array.isArray(direction)) {
    return direction.some((value) => value === 'row' || value === 'row-reverse')
  }

  if (direction && typeof direction === 'object') {
    return Object.values(direction as Record<string, unknown>).some(
      (value) => value === 'row' || value === 'row-reverse',
    )
  }

  return false
}

export function createAppTheme(mode: PaletteMode) {
  const paletteConfig = mode === 'dark' ? darkPaletteConfig : lightPaletteConfig

  const fontSize = 16
  const lineHeight = '1.5rem'
  const fontFamily = '"IBM Plex Sans","Noto Sans SC",sans-serif'
  const smallFontFamily = fontFamily
  const { palette, custom } = paletteConfig
  const { input, label } = formThemeConfig
  const borderRadius = 0
  const popupElevation = 8
  const popupShadow =
    mode === 'dark'
      ? '0px 12px 28px rgba(0, 0, 0, 0.5), 0px 2px 8px rgba(0, 0, 0, 0.35)'
      : '0px 12px 28px rgba(15, 23, 42, 0.14), 0px 2px 8px rgba(15, 23, 42, 0.08)'
  const inputOutlineColor =
    mode === 'dark' ? alpha(palette.text.primary, 0.36) : alpha(palette.text.primary, 0.22)
  const shadows = [...createTheme().shadows] as Shadows
  shadows[popupElevation] = popupShadow
  const autocompleteCheckMask =
    'url("data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%2024%2024%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M9.55%2016.2%204.95%2011.6%203.54%2013l6.01%206L20.46%208.1l-1.41-1.4z%27%20fill%3D%27%23000%27/%3E%3C/svg%3E")'

  const rootCssVars = {
    '--font-family-small': smallFontFamily,
    '--font-size': `${fontSize}px`,
    '--font-family': fontFamily,
    '--line-height': lineHeight,
    '--border': `1px solid ${palette.divider}`,
    '--border-radius': `${borderRadius}px`,

    '--primary-main': palette.primary.main,
    '--primary-light': palette.primary.light,
    '--primary-dark': palette.primary.dark,
    '--primary-contrast': palette.primary.contrastText,

    '--secondary-main': palette.secondary.main,
    '--secondary-light': palette.secondary.light,
    '--secondary-dark': palette.secondary.dark,
    '--secondary-contrast': palette.secondary.contrastText,

    '--success-main': palette.success.main,
    '--success-light': palette.success.light,
    '--success-dark': palette.success.dark,
    '--success-contrast': palette.success.contrastText,

    '--info-main': palette.info.main,
    '--info-light': palette.info.light,
    '--info-dark': palette.info.dark,
    '--info-contrast': palette.info.contrastText,

    '--warning-main': palette.warning.main,
    '--warning-light': palette.warning.light,
    '--warning-dark': palette.warning.dark,
    '--warning-contrast': palette.warning.contrastText,

    '--error-main': palette.error.main,
    '--error-light': palette.error.light,
    '--error-dark': palette.error.dark,
    '--error-contrast': palette.error.contrastText,

    '--background-default': palette.background.default,
    '--background-paper': palette.background.paper,
    '--text-primary': palette.text.primary,
    '--text-secondary': palette.text.secondary,
    '--divider': palette.divider,

    '--action-active': palette.action.active,
    '--action-hover': palette.action.hover,
    '--action-selected': palette.action.selected,
    '--action-disabled': palette.action.disabled,
    '--action-disabled-background': palette.action.disabledBackground,
    '--action-focus': palette.action.focus,

    '--bar-background': custom.barBackground,
    '--card-background': custom.cardBackground,
    '--page-background': custom.pageBackground,
  }

  return createTheme({
    palette,
    custom,
    breakpoints: { values: { xs: 0, sm: 768, md: 1024, lg: 1280, xl: 1536 } },
    shape: { borderRadius },
    shadows,
    typography: {
      htmlFontSize: fontSize,
      fontFamily,
      allVariants: { lineHeight },
      h1: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', margin: '0.5rem 0' },
      h2: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.025em' },
      h3: { fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.02em' },
      h4: { fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.02em' },
      h5: { fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.02em' },
      h6: { fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.02em' },
      button: { textTransform: 'none', fontWeight: 400, fontFamily, lineHeight },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': rootCssVars,
          html: { fontSize: `${fontSize}px` },
          body: { fontSize: '1rem', fontFamily, lineHeight },
          'button, input, textarea, select': { fontFamily },
        },
      },
      MuiSvgIcon: {
        defaultProps: { fontSize: 'small' },
        styleOverrides: { fontSizeSmall: { fontSize: '1.25rem' } },
      },
      MuiDatePicker: {
        defaultProps: {
          slotProps: {
            textField: { size: input.size, variant: input.variant },
            openPickerButton: { size: 'small', edge: 'end', sx: { marginRight: -1 } },
            openPickerIcon: { fontSize: 'small' },
          },
        },
      },
      MuiDateTimePicker: {
        defaultProps: {
          slotProps: {
            textField: { size: input.size, variant: input.variant },
            openPickerButton: { size: 'small', edge: 'end', sx: { marginRight: -1 } },
            openPickerIcon: { fontSize: 'small' },
          },
        },
      },
      MuiPopover: {
        defaultProps: { elevation: popupElevation },
        styleOverrides: { paper: { boxShadow: popupShadow } },
      },
      MuiMenu: {
        defaultProps: { slotProps: { paper: { elevation: popupElevation } } },
        styleOverrides: { paper: { boxShadow: popupShadow } },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          disableRipple: true,
          disableFocusRipple: true,
          disableTouchRipple: true,
        },
        styleOverrides: {
          root: {
            fontFamily,
            lineHeight,
            padding: '4px 20px',
            borderRadius: '100px',
            transition: 'border-radius 320ms cubic-bezier(0.22, 1, 0.36, 1)',
            '&:hover': { borderRadius: 0 },
            '&.MuiButton-loading': { opacity: 1 },
            '&.MuiButton-loading.Mui-disabled': { opacity: 1 },
            '&.MuiButton-loading .MuiButton-loadingIndicator': { color: 'inherit' },
          },
          contained: ({ theme }) => ({
            height: '32px',
            '&.MuiButton-loading.Mui-disabled': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
            '&.MuiButton-loading.Mui-disabled:hover': {
              backgroundColor: theme.palette.primary.main,
            },
          }),
          outlined: ({ theme }) => ({
            height: '32px',
            '&.MuiButton-loading.Mui-disabled': {
              color: theme.palette.primary.main,
              borderColor: alpha(theme.palette.primary.main, 0.5),
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
          }),
          text: ({ theme }) => ({
            padding: 0,
            height: '24px',
            backgroundColor: 'transparent !important',
            '&:hover': {
              backgroundColor: 'transparent',
              color: theme.palette.primary.dark,
              fontWeight: '500',
            },
            '&.MuiButton-loading.Mui-disabled': {
              color: theme.palette.primary.main,
              backgroundColor: 'transparent',
            },
            '&.MuiButton-loading.Mui-disabled:hover': { backgroundColor: 'transparent' },
          }),
        },
      },
      MuiIconButton: { styleOverrides: { root: { padding: '6px' } } },
      MuiAppBar: { styleOverrides: { root: { backgroundImage: custom.barBackground } } },
      MuiCard: { styleOverrides: { root: { backgroundImage: custom.cardBackground } } },
      MuiTextField: { defaultProps: { size: input.size, variant: input.variant } },
      MuiCheckbox: { defaultProps: { size: input.size } },
      MuiRadio: { defaultProps: { size: input.size } },
      MuiSelect: {
        styleOverrides: {
          icon: {
            top: 'unset !important',
            right: 6,
            width: 'auto',
            height: 'auto',
            padding: 6,
            pointerEvents: 'none',
            '& .MuiSvgIcon-root': { fontSize: '1.25rem' },
          },
          iconOpen: { transform: 'none' },
        },
      },
      MuiNativeSelect: { styleOverrides: { icon: { top: 'unset !important' } } },
      MuiFormControl: {
        defaultProps: { size: input.size, variant: input.variant },
        styleOverrides: {
          root: {
            '&:not(.MuiFormControl-fullWidth)': { width: input.width, maxWidth: input.maxWidth },
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: ({ theme }) => ({
            fontSize: label.fontSize,
            fontWeight: label.fontWeight,
            color: label.color,
            '&.Mui-focused': { fontWeight: label.focusFontWeight },
            '&.Mui-error': { color: theme.palette.error.main },
            marginTop: '-0.25rem',
          }),
          asterisk: ({ theme }) => ({
            color: theme.palette.error.main,
            '&.Mui-error': { color: theme.palette.error.main },
          }),
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.secondary,
            lineHeight: '1',
            fontSize: '13px',
            fontFamily: 'var(--small-font-family)',
            '&.Mui-error': { color: theme.palette.error.main },
          }),
          contained: { marginLeft: 0, marginRight: 0 },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: { marginRight: 0, padding: 2.5 },
          label: { fontSize: label.fontSize, fontWeight: label.fontWeight },
          asterisk: ({ theme }) => ({
            color: theme.palette.error.main,
            '&.Mui-error': { color: theme.palette.error.main },
          }),
        },
      },
      MuiListItemText: { styleOverrides: { primary: { fontSize: '1rem', fontWeight: 500 } } },
      MuiFormGroup: { styleOverrides: { row: { '&.MuiRadioGroup-row': { gap: '16px' } } } },
      MuiInputLabel: {
        defaultProps: { shrink: label.shrink, disableAnimation: label.disableAnimation },
        styleOverrides: {
          root: ({ theme }) => ({
            position: label.position,
            transform: label.transform,
            maxWidth: label.maxWidth,
            pointerEvents: label.pointerEvents,
            fontSize: label.fontSize,
            fontWeight: label.fontWeight,
            color: label.color,
            '&.Mui-focused': { fontWeight: label.focusFontWeight },
            '&.Mui-error': { color: theme.palette.error.main },
            '&.Mui-focused.Mui-error': { color: theme.palette.error.main },
          }),
          formControl: { position: label.position, transform: label.transform },
          outlined: { transform: label.transform },
          shrink: { transform: label.transform },
        },
      },
      MuiOutlinedInput: {
        defaultProps: { size: input.size, notched: input.notched },
        styleOverrides: {
          input: { lineHeight: lineHeight },
          sizeSmall: { lineHeight: lineHeight },
          root: ({ theme }) => ({
            borderRadius: input.borderRadius,
            '& .MuiInputAdornment-positionEnd': { marginLeft: 4, marginRight: 0 },
            '& .MuiInputAdornment-positionEnd .MuiIconButton-root': { padding: 6 },
            '& .MuiInputAdornment-positionEnd .MuiIconButton-edgeEnd': { marginRight: -8 },
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: input.outlineBorderWidth,
              borderColor: inputOutlineColor,
              transition: 'border-color 180ms ease',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: inputOutlineColor,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: input.outlineBorderWidth,
              borderColor: inputOutlineColor,
            },
            '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
              borderColor: inputOutlineColor,
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.error.main,
            },
            '&.Mui-error:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.error.dark,
            },
            '&.Mui-focused.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.error.main,
            },
          }),
        },
      },
      MuiAutocomplete: {
        defaultProps: { slotProps: { paper: { elevation: popupElevation } } },
        styleOverrides: {
          root: {
            '&:not(.MuiFormControl-fullWidth)': { width: input.width, maxWidth: input.maxWidth },
            '& .MuiOutlinedInput-root': { paddingRight: '56px !important' },
          },
          listbox: {
            '.MuiTypography-root': { fontWeight: 'inherit' },
            '& .MuiAutocomplete-option': {
              minHeight: '40px',
              paddingTop: '4px',
              paddingBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
            '& .MuiAutocomplete-option:hover': {
              fontWeight: 500,
              backgroundColor: 'var(--action-hover) !important',
            },
            '& .MuiAutocomplete-option[aria-selected="true"]:hover': {
              backgroundColor: 'var(--action-hover) !important',
            },
            '& .MuiAutocomplete-option[aria-selected="true"]': {
              opacity: 1,
              backgroundColor: 'transparent !important',
            },
            '& .MuiAutocomplete-option::after': {
              content: '""',
              width: 20,
              height: 20,
              marginLeft: 8,
              marginRight: -6,
              flexShrink: 0,
              opacity: 0,
              backgroundColor: palette.primary.main,
              WebkitMaskImage: autocompleteCheckMask,
              maskImage: autocompleteCheckMask,
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              transition: 'opacity 120ms ease',
            },
            '& .MuiAutocomplete-option[aria-selected="true"]::after': { opacity: 1 },
          },
          option: { minHeight: 40, paddingTop: 4, paddingBottom: 4 },
        },
      },
      MuiPickerPopper: { styleOverrides: { paper: { boxShadow: popupShadow } } },
      MuiPickersTextField: {
        styleOverrides: {
          root: {
            '&:not(.MuiFormControl-fullWidth)': { width: input.width, maxWidth: input.maxWidth },
          },
        },
      },
      MuiPickersOutlinedInput: {
        defaultProps: { notched: input.notched },
        styleOverrides: {
          input: { lineHeight: lineHeight },
          inputSizeSmall: { lineHeight: lineHeight },
          root: ({ theme }) => ({
            borderRadius: input.borderRadius,
            '& .MuiInputAdornment-positionEnd': { marginLeft: 4, marginRight: 0 },
            '& .MuiInputAdornment-positionEnd .MuiIconButton-root': { padding: 6 },
            '& .MuiPickersOutlinedInput-notchedOutline': {
              borderWidth: input.outlineBorderWidth,
              borderColor: inputOutlineColor,
              transition: 'border-color 180ms ease',
            },
            '&:hover .MuiPickersOutlinedInput-notchedOutline': {
              borderColor: inputOutlineColor,
            },
            '&.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
              borderWidth: input.outlineBorderWidth,
              borderColor: inputOutlineColor,
            },
            '&.Mui-disabled .MuiPickersOutlinedInput-notchedOutline': {
              borderColor: inputOutlineColor,
            },
            '&.Mui-error .MuiPickersOutlinedInput-notchedOutline': {
              borderColor: theme.palette.error.main,
            },
            '&.Mui-error:hover .MuiPickersOutlinedInput-notchedOutline': {
              borderColor: theme.palette.error.dark,
            },
            '&.Mui-focused.Mui-error .MuiPickersOutlinedInput-notchedOutline': {
              borderColor: theme.palette.error.main,
            },
          }),
        },
      },
      MuiStack: {
        defaultProps: { useFlexGap: true },
        styleOverrides: {
          root: ({ ownerState }) => ({
            ...(isRowStackDirection(ownerState.direction) ? { alignItems: 'center' } : undefined),
          }),
        },
      },
    },
  })
}
