import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import type { FormStore } from '../../hook';
import { FormBase, type FormTextName } from './form-base';

type FormValues = Record<string, unknown>;

export type FormTextProps<
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
> = TextFieldProps & {
  store: FormStore<TValues>;
  name: TField;
  clearable?: boolean;
  onClear?: () => void;
};

export const FormText = <
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
>({
  store,
  name,
  clearable = true,
  onClear,
  ...textFieldProps
}: FormTextProps<TValues, TField>) => (
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
        type="text"
        name={field.name}
        value={field.value}
        error={Boolean(field.errorMessage) || Boolean(textFieldProps.error)}
        helperText={field.errorMessage ?? textFieldProps.helperText}
        required={field.required || textFieldProps.required}
        onChange={(event) => field.onFieldChange(event.target.value)}
        onFocus={field.onFieldFocus}
        onBlur={field.onFieldBlur}
        slotProps={field.slotProps}
      />
    )}
  </FormBase>
);
