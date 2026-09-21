import type { FormDateName } from './form-base';
import { FormPeriod, type FormPeriodDateProps } from './form-period';

type FormValues = Record<string, unknown>;

export type FormDateTimeProps<
  TValues extends FormValues,
  TField extends FormDateName<TValues> = FormDateName<TValues>,
> = Omit<FormPeriodDateProps<TValues, TField>, 'format'> & {
  format?: string;
  amp?: boolean;
};

export const FormDateTime = <
  TValues extends FormValues,
  TField extends FormDateName<TValues> = FormDateName<TValues>,
>({
  format = 'YYYY-MM-DD HH:mm',
  amp = false,
  store,
  name,
  ...props
}: FormDateTimeProps<TValues, TField>) => (
  <FormPeriod<TValues, TField>
    {...props}
    store={store}
    name={name}
    format={format}
    amp={amp}
  />
);
