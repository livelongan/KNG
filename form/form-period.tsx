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
import { DATE_FORMAT } from '../../constant';

type GenericSlotProps = Record<string, unknown>;
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
  TValues extends KeyValue,
  TField extends FormDateName<TValues> = FormDateName<TValues>,
> = Omit<DateTimePickerProps, 'value' | 'onChange'> & {
  store: FormStore<TValues>;
  name: TField;
  onChange?: (value: dayjs.Dayjs | null, context: unknown) => void;
  clearable?: boolean;
  onClear?: () => void;
  ampm?: boolean;
};

export type FormPeriodDateProps<
  TValues extends KeyValue,
  TField extends FormDateName<TValues> = FormDateName<TValues>,
> = FormPeriodProps<TValues, TField>;

const hasSecond = (format: string) => /s/.test(format);
const viewsWithSeconds = ['year', 'month', 'day', 'hours', 'minutes', 'seconds'] as const;

export const FormPeriod = <
  TValues extends KeyValue,
  TField extends FormDateName<TValues> = FormDateName<TValues>,
>({
  store,
  name,
  slotProps,
  clearable = true,
  onClear,
  onChange,
  format = DATE_FORMAT,
  ampm = false,
  views,
  ...props
}: FormPeriodProps<TValues, TField>) => {
  const { values, errors, rules, hook } = store;
  const resolvedViews = views ?? (hasSecond(format) ? viewsWithSeconds : undefined);
  const rule = rules[name];
  const value = values[name];
  const required = useMemo(
    () => Boolean(hook.getRuleValue(rule?.required)),
    [hook, rule],
  );
  const useDateTimePicker = hasTimeToken(format);

  const clearFieldValue = () => {
    hook.setValue(name, null);
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
    const storedValue = !normalizedValue ? null : normalizedValue.toDate();

    hook.setValue(name, storedValue as TValues[TField]);
    hook.setError(name, null);
    onChange?.(nextValue, context);
  };

  if (useDateTimePicker) {
    return (
      <DateTimePicker
        {...(props as DateTimePickerProps)}
        ampm={ampm}
        format={format}
        value={pickerValue}
        onChange={handleChange}
        slotProps={mergedSlotProps as DateTimePickerProps['slotProps']}
        views={resolvedViews}
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
