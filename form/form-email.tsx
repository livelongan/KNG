import type { FormTextName } from './form-base';
import { FormText, type FormTextProps } from './form-text';

type FormValues = Record<string, unknown>;

export type FormEmailProps<
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
> = Omit<FormTextProps<TValues, TField>, 'type'>;

export const FormEmail = <
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
>({
  store,
  name,
  ...props
}: FormEmailProps<TValues, TField>) => (
  <FormText {...props} store={store} name={name} type="email" />
);
