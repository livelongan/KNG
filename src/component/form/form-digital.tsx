import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import type { FormStore } from '../../hook';
import { FormBase, type FormNumberName } from './form-base';

type FormValues = Record<string, unknown>;

export type FormDigitalProps<
  TValues extends FormValues,
  TField extends FormNumberName<TValues> = FormNumberName<TValues>,
> = Omit<TextFieldProps, 'type' | 'value' | 'onChange'> & {
  store: FormStore<TValues>;
  name: TField;
  clearable?: boolean;
  onClear?: () => void;
};

const nonDigitPattern = /[^0-9.-]/g;

export const FormDigital = <
  TValues extends FormValues,
  TField extends FormNumberName<TValues> = FormNumberName<TValues>,
>({
  store,
  name,
  clearable = true,
  onClear,
  ...textFieldProps
}: FormDigitalProps<TValues, TField>) => (
  <FormBase<TValues, TField>
    store={store}
    name={name}
    clearable={clearable}
    onClear={onClear}
    slotProps={textFieldProps.slotProps}
  >
    {(field) => (
      <TextField
        {...textFieldProps}
        fullWidth
        type="number"
        name={field.name}
        value={field.value}
        error={Boolean(field.errorMessage) || Boolean(textFieldProps.error)}
        helperText={field.errorMessage ?? textFieldProps.helperText}
        required={field.required || textFieldProps.required}
        onChange={(event) => {
          const nextValue = event.target.value.replace(nonDigitPattern, '');
          if (nextValue !== event.target.value) return;
          field.onFieldChange(nextValue);
        }}
        onFocus={field.onFieldFocus}
        onBlur={field.onFieldBlur}
        slotProps={field.slotProps}
      />
    )}
  </FormBase>
);
