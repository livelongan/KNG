import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import type { FormStore } from '../../hook';
import { FormBase, type FormTextName } from './form-base';

type FormValues = Record<string, unknown>;

export type FormAreaProps<
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
> = Omit<TextFieldProps, 'type' | 'multiline' | 'name' | 'value' | 'onChange'> & {
  store: FormStore<TValues>;
  name: TField;
  clearable?: boolean;
  onClear?: () => void;
};

export const FormArea = <
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
>({
  store,
  name,
  clearable = true,
  onClear,
  slotProps,
  ...props
}: FormAreaProps<TValues, TField>) => (
  <FormBase<TValues, TField>
    store={store}
    name={name}
    clearable={clearable}
    onClear={onClear}
    slotProps={slotProps}
  >
    {(field) => (
      <TextField
        {...props}
        fullWidth
        multiline
        name={field.name}
        value={field.value}
        error={Boolean(field.errorMessage)}
        helperText={field.errorMessage ?? props.helperText}
        required={field.required}
        onChange={(event) => field.onFieldChange(event.target.value)}
        onFocus={field.onFieldFocus}
        onBlur={field.onFieldBlur}
        slotProps={field.slotProps}
      />
    )}
  </FormBase>
);
