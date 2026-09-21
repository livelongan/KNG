import type { PaletteMode } from '@mui/material';
import { alpha, createTheme } from '@mui/material/styles';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import { darkPaletteConfig } from './dark-palette';
import { formThemeConfig } from './form-config';
import { lightPaletteConfig } from './light-palette';

export function createAppTheme(mode: PaletteMode) {
  const paletteConfig = mode === 'dark' ? darkPaletteConfig : lightPaletteConfig;

  const { palette, appBarBackgroundImage, cardBackgroundImage, inputLabelColor } =
    paletteConfig;
  const { input, label } = formThemeConfig;
  const rootFontSize = 16;
  const globalLineHeight = 1.5;
  const defaultFontWeight = 400;
  const appFontFamily = '"IBM Plex Sans","Noto Sans SC",sans-serif';
  const smallFontFamily = appFontFamily;
  const inputLineHeight = '1.4375em';
  const buttonLineHeight = '2.2ex';
  const buttonPaddingBlock = '0.8ex';

  return createTheme({
    palette,
    breakpoints: {
      values: {
        xs: 0,
        sm: 768,
        md: 1024,
        lg: 1280,
        xl: 1536,
      },
    },
    shape: {
      borderRadius: 0,
    },
    typography: {
      htmlFontSize: rootFontSize,
      fontFamily: appFontFamily,
      fontSize: rootFontSize,
      fontWeightRegular: defaultFontWeight,
      allVariants: {
        lineHeight: globalLineHeight,
        fontWeight: defaultFontWeight,
      },
      h1: {
        fontSize: '1.5rem',
        fontWeight: 700,
        letterSpacing: '-0.03em',
      },
      h2: {
        fontSize: '1.25rem',
        fontWeight: 700,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontSize: '1rem',
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h6: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      button: {
        textTransform: 'none',
        fontWeight: 400,
        fontFamily: appFontFamily,
        lineHeight: buttonLineHeight,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            '--small-font-family': smallFontFamily,
          },
          html: {
            fontSize: `${rootFontSize}px`,
          },
          body: {
            fontSize: '1rem',
            fontFamily: appFontFamily,
            lineHeight: globalLineHeight,
          },
          'button, input, textarea, select': {
            fontFamily: appFontFamily,
          },
        },
      },
      MuiSvgIcon: {
        defaultProps: {
          fontSize: 'small',
        },
        styleOverrides: {
          fontSizeSmall: {
            fontSize: '1.25rem',
          },
        },
      },
      MuiDatePicker: {
        defaultProps: {
          slotProps: {
            textField: {
              size: input.size,
              variant: input.variant,
            },
            openPickerButton: {
              size: 'small',
              edge: 'end',
              sx: {
                marginRight: -1,
              },
            },
            openPickerIcon: {
              fontSize: 'small',
            },
          },
        },
      },
      MuiDateTimePicker: {
        defaultProps: {
          slotProps: {
            textField: {
              size: input.size,
              variant: input.variant,
            },
            openPickerButton: {
              size: 'small',
              edge: 'end',
              sx: {
                marginRight: -1,
              },
            },
            openPickerIcon: {
              fontSize: 'small',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: appFontFamily,
            borderRadius: '100px',
            lineHeight: buttonLineHeight,
            paddingBlock: buttonPaddingBlock,
            paddingInline: '16px',
            transition: 'border-radius 320ms cubic-bezier(0.22, 1, 0.36, 1)',
            '&:hover': {
              borderRadius: 0,
            },
            '&.MuiButton-loading': {
              opacity: 1,
            },
            '&.MuiButton-loading.Mui-disabled': {
              opacity: 1,
            },
            '&.MuiButton-loading .MuiButton-loadingIndicator': {
              color: 'inherit',
            },
          },
          contained: ({ theme }) => ({
            '&.MuiButton-loading.Mui-disabled': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
            '&.MuiButton-loading.Mui-disabled:hover': {
              backgroundColor: theme.palette.primary.main,
            },
          }),
          outlined: ({ theme }) => ({
            '&.MuiButton-loading.Mui-disabled': {
              color: theme.palette.primary.main,
              borderColor: alpha(theme.palette.primary.main, 0.5),
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
          }),
          text: ({ theme }) => ({
            '&.MuiButton-loading.Mui-disabled': {
              color: theme.palette.primary.main,
            },
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: appBarBackgroundImage,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: cardBackgroundImage,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: input.size,
          variant: input.variant,
        },
      },
      MuiCheckbox: {
        defaultProps: {
          size: input.size,
        },
      },
      MuiRadio: {
        defaultProps: {
          size: input.size,
        },
      },
      MuiSelect: {
        styleOverrides: {
          icon: {
            top: 'unset !important',
            right: 6,
            width: 'auto',
            height: 'auto',
            padding: 6,
            pointerEvents: 'none',
            '& .MuiSvgIcon-root': {
              fontSize: '1.25rem',
            },
          },
          iconOpen: {
            transform: 'none',
          },
        },
      },
      MuiNativeSelect: {
        styleOverrides: {
          icon: {
            top: 'unset !important',
          },
        },
      },
      MuiFormControl: {
        defaultProps: {
          size: input.size,
          variant: input.variant,
        },
        styleOverrides: {
          root: {
            '&:not(.MuiFormControl-fullWidth)': {
              width: input.width,
              maxWidth: input.maxWidth,
            },
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: ({ theme }) => ({
            fontSize: label.fontSize,
            fontWeight: label.fontWeight,
            color: inputLabelColor,
            '&.Mui-focused': {
              fontWeight: label.focusFontWeight,
            },
            '&.Mui-error': {
              color: theme.palette.error.main,
            },
          }),
          asterisk: ({ theme }) => ({
            color: theme.palette.error.main,
            '&.Mui-error': {
              color: theme.palette.error.main,
            },
          }),
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: ({ theme }) => ({
            fontFamily: 'var(--small-font-family)',
            '&.Mui-error': {
              color: theme.palette.error.main,
            },
          }),
          contained: {
            marginLeft: 0,
            marginRight: 0,
          },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            marginRight: 0,
            padding: 2.5,
          },
          label: {
            fontSize: label.fontSize,
            fontWeight: label.fontWeight,
          },
          asterisk: ({ theme }) => ({
            color: theme.palette.error.main,
            '&.Mui-error': {
              color: theme.palette.error.main,
            },
          }),
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            fontSize: '1rem',
          },
        },
      },
      MuiFormGroup: {
        styleOverrides: {
          row: {
            '&.MuiRadioGroup-row': {
              gap: '16px',
            },
          },
        },
      },
      MuiInputLabel: {
        defaultProps: {
          shrink: label.shrink,
          disableAnimation: label.disableAnimation,
        },
        styleOverrides: {
          root: ({ theme }) => ({
            position: label.position,
            transform: label.transform,
            maxWidth: label.maxWidth,
            pointerEvents: label.pointerEvents,
            fontSize: label.fontSize,
            fontWeight: label.fontWeight,
            color: inputLabelColor,
            '&.Mui-focused': {
              fontWeight: label.focusFontWeight,
            },
            '&.Mui-error': {
              color: theme.palette.error.main,
            },
            '&.Mui-focused.Mui-error': {
              color: theme.palette.error.main,
            },
          }),
          formControl: {
            position: label.position,
            transform: label.transform,
          },
          outlined: {
            transform: label.transform,
          },
          shrink: {
            transform: label.transform,
          },
        },
      },
      MuiOutlinedInput: {
        defaultProps: {
          size: input.size,
          notched: input.notched,
        },
        styleOverrides: {
          input: {
            lineHeight: inputLineHeight,
          },
          sizeSmall: {
            lineHeight: inputLineHeight,
          },
          root: ({ theme }) => ({
            borderRadius: input.borderRadius,
            '& .MuiInputAdornment-positionEnd': {
              marginLeft: 4,
              marginRight: 0,
            },
            '& .MuiInputAdornment-positionEnd .MuiIconButton-root': {
              padding: 6,
            },
            '& .MuiInputAdornment-positionEnd .MuiIconButton-edgeEnd': {
              marginRight: -8,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: input.outlineBorderWidth,
              transition: 'border-color 180ms ease',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: input.outlineBorderWidth,
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
      MuiPickersTextField: {
        styleOverrides: {
          root: {
            '&:not(.MuiFormControl-fullWidth)': {
              width: input.width,
              maxWidth: input.maxWidth,
            },
          },
        },
      },
      MuiPickersOutlinedInput: {
        defaultProps: {
          notched: input.notched,
        },
        styleOverrides: {
          input: {
            lineHeight: inputLineHeight,
          },
          inputSizeSmall: {
            lineHeight: inputLineHeight,
          },
          root: ({ theme }) => ({
            borderRadius: input.borderRadius,
            '& .MuiInputAdornment-positionEnd': {
              marginLeft: 4,
              marginRight: 0,
            },
            '& .MuiInputAdornment-positionEnd .MuiIconButton-root': {
              padding: 6,
            },
            '& .MuiPickersOutlinedInput-notchedOutline': {
              borderWidth: input.outlineBorderWidth,
              transition: 'border-color 180ms ease',
            },
            '&.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
              borderWidth: input.outlineBorderWidth,
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
    },
  });
}
