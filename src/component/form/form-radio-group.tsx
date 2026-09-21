import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import type { FormControlProps, FormLabelProps, RadioGroupProps } from '@mui/material';
import type { ReactNode } from 'react';
import type { FormStore } from '../../hook';

type FormValues = Record<string, unknown>;

export type FormRadioOption<TValue extends string = string> = {
  key?: string;
  value: TValue;
  label: ReactNode;
  disabled?: boolean;
};

export type FormRadioGroupProps<TValues extends FormValues> = Omit<
  RadioGroupProps,
  'name' | 'value' | 'onChange'
> & {
  store: FormStore<TValues>;
  name: keyof TValues & string;
  label: ReactNode;
  options: readonly FormRadioOption[];
  helperText?: ReactNode;
  required?: boolean;
  formControlProps?: Omit<FormControlProps, 'error' | 'required' | 'disabled'>;
  formLabelProps?: FormLabelProps;
  onValueChange?: (value: TValues[keyof TValues] & string) => void;
};

export const FormRadioGroup = <TValues extends FormValues>({
  store,
  name,
  label,
  options,
  helperText,
  required,
  formControlProps,
  formLabelProps,
  onValueChange,
  row = true,
  ...radioGroupProps
}: FormRadioGroupProps<TValues>) => {
  const errorMessage = store.errors[name];
  const isRequired = Boolean(
    store.hook.getRuleValue(store.rules[name]?.required) || required,
  );
  const value = String(store.values[name] ?? '');

  return (
    <FormControl
      {...formControlProps}
      error={Boolean(errorMessage)}
      required={isRequired}
    >
      <FormLabel {...formLabelProps}>{label}</FormLabel>
      <RadioGroup
        {...radioGroupProps}
        row={row}
        name={String(name)}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value as TValues[typeof name] & string;
          store.hook.setValue(name, nextValue);
          store.hook.setError(name, null);
          onValueChange?.(nextValue);
        }}
        onFocus={() => store.hook.setFieldFocus(name)}
        onBlur={() => store.hook.setFieldBlur(name)}
      >
        {options.map((option, index) => (
          <FormControlLabel
            key={option.key ?? `${String(option.value)}-${String(index)}`}
            value={option.value}
            disabled={option.disabled}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {(errorMessage ?? helperText) && (
        <FormHelperText>{errorMessage ?? helperText}</FormHelperText>
      )}
    </FormControl>
  );
};
