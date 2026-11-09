import ClearRoundedIcon from '@mui/icons-material/ClearRounded'
import { IconButton, InputAdornment, type TextFieldProps } from '@mui/material'
import { useMemo, type ReactNode } from 'react'
import type { FormStore } from './use-form'

type FormValues = Record<string, unknown>
type GenericSlotProps = Record<string, unknown>
export type FormFieldName<TValues extends FormValues> = Extract<keyof TValues, string>
type KeysByValueType<TValues extends FormValues, TValue> = Extract<
  {
    [TField in keyof TValues]-?: NonNullable<TValues[TField]> extends TValue ? TField : never
  }[keyof TValues],
  string
>

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

export type FormTextName<TValues extends FormValues> = unknown extends TValues[keyof TValues]
  ? Extract<keyof TValues, string>
  : KeysByValueType<TValues, string>
export type FormNumberName<TValues extends FormValues> = unknown extends TValues[keyof TValues]
  ? Extract<keyof TValues, string>
  : KeysByValueType<TValues, number>
export type FormDateName<TValues extends FormValues> = unknown extends TValues[keyof TValues]
  ? Extract<keyof TValues, string>
  : KeysByValueType<TValues, string | Date>
export type FormBooleanName<TValues extends FormValues> = unknown extends TValues[keyof TValues]
  ? Extract<keyof TValues, string>
  : KeysByValueType<TValues, boolean>

export type FormFieldProps = {
  name: string
  value: string
  errorMessage?: string
  required: boolean
  rows?: number
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  step?: number
  autoComplete?: string
  inputMode?: string
  slotProps: TextFieldProps['slotProps']
  onFieldChange: (nextValue: string) => void
  onFieldFocus: () => void
  onFieldBlur: () => void
  onFieldClear: () => void
}

export type FormBaseProps<
  TValues extends FormValues,
  TField extends FormFieldName<TValues> = FormFieldName<TValues>,
> = {
  store: FormStore<TValues>
  name: TField
  slotProps?: TextFieldProps['slotProps']
  clearable?: boolean
  disabled?: boolean
  onChange?: (nextValue: string) => void
  onFocus?: () => void
  onBlur?: () => void
  onClear?: () => void
  children: (fieldProps: FormFieldProps) => ReactNode
}

export const FormBase = <
  TValues extends FormValues,
  TField extends FormFieldName<TValues> = FormFieldName<TValues>,
>({
  store,
  name,
  slotProps,
  clearable = true,
  disabled,
  onChange,
  onFocus,
  onBlur,
  onClear,
  children,
}: FormBaseProps<TValues, TField>) => {
  const {
    values,
    errors,
    rules,
    formRule: formRuleStore,
    formError: formErrorStore,
    formField: formFieldStore,
    formValue: formValueStore,
  } = store
  const getRuleValue = formRuleStore.ruleValue
  const setError = formErrorStore.set
  const setFieldBlur = formFieldStore.blur
  const setFieldFocus = formFieldStore.focus
  const setValue = formValueStore.set
  const rule = rules[name]
  const rawValue = values[name]
  const value =
    rawValue === null ||
    rawValue === undefined ||
    (typeof rawValue === 'number' && Number.isNaN(rawValue))
      ? ''
      : String(rawValue)
  const errorMessage = errors[name]
  const { required, rows, minLength, maxLength, min, max, step, autoComplete, inputMode } = useMemo(
    () => ({
      required: Boolean(getRuleValue(rule?.required)),
      rows: rule?.rows,
      minLength: getRuleValue(rule?.minLength),
      maxLength: getRuleValue(rule?.maxLength),
      min: getRuleValue(rule?.min),
      max: getRuleValue(rule?.max),
      step: rule?.step,
      autoComplete: rule?.autoComplete,
      inputMode: rule?.inputMode,
    }),
    [getRuleValue, rule],
  )

  const onFieldChange = (nextValue: string) => {
    setValue(name, nextValue as TValues[TField])
    if (errorMessage !== undefined) {
      setError(name, undefined)
    }
    onChange?.(nextValue)
  }
  const onFieldFocus = () => {
    setFieldFocus(name)
    onFocus?.()
  }
  const onFieldBlur = () => {
    setFieldBlur(name)
    onBlur?.()
  }
  const onFieldClear = () => {
    if (onClear) {
      onClear()
      return
    }
    setValue(name, '' as TValues[TField])
    if (errorMessage !== undefined) {
      setError(name, undefined)
    }
  }

  const mergedSlotProps: TextFieldProps['slotProps'] = {
    ...slotProps,
    input: (ownerState) => {
      const inputSlotProps = resolveSlotProps(slotProps?.input, ownerState)
      const externalEndAdornment = inputSlotProps.endAdornment as ReactNode
      const showClear = Boolean(clearable && value && !disabled)

      return {
        ...inputSlotProps,
        endAdornment: showClear ? (
          <>
            {externalEndAdornment}
            <InputAdornment position="end">
              <IconButton
                aria-label={`Clear ${String(name)}`}
                edge="end"
                onPointerDown={(event) => {
                  event.preventDefault()
                }}
                onClick={onFieldClear}
                size="small"
                type="button"
                className="clear-button"
              >
                <ClearRoundedIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          </>
        ) : (
          (externalEndAdornment ?? null)
        ),
      }
    },
    htmlInput: (ownerState) => {
      const htmlInputSlotProps = resolveSlotProps(slotProps?.htmlInput, ownerState)

      return {
        ...htmlInputSlotProps,
        minLength: minLength ?? (htmlInputSlotProps.minLength as number | undefined),
        maxLength: maxLength ?? (htmlInputSlotProps.maxLength as number | undefined),
        min: min ?? (htmlInputSlotProps.min as number | undefined),
        max: max ?? (htmlInputSlotProps.max as number | undefined),
        step: step ?? (htmlInputSlotProps.step as number | undefined),
        autoComplete: autoComplete ?? (htmlInputSlotProps.autoComplete as string | undefined),
        inputMode: inputMode ?? (htmlInputSlotProps.inputMode as string | undefined),
      }
    },
  }

  return children({
    name: String(name),
    value,
    errorMessage,
    required,
    rows,
    minLength,
    maxLength,
    min,
    max,
    step,
    autoComplete,
    inputMode,
    slotProps: mergedSlotProps,
    onFieldChange,
    onFieldFocus,
    onFieldBlur,
    onFieldClear,
  })
}
