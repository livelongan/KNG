import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded'
import { IconButton, InputAdornment, Stack, TextField, type TextFieldProps } from '@mui/material'
import { memo, type ReactNode } from 'react'
import { FormBase, type FormNumberName } from './form-base'
import { areFormFieldPropsEqual } from './form-field-memo'
import type { FormStore } from './use-form'

type FormValues = Record<string, unknown>
type GenericSlotProps = Record<string, unknown>

type NumericActionButtonProps = {
  label: string
  disabled: boolean
  onClick: () => void
  icon: ReactNode
}

const resolveSlotProps = (source: unknown, ownerState: unknown): GenericSlotProps => {
  if (typeof source === 'function') {
    const resolved = (source as (input: unknown) => unknown)(ownerState)

    if (resolved && typeof resolved === 'object') {
      return resolved as GenericSlotProps
    }

    return {}
  }

  if (source && typeof source === 'object') {
    return source as GenericSlotProps
  }

  return {}
}

const toFiniteNumber = (input: unknown): number | undefined => {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : undefined
  }

  const parsedValue = Number(input)
  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

export type FormNumericProps<
  TValues extends FormValues,
  TField extends FormNumberName<TValues> = FormNumberName<TValues>,
> = Omit<TextFieldProps, 'type'> & {
  store: FormStore<TValues>
  name: TField
  clearable?: boolean
  onClear?: () => void
}

const NumericActionButton = ({ label, disabled, onClick, icon }: NumericActionButtonProps) => {
  return (
    <IconButton
      aria-label={label}
      disabled={disabled}
      onPointerDown={(event) => {
        event.preventDefault()
      }}
      onClick={onClick}
      size="small"
      tabIndex={-1}
      type="button"
      sx={{ padding: '0 8px !important', borderRadius: '0px' }}
    >
      {icon}
    </IconButton>
  )
}

const FormNumericBase = <
  TValues extends FormValues,
  TField extends FormNumberName<TValues> = FormNumberName<TValues>,
>({
  store,
  name,
  slotProps,
  onChange,
  onFocus,
  onBlur,
  helperText,
  error,
  required: requiredProp,
  disabled,
  clearable = true,
  onClear,
  ...textFieldProps
}: FormNumericProps<TValues, TField>) => {
  const { values, formError: formErrorStore, formValue: formValueStore } = store
  const setError = formErrorStore.set
  const setValue = formValueStore.set

  const rawValue = values[name]
  let inputValue: string | number = ''
  if (rawValue !== null && rawValue !== undefined) {
    if (typeof rawValue === 'number') {
      inputValue = Number.isFinite(rawValue) ? rawValue : ''
    } else if (typeof rawValue === 'string') {
      inputValue = rawValue
    } else {
      const parsedValue = Number(rawValue)
      inputValue = Number.isFinite(parsedValue) ? parsedValue : ''
    }
  }

  const hasInputValue = inputValue !== ''

  const handleFieldClear = () => {
    if (onClear) {
      onClear()
      return
    }

    setValue(name, Number.NaN as TValues[TField])
    setError(name, undefined)
  }

  return (
    <FormBase<TValues, TField>
      store={store}
      name={name}
      slotProps={slotProps}
      clearable={clearable}
      disabled={disabled}
      onClear={handleFieldClear}
    >
      {({
        name: fieldName,
        errorMessage,
        required,
        min,
        max,
        step,
        autoComplete,
        inputMode,
        slotProps: baseSlotProps,
        onFieldFocus,
        onFieldBlur,
      }) => {
        const normalizedMin = toFiniteNumber(min)
        const normalizedMax = toFiniteNumber(max)
        const normalizedStep = (() => {
          const parsedStep = toFiniteNumber(step)
          return parsedStep !== undefined && parsedStep > 0 ? parsedStep : 1
        })()
        const stepAsText = String(normalizedStep)
        const decimalPart = stepAsText.split('.')[1]
        const stepPrecision = decimalPart ? decimalPart.length : 0

        const currentNumericValue = (() => {
          if (inputValue === '') {
            return normalizedMin ?? 0
          }

          const parsedValue = Number(inputValue)
          return Number.isFinite(parsedValue) ? parsedValue : (normalizedMin ?? 0)
        })()

        const updateNumberValue = (nextValue: number) => {
          if (Number.isNaN(nextValue)) {
            return
          }

          const roundedValue = Number(nextValue.toFixed(stepPrecision))
          const minBoundValue =
            normalizedMin !== undefined ? Math.max(roundedValue, normalizedMin) : roundedValue
          const clampedValue =
            normalizedMax !== undefined ? Math.min(minBoundValue, normalizedMax) : minBoundValue

          setValue(name, clampedValue as TValues[TField])
          setError(name, undefined)
        }

        const incrementTargetValue = hasInputValue
          ? currentNumericValue + normalizedStep
          : (normalizedMin ?? 0)
        const decrementTargetValue = hasInputValue
          ? currentNumericValue - normalizedStep
          : (normalizedMin ?? 0) - normalizedStep
        const canIncrement = normalizedMax === undefined || incrementTargetValue <= normalizedMax
        const canDecrement = normalizedMin === undefined || decrementTargetValue >= normalizedMin

        const mergedSlotProps: TextFieldProps['slotProps'] = {
          ...baseSlotProps,
          input: (ownerState) => {
            const inputSlotProps = resolveSlotProps(baseSlotProps?.input, ownerState)
            const externalEndAdornment = inputSlotProps.endAdornment as ReactNode

            return {
              ...inputSlotProps,
              endAdornment: (
                <>
                  {externalEndAdornment}
                  <InputAdornment position="end" sx={{ marginRight: '-12px !important' }}>
                    <Stack direction="column" spacing={0}>
                      <NumericActionButton
                        label={`Increase ${fieldName}`}
                        disabled={Boolean(disabled || !canIncrement)}
                        onClick={() => {
                          updateNumberValue(incrementTargetValue)
                        }}
                        icon={<KeyboardArrowUpRoundedIcon fontSize="small" />}
                      />
                      <NumericActionButton
                        label={`Decrease ${fieldName}`}
                        disabled={Boolean(disabled || !canDecrement)}
                        onClick={() => {
                          updateNumberValue(decrementTargetValue)
                        }}
                        icon={<KeyboardArrowDownRoundedIcon fontSize="small" />}
                      />
                    </Stack>
                  </InputAdornment>
                </>
              ),
            }
          },
          htmlInput: (ownerState) => {
            const htmlInputSlotProps = resolveSlotProps(baseSlotProps?.htmlInput, ownerState)

            return {
              ...htmlInputSlotProps,
              min: min ?? (htmlInputSlotProps.min as number | undefined),
              max: max ?? (htmlInputSlotProps.max as number | undefined),
              step: step ?? (htmlInputSlotProps.step as number | undefined),
              autoComplete: autoComplete ?? (htmlInputSlotProps.autoComplete as string | undefined),
              inputMode: inputMode ?? (htmlInputSlotProps.inputMode as string | undefined),
            }
          },
        }

        return (
          <TextField
            {...textFieldProps}
            type="number"
            sx={[
              {
                '& input[type="number"]': { MozAppearance: 'textfield' },
                '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button':
                  { WebkitAppearance: 'none', margin: 0 },
              },
              ...(Array.isArray(textFieldProps.sx)
                ? textFieldProps.sx
                : textFieldProps.sx === undefined
                  ? []
                  : [textFieldProps.sx]),
            ]}
            name={fieldName}
            value={inputValue}
            error={Boolean(errorMessage) || Boolean(error)}
            helperText={errorMessage ?? helperText}
            required={required || Boolean(requiredProp)}
            disabled={disabled}
            onChange={(event) => {
              const nextRawValue = event.target.value
              if (nextRawValue.trim().length === 0) {
                setValue(name, Number.NaN as TValues[TField])
                setError(name, undefined)
                onChange?.(event)
                return
              }

              const nextValue = Number(nextRawValue)

              updateNumberValue(nextValue)
              onChange?.(event)
            }}
            onFocus={(event) => {
              onFieldFocus()
              onFocus?.(event)
            }}
            onBlur={(event) => {
              onFieldBlur()
              onBlur?.(event)
            }}
            slotProps={mergedSlotProps}
          />
        )
      }}
    </FormBase>
  )
}

export const FormNumeric = memo(FormNumericBase, areFormFieldPropsEqual) as typeof FormNumericBase
