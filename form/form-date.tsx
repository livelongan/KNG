import { DATE_FORMAT } from '../../constant';
import type { FormDateName } from './form-base';
import { FormPeriod, type FormPeriodDateProps } from './form-period';

export type FormDateProps<
  TValues extends KeyValue,
  TField extends FormDateName<TValues> = FormDateName<TValues>,
> = Omit<FormPeriodDateProps<TValues, TField>, 'format' | 'ampm'> & {
  format?: string;
};

export const FormDate = <
  TValues extends KeyValue,
  TField extends FormDateName<TValues> = FormDateName<TValues>,
>({
  format = DATE_FORMAT,
  store,
  name,
  ...props
}: FormDateProps<TValues, TField>) => (
  <FormPeriod<TValues, TField> {...props} store={store} name={name} format={format} />
);
