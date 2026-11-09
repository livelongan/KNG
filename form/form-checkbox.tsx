import CheckIcon from '@mui/icons-material/Check'
import CheckBoxOutlineBlankSharpIcon from '@mui/icons-material/CheckBoxOutlineBlankSharp'
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  type CheckboxProps,
  type FormControlLabelProps,
} from '@mui/material'
import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { FormBooleanName } from './form-base'
import { areFormFieldPropsEqual } from './form-field-memo'
import type { FormStore } from './use-form'

type FormValues = Record<string, unknown>

export type FormCheckboxProps<
  TValues extends FormValues,
  TField extends FormBooleanName<TValues> = FormBooleanName<TValues>,
> = Omit<CheckboxProps, 'name' | 'checked' | 'onChange' | 'required'> & {
  store: FormStore<TValues>
  name: TField
  label?: ReactNode
  helperText?: ReactNode
  required?: boolean
  onCheckedChange?: (checked: boolean) => void
  onFocus?: () => void
  onBlur?: () => void
  formControlLabelProps?: Omit<FormControlLabelProps, 'control' | 'label' | 'disabled'>
}

const FormCheckboxBase = <
  TValues extends FormValues,
  TField extends FormBooleanName<TValues> = FormBooleanName<TValues>,
>({
  store,
  name,
  label,
  helperText,
  required: requiredProp,
  disabled,
  onCheckedChange,
  onFocus,
  onBlur,
  formControlLabelProps,
  ...checkboxProps
}: FormCheckboxProps<TValues, TField>) => {
  const formControlLabelRef = useRef<HTMLLabelElement | null>(null)
  const [isLabelWrapped, setIsLabelWrapped] = useState(false)

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

  const ruleProps = rules[name]
  const checked = Boolean(values[name])
  const errorMessage = errors[name]
  const hasError = Boolean(errorMessage)
  const helperTextContent = errorMessage ?? helperText
  const required = useMemo(
    () => Boolean(getRuleValue(ruleProps?.required)) || Boolean(requiredProp),
    [getRuleValue, requiredProp, ruleProps],
  )
  const borderStyle = {
    borderColor: hasError ? 'var(--error-main)' : 'var(--divider)',
    '&:hover': { borderColor: hasError ? 'var(--error-dark)' : 'var(--text-primary)' },
    '&:focus-within': { borderColor: hasError ? 'var(--error-main)' : 'var(--primary-main)' },
  }

  useEffect(() => {
    const labelElement = formControlLabelRef.current?.querySelector<HTMLElement>(
      '.MuiFormControlLabel-label',
    )

    if (!labelElement) {
      setIsLabelWrapped(false)
      return
    }

    const updateWrapState = () => {
      const computedStyle = window.getComputedStyle(labelElement)
      const lineHeight = Number.parseFloat(computedStyle.lineHeight || '0')

      if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
        setIsLabelWrapped(false)
        return
      }

      const renderedHeight = labelElement.getBoundingClientRect().height
      setIsLabelWrapped(renderedHeight > lineHeight + 1)
    }

    updateWrapState()
    const resizeObserver = new ResizeObserver(() => {
      updateWrapState()
    })
    resizeObserver.observe(labelElement)

    window.addEventListener('resize', updateWrapState)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateWrapState)
    }
  }, [label])

  return (
    <FormControl error={hasError} required={required} disabled={disabled}>
      <Box
        sx={{
          border: '1px solid',
          borderRadius: 'var(--border-radius)',
          '& .MuiFormControlLabel-root': {
            alignItems: isLabelWrapped ? 'flex-start' : 'center',
            width: '100%',
            marginLeft: 0,
            marginRight: 0,
            display: 'flex',
          },
          '& .MuiFormControlLabel-label': { minWidth: 0, flex: 1 },
          transition: 'border-color 180ms ease, background-color 180ms ease',
          ...(disabled
            ? {
                borderColor: 'var(--action-disabled)',
                backgroundColor: 'var(--background-disabled)',
              }
            : borderStyle),
        }}
      >
        <FormControlLabel
          ref={formControlLabelRef}
          {...formControlLabelProps}
          label={label}
          disabled={disabled}
          control={
            <Checkbox
              {...checkboxProps}
              name={String(name)}
              checked={checked}
              checkedIcon={<CheckIcon />}
              icon={<CheckBoxOutlineBlankSharpIcon />}
              required={required}
              disabled={disabled}
              onChange={(_, nextChecked) => {
                setValue(name, nextChecked as TValues[TField])
                setError(name, undefined)
                onCheckedChange?.(nextChecked)
              }}
              onFocus={() => {
                setFieldFocus(name)
                onFocus?.()
              }}
              onBlur={() => {
                setFieldBlur(name)
                onBlur?.()
              }}
            />
          }
        />
      </Box>
      {helperTextContent ? <FormHelperText>{helperTextContent}</FormHelperText> : null}
    </FormControl>
  )
}

export const FormCheckbox = memo(
  FormCheckboxBase,
  areFormFieldPropsEqual,
) as typeof FormCheckboxBase
