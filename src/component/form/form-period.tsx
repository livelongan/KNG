import { DatePicker, type DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import {
  DateTimePicker,
  type DateTimePickerProps,
} from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import type { FocusEvent } from 'react';
import { useMemo } from 'react';
import type { FormStore } from '../../hook';
import type { FormDateName } from './form-base';

type FormValues = Record<string, unknown>;
type GenericSlotProps = Record<string, unknown>;
export type DateStorageFormat = 'js-date' | string;
type TextFieldFocusEvent = FocusEvent<HTMLInputElement | HTMLTextAreaElement>;

const resolveSlotProps = (source: unknown, ownerState: unknown): GenericSlotProps => {
  if (typeof source === 'function') {
    const resolved = (source as (input: unknown) => unknown)(ownerState);
    return resolved && typeof resolved === 'object' ? (resolved as GenericSlotProps) : {};
  }

  return source && typeof source === 'object' ? (source as GenericSlotProps) : {};
};

const hasTimeToken = (format: string): boolean => /[Hhmsa]/.test(format);

export type FormPeriodProps<
  TValues extends FormValues,
  TField extends FormDateName<TValues> = FormDateName<TValues>,
> = Omit<DateTimePickerProps, 'value' | 'onChange'> & {
  store: FormStore<TValues>;
  name: TField;
  onChange?: (value: dayjs.Dayjs | null, context: unknown) => void;
  storageFormat?: DateStorageFormat;
  clearable?: boolean;
  onClear?: () => void;
  amp?: boolean;
};

export type FormPeriodDateProps<
  TValues extends FormValues,
  TField extends FormDateName<TValues> = FormDateName<TValues>,
> = FormPeriodProps<TValues, TField>;

export const FormPeriod = <
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
  amp = false,
  ...props
}: FormPeriodProps<TValues, TField>) => {
  const { values, errors, rules, hook } = store;
  const rule = rules[name];
  const value = values[name];
  const required = useMemo(
    () => Boolean(hook.getRuleValue(rule?.required)),
    [hook, rule],
  );
  const resolvedStorageFormat = storageFormat ?? format;
  const useDateTimePicker = hasTimeToken(format);

  const clearFieldValue = () => {
    const clearedValue =
      resolvedStorageFormat === 'js-date' ? null : ('' as TValues[TField]);
    hook.setValue(name, clearedValue as TValues[TField]);
    hook.setError(name, null);
    onClear?.();
  };

  const pickerValue = useMemo(() => {
    if (value === null || value === undefined || value === '') return null;
    const parsedValue = dayjs(value as string | Date | number);
    return parsedValue.isValid() ? parsedValue : null;
  }, [value]);

  const mergedSlotProps: GenericSlotProps = {
    ...resolveSlotProps(slotProps, values),
    field: (ownerState: unknown) => {
      const fieldSlotProps = resolveSlotProps(
        resolveSlotProps(slotProps, values).field,
        ownerState,
      );
      const externalOnClear = fieldSlotProps.onClear as
        ((event: unknown) => void) | undefined;
      return {
        ...fieldSlotProps,
        clearable,
        onClear: (event: unknown) => {
          clearFieldValue();
          externalOnClear?.(event);
        },
      };
    },
    textField: (ownerState: unknown) => {
      const textFieldSlotProps = resolveSlotProps(
        resolveSlotProps(slotProps, values).textField,
        ownerState,
      );
      const externalOnFocus = textFieldSlotProps.onFocus as
        ((event: TextFieldFocusEvent) => void) | undefined;
      const externalOnBlur = textFieldSlotProps.onBlur as
        ((event: TextFieldFocusEvent) => void) | undefined;
      return {
        ...textFieldSlotProps,
        name: String(name),
        error: Boolean(errors[name]) || Boolean(textFieldSlotProps.error),
        helperText: errors[name] ?? textFieldSlotProps.helperText,
        required: required || Boolean(textFieldSlotProps.required),
        onFocus: (event: TextFieldFocusEvent) => {
          hook.setFieldFocus(name);
          externalOnFocus?.(event);
        },
        onBlur: (event: TextFieldFocusEvent) => {
          hook.setFieldBlur(name);
          externalOnBlur?.(event);
        },
      };
    },
  };

  const handleChange = (nextValue: dayjs.Dayjs | null, context: unknown) => {
    const normalizedValue = nextValue && nextValue.isValid() ? nextValue : null;
    const storedValue = !normalizedValue
      ? resolvedStorageFormat === 'js-date'
        ? null
        : ('' as TValues[TField])
      : resolvedStorageFormat === 'js-date'
        ? normalizedValue.toDate()
        : normalizedValue.format(resolvedStorageFormat);

    hook.setValue(name, storedValue as TValues[TField]);
    hook.setError(name, null);
    onChange?.(nextValue, context);
  };

  if (useDateTimePicker) {
    return (
      <DateTimePicker
        {...(props as DateTimePickerProps)}
        ampm={amp}
        format={format}
        value={pickerValue}
        onChange={handleChange}
        slotProps={mergedSlotProps as DateTimePickerProps['slotProps']}
      />
    );
  }

  return (
    <DatePicker
      {...(props as DatePickerProps)}
      format={format}
      value={pickerValue}
      onChange={handleChange}
      slotProps={mergedSlotProps as DatePickerProps['slotProps']}
    />
  );
};
