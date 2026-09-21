import type { FormDateName } from './form-base';
import { FormPeriod, type FormPeriodDateProps } from './form-period';

type FormValues = Record<string, unknown>;

export type FormDateProps<
  TValues extends FormValues,
  TField extends FormDateName<TValues> = FormDateName<TValues>,
> = Omit<FormPeriodDateProps<TValues, TField>, 'format' | 'ampm'> & {
  format?: string;
};

export const FormDate = <
  TValues extends FormValues,
  TField extends FormDateName<TValues> = FormDateName<TValues>,
>({
  format = 'YYYY-MM-DD',
  store,
  name,
  ...props
}: FormDateProps<TValues, TField>) => (
  <FormPeriod<TValues, TField> {...props} store={store} name={name} format={format} />
);
