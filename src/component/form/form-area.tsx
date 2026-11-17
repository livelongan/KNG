import { TextField, type TextFieldProps } from '@mui/material'
import { memo } from 'react'
import { FormBase, type FormTextName } from './form-base'
import { areFormFieldPropsEqual } from './form-field-memo'
import type { FormStore } from './use-form'

type FormValues = Record<string, unknown>

export type FormAreaProps<
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
> = Omit<TextFieldProps, 'type' | 'multiline'> & {
  store: FormStore<TValues>
  name: TField
  clearable?: boolean
  onClear?: () => void
}

const FormAreaBase = <
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
  rows: rowsProp,
  ...textFieldProps
}: FormAreaProps<TValues, TField>) => {
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
        rows,
        slotProps: mergedSlotProps,
        onFieldChange,
        onFieldFocus,
        onFieldBlur,
      }) => (
        <TextField
          {...textFieldProps}
          multiline
          name={fieldName}
          value={value}
          rows={rows ?? rowsProp}
          error={Boolean(errorMessage) || Boolean(error)}
          helperText={errorMessage ?? helperText}
          required={required || Boolean(requiredProp)}
          disabled={disabled}
          onChange={(event) => {
            onFieldChange(event.target.value)
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

export const FormArea = memo(FormAreaBase, areFormFieldPropsEqual) as typeof FormAreaBase
