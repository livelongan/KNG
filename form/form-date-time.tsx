import { DATE_TIME_FORMAT } from '../../constant';
import type { FormDateName } from './form-base';
import { FormPeriod, type FormPeriodDateProps } from './form-period';

export type FormDateTimeProps<
  TValues extends KeyValue,
  TField extends FormDateName<TValues> = FormDateName<TValues>,
> = Omit<FormPeriodDateProps<TValues, TField>, 'format'> & {
  format?: string;
  ampm?: boolean;
};
export const FormDateTime = <
  TValues extends KeyValue,
  TField extends FormDateName<TValues> = FormDateName<TValues>,
>({
  format = DATE_TIME_FORMAT,
  ampm = false,
  store,
  name,
  ...props
}: FormDateTimeProps<TValues, TField>) => {
  return (
    <FormPeriod<TValues, TField>
      {...props}
      store={store}
      name={name}
      format={format}
      ampm={ampm}
    />
  );
};
