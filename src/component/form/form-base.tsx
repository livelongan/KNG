import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import type { FormStore } from '../../hook';

type FormValues = Record<string, unknown>;

type GenericSlotProps<TValues extends FormValues> =
  TextFieldProps['slotProps'] | ((ownerState: TValues) => TextFieldProps['slotProps']);

const resolveSlotProps = <TValues extends FormValues>(
  source: GenericSlotProps<TValues> | undefined,
  ownerState: TValues,
): TextFieldProps['slotProps'] => {
  if (typeof source === 'function') {
    return source(ownerState);
  }
  return source;
};

export type FormTextName<TValues extends FormValues> = keyof TValues & string;
export type FormNumberName<TValues extends FormValues> = keyof TValues & string;
export type FormDateName<TValues extends FormValues> = keyof TValues & string;
export type FormBooleanName<TValues extends FormValues> = keyof TValues & string;

export type FormFieldProps = {
  name: string;
  value: string;
  errorMessage?: string;
  required?: boolean;
  rows?: number;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  autoComplete?: string;
  inputMode?: string;
  slotProps?: TextFieldProps['slotProps'];
  onFieldChange: (nextValue: string) => void;
  onFieldFocus: () => void;
  onFieldBlur: () => void;
  onFieldClear?: () => void;
};

export type FormBaseProps<
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
> = {
  store: FormStore<TValues>;
  name: TField;
  slotProps?: TextFieldProps['slotProps'];
  clearable?: boolean;
  disabled?: boolean;
  onChange?: (nextValue: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  children: (fieldProps: FormFieldProps) => React.ReactNode;
};

export const FormBase = <
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
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
  const rule = store.rules[name];
  const value = String(store.values[name] ?? '');
  const errorMessage = store.errors[name];
  const getRuleValue = store.hook.getRuleValue;
  const required = Boolean(getRuleValue(rule?.required));
  const mergedSlotProps = resolveSlotProps(slotProps, store.values);

  const onFieldChange = (nextValue: string) => {
    store.hook.setValue(name, nextValue as TValues[TField]);
    store.hook.setError(name, null);
    onChange?.(nextValue);
  };
  const onFieldFocus = () => {
    store.hook.setFieldFocus(name);
    onFocus?.();
  };
  const onFieldBlur = () => {
    store.hook.setFieldBlur(name);
    onBlur?.();
  };
  const onFieldClear = () => {
    if (onClear) onClear();
    else onFieldChange('');
  };

  return children({
    name,
    value,
    errorMessage,
    required,
    rows: rule?.rows,
    minLength: getRuleValue(rule?.minLength),
    maxLength: getRuleValue(rule?.maxLength),
    min: getRuleValue(rule?.min),
    max: getRuleValue(rule?.max),
    step: rule?.step,
    autoComplete: rule?.autoComplete,
    inputMode: rule?.inputMode,
    slotProps: mergedSlotProps,
    onFieldChange,
    onFieldFocus,
    onFieldBlur,
    onFieldClear: clearable ? onFieldClear : undefined,
  });
};

export const FormTextName = <TValues extends FormValues>(
  props: FormBaseProps<TValues>,
) => (
  <FormBase {...props}>
    {(field) => (
      <TextField
        fullWidth
        name={field.name}
        value={field.value}
        error={Boolean(field.errorMessage)}
        helperText={field.errorMessage}
        required={field.required}
        disabled={props.disabled}
        onChange={(event) => field.onFieldChange(event.target.value)}
        onFocus={field.onFieldFocus}
        onBlur={field.onFieldBlur}
        slotProps={field.slotProps}
      />
    )}
  </FormBase>
);
