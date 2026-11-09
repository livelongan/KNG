import { TextField, type TextFieldProps } from '@mui/material'
import { memo } from 'react'
import { FormBase, type FormTextName } from './form-base'
import { areFormFieldPropsEqual } from './form-field-memo'
import type { FormStore } from './use-form'

type FormValues = Record<string, unknown>

const nonDigitPattern = /\D+/g

export type FormDigitalProps<
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
> = Omit<TextFieldProps, 'type'> & {
  store: FormStore<TValues>
  name: TField
  clearable?: boolean
  onClear?: () => void
}

const FormDigitalBase = <
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
>({
  store,
  name,
  clearable = true,
  onClear,
  slotProps,
  onChange,
  onFocus,
  onBlur,
  helperText,
  error,
  required: requiredProp,
  disabled,
  ...textFieldProps
}: FormDigitalProps<TValues, TField>) => {
  return (
    <FormBase
      store={store}
      name={name}
      slotProps={slotProps}
      clearable={clearable}
      disabled={disabled}
      onClear={onClear}
    >
      {({
        name: fieldName,
        value,
        errorMessage,
        required,
        slotProps: mergedSlotProps,
        onFieldChange,
        onFieldFocus,
        onFieldBlur,
      }) => (
        <TextField
          {...textFieldProps}
          type="text"
          name={fieldName}
          value={value}
          error={Boolean(errorMessage) || Boolean(error)}
          helperText={errorMessage ?? helperText}
          required={required || Boolean(requiredProp)}
          disabled={disabled}
          onChange={(event) => {
            const nextValue = event.target.value.replace(nonDigitPattern, '')

            if (nextValue !== event.target.value) {
              event.target.value = nextValue
            }

            onFieldChange(nextValue)
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
      )}
    </FormBase>
  )
}

export const FormDigital = memo(FormDigitalBase, areFormFieldPropsEqual) as typeof FormDigitalBase
