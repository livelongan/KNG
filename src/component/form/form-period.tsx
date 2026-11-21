import { DatePicker, type DatePickerProps } from '@mui/x-date-pickers/DatePicker'
import { DateTimePicker, type DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker'
import dayjs from 'dayjs'
import { memo, useMemo, type FocusEvent } from 'react'
import type { FormDateName } from './form-base'
import { areFormFieldPropsEqual } from './form-field-memo'
import type { FormInstance } from './use-form'

type FormValues = Record<string, unknown>
type GenericSlotProps = Record<string, unknown>
type DateStorageFormat = 'js-date' | string

type TextFieldFocusEvent = FocusEvent<HTMLInputElement | HTMLTextAreaElement>

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

const hasTimeToken = (format: string): boolean => /[HhmsaA]/.test(format)
const hasSecond = (format: string): boolean => /s/.test(format)
const viewsWithSeconds = ['year', 'month', 'day', 'hours', 'minutes', 'seconds'] as const

export type FormPeriodProps<
    TValues extends FormValues,
    TField extends FormDateName<TValues> = FormDateName<TValues>,
> = Omit<DateTimePickerProps, 'value'> & {
    store: FormInstance<TValues>
    name: TField
    storageFormat?: DateStorageFormat
    clearable?: boolean
    onClear?: () => void
}

const FormPeriodBase = <
    TValues extends FormValues,
    TField extends FormDateName<TValues> = FormDateName<TValues>,
>({
    store,
    name,
    slotProps,
    clearable = true,
    onClear,
    onChange,
    format = 'YYYY-MM-DD',
    storageFormat,
    ampm = false,
    views,
    ...props
}: FormPeriodProps<TValues, TField>) => {
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
    const value = values[name]
    const errorMessage = errors[name]
    const required = useMemo(
        () => Boolean(getRuleValue(ruleProps?.required)),
        [getRuleValue, ruleProps],
    )
    const resolvedStorageFormat = storageFormat ?? format
    const useDateTimePicker = useMemo(() => hasTimeToken(format), [format])
    const resolvedViews = views ?? (hasSecond(format) ? viewsWithSeconds : undefined)

    const clearFieldValue = () => {
        const clearedValue = (resolvedStorageFormat === 'js-date' ? null : '') as TValues[TField]

        setValue(name, clearedValue)
        if (errorMessage !== undefined) {
            setError(name, null)
        }
        onClear?.()
    }

    const pickerValue = useMemo(() => {
        if (value === null || value === undefined || value === '') {
            return null
        }

        const parsedValue = dayjs(value as Date | string | number)
        return parsedValue.isValid() ? parsedValue : null
    }, [value])

    const mergedSlotProps: DateTimePickerProps['slotProps'] = {
        ...slotProps,
        field: (ownerState) => {
            const fieldSlotProps = resolveSlotProps(slotProps?.field, ownerState)
            const externalOnClear = fieldSlotProps.onClear as ((event: unknown) => void) | undefined

            return {
                ...fieldSlotProps,
                clearable,
                onClear: (event: unknown) => {
                    clearFieldValue()
                    externalOnClear?.(event)
                },
            }
        },
        textField: (ownerState) => {
            const textFieldSlotProps = resolveSlotProps(slotProps?.textField, ownerState)
            const externalOnFocus = textFieldSlotProps.onFocus as
                ((event: TextFieldFocusEvent) => void) | undefined
            const externalOnBlur = textFieldSlotProps.onBlur as
                ((event: TextFieldFocusEvent) => void) | undefined

            return {
                ...textFieldSlotProps,
                name: String(name),
                error: Boolean(errorMessage) || Boolean(textFieldSlotProps.error),
                helperText: errorMessage ?? textFieldSlotProps.helperText,
                required: required || Boolean(textFieldSlotProps.required),
                onFocus: (event: TextFieldFocusEvent) => {
                    setFieldFocus(name)
                    externalOnFocus?.(event)
                },
                onBlur: (event: TextFieldFocusEvent) => {
                    setFieldBlur(name)
                    externalOnBlur?.(event)
                },
            }
        },
    }

    const handleChange: NonNullable<DateTimePickerProps['onChange']> = (nextValue, context) => {
        const normalizedValue = nextValue ? dayjs(nextValue) : null
        const nextStoredValue =
            resolvedStorageFormat === 'js-date'
                ? ((normalizedValue?.isValid()
                      ? normalizedValue.toDate()
                      : null) as TValues[TField])
                : ((normalizedValue?.isValid()
                      ? normalizedValue.format(resolvedStorageFormat)
                      : '') as TValues[TField])

        setValue(name, nextStoredValue)
        if (errorMessage !== undefined) {
            setError(name, null)
        }
        onChange?.(nextValue, context)
    }

    if (useDateTimePicker) {
        return (
            <DateTimePicker
                {...props}
                ampm={ampm}
                format={format}
                value={pickerValue}
                views={resolvedViews}
                onChange={handleChange}
                slotProps={mergedSlotProps}
            />
        )
    }

    return (
        <DatePicker
            {...(props as Omit<DatePickerProps, 'value'>)}
            format={format}
            value={pickerValue}
            onChange={handleChange as DatePickerProps['onChange']}
            slotProps={mergedSlotProps as DatePickerProps['slotProps']}
        />
    )
}

export const FormPeriod = memo(FormPeriodBase, areFormFieldPropsEqual) as typeof FormPeriodBase
