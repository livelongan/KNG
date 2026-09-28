import TaskAltIcon from '@mui/icons-material/TaskAlt'
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  type FormControlProps,
  type FormLabelProps,
  type RadioGroupProps,
} from '@mui/material'
import { useMemo, type ReactNode } from 'react'
import type { FormStore } from '../../hook'
import type { FormTextName } from './form-base'

type FormValues = Record<string, unknown>

export type FormRadioOption<TValue extends string = string> = {
  key?: string
  value: TValue
  label: ReactNode
  disabled?: boolean
}

export type FormRadioGroupProps<
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
> = Omit<RadioGroupProps, 'name' | 'value' | 'onChange'> & {
  store: FormStore<TValues>
  name: TField
  label?: ReactNode
  options: ReadonlyArray<FormRadioOption<TValues[TField] & string>>
  helperText?: ReactNode
  required?: boolean
  disabled?: boolean
  onValueChange?: (nextValue: TValues[TField] & string) => void
  onFocus?: () => void
  onBlur?: () => void
  formControlProps?: Omit<FormControlProps, 'error' | 'required' | 'disabled'>
  formLabelProps?: FormLabelProps
}

export const FormRadioGroup = <
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
>({
  store,
  name,
  label,
  options,
  helperText,
  required: requiredProp,
  disabled,
  onValueChange,
  onFocus,
  onBlur,
  formControlProps,
  formLabelProps,
  ...radioGroupProps
}: FormRadioGroupProps<TValues, TField>) => {
  const {
    values,
    errors,
    rules,
    hook: { getRuleValue, setError, setFieldBlur, setFieldFocus, setValue },
  } = store

  const rule = rules[name]
  const value = (values[name] as string) ?? ''
  const errorMessage = errors[name]
  const hasError = Boolean(errorMessage)
  const helperTextContent = errorMessage ?? helperText
  const required = useMemo(
    () => Boolean(getRuleValue(rule?.required)) || Boolean(requiredProp),
    [getRuleValue, requiredProp, rule],
  )
  const isVertical = radioGroupProps.row !== true

  return (
    <FormControl {...formControlProps} error={hasError} required={required} disabled={disabled}>
      {label ? <FormLabel {...formLabelProps}>{label}</FormLabel> : null}
      <RadioGroup
        {...radioGroupProps}
        name={String(name)}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value as TValues[TField] & string

          setValue(name, nextValue as TValues[TField])
          setError(name, undefined)
          onValueChange?.(nextValue)
        }}
        onFocus={() => {
          setFieldFocus(name)
          onFocus?.()
        }}
        onBlur={() => {
          setFieldBlur(name)
          onBlur?.()
        }}
        sx={isVertical ? { gap: 1 } : undefined}
      >
        {options.map((option, index) => {
          const optionDisabled = Boolean(disabled || option.disabled)

          return (
            <FormControlLabel
              key={option.key ?? `${String(option.value)}-${String(index)}`}
              value={option.value}
              disabled={optionDisabled}
              control={<Radio checkedIcon={<TaskAltIcon />} />}
              label={option.label}
              sx={(theme) => ({
                alignItems: 'center',
                borderStyle: 'solid',
                borderWidth: 1,
                borderRadius: `${theme.shape.borderRadius}px`,
                borderColor: hasError
                  ? theme.palette.error.main
                  : theme.palette.mode === 'light'
                    ? 'rgba(0, 0, 0, 0.23)'
                    : 'rgba(255, 255, 255, 0.23)',
                transition: 'border-color 180ms ease, background-color 180ms ease',
                margin: 0,
                marginLeft: 0,
                width: isVertical ? '100%' : 'auto',
                ...(optionDisabled
                  ? {
                      borderColor: theme.palette.action.disabled,
                      backgroundColor: theme.palette.action.disabledBackground,
                    }
                  : {
                      '&:hover': {
                        borderColor: hasError
                          ? theme.palette.error.dark
                          : theme.palette.text.primary,
                      },
                      '&:focus-within': {
                        borderColor: hasError
                          ? theme.palette.error.main
                          : theme.palette.primary.main,
                      },
                    }),
              })}
            />
          )
        })}
      </RadioGroup>
      {helperTextContent && <FormHelperText>{helperTextContent}</FormHelperText>}
    </FormControl>
  )
}
