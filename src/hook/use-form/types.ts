export type KeyValue = Record<string, unknown>;

export type RuleType<TValue> = {
  value: TValue;
  message: string;
};

export type RuleProps<TValue> = TValue | RuleType<TValue>;

export type ValidateResult = boolean | string | Promise<boolean | string>;

export type FormSelectFilter<TValues extends KeyValue> = (
  option: SelectOption,
  context: { index: number; options: readonly SelectOption[]; values: TValues },
) => boolean;

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type FormRule<TValue, TValues extends KeyValue> = {
  required?: RuleProps<boolean>;
  pattern?: RuleProps<RegExp>;
  maxLength?: RuleProps<number>;
  minLength?: RuleProps<number>;
  max?: RuleProps<number>;
  min?: RuleProps<number>;
  validate?: (value: TValue, values: TValues) => ValidateResult;
  step?: number;
  autoComplete?: string;
  inputMode?: string;
  rows?: number;
  valueKey?: string;
  labelKey?: string;
  filter?: FormSelectFilter<TValues>;
  keywordFilter?: boolean;
  keywordFilterPlaceholder?: string;
};

export type FormRules<TValues extends KeyValue> = Partial<{
  [TField in keyof TValues]: FormRule<TValues[TField], TValues>;
}>;

export type FormErrors<TValues extends KeyValue> = Partial<Record<keyof TValues, string>>;

export type FieldStatus = {
  visited?: boolean;
  touched?: boolean;
  error?: string | null;
  focus?: boolean;
  dirty?: boolean;
  validating?: boolean;
  blurred?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
};

export type FormFieldStatus<TValues extends KeyValue> = Partial<
  Record<keyof TValues, FieldStatus>
>;

export type FormStatus = {
  validated: boolean;
  validating: boolean;
  submitting: boolean;
  submitted: boolean;
  submitSuccess: boolean;
  dirty: boolean;
  touched: boolean;
  valid: boolean;
  invalid: boolean;
  submitCount: number;
};

export type FormHookOptions<TValues extends KeyValue> = {
  defaultValues: TValues;
  rules?: FormRules<TValues>;
};

export type FormRulePatch<TValues extends KeyValue> = Partial<{
  [TField in keyof TValues]: FormRule<TValues[TField], TValues> | null;
}> | null;

export type FormValueSubscriber<TValues extends KeyValue> = (
  values: TValues,
  context: { previousValues: TValues; changedFields: Array<keyof TValues> },
) => void;

export type SetRule<TValues extends KeyValue> = {
  <TField extends keyof TValues>(
    name: TField,
    rule: FormRule<TValues[TField], TValues> | null,
  ): void;
  (patch: FormRulePatch<TValues>): void;
};

export type FormHookHandle<TValues extends KeyValue> = {
  setValue: <TField extends keyof TValues>(name: TField, value: TValues[TField]) => void;
  setRule: SetRule<TValues>;
  setError: <TField extends keyof TValues>(name: TField, error: string | null) => void;
  setFieldStatus: <TField extends keyof TValues>(
    name: TField,
    status: FieldStatus,
  ) => void;
  setFormStatus: (
    status: FormStatus | Partial<FormStatus> | ((status: FormStatus) => FormStatus),
  ) => void;
  setFieldFocus: <TField extends keyof TValues>(name: TField) => void;
  setFieldBlur: <TField extends keyof TValues>(name: TField) => void;
  subscribe: (subscriber: FormValueSubscriber<TValues>) => void;
  trigger: <TField extends keyof TValues>(name?: TField) => Promise<boolean>;
  resetValues: () => void;
  resetFieldStatus: () => void;
  resetFormStatus: () => void;
  resetErrors: () => void;
  resetRules: () => void;
  getValue: <TField extends keyof TValues>(name: TField) => TValues[TField];
  getRuleValue: <TValue>(rule: RuleProps<TValue> | undefined) => TValue | undefined;
  getRule: <TField extends keyof TValues>(
    name: TField,
  ) => FormRule<TValues[TField], TValues> | undefined;
  getError: <TField extends keyof TValues>(name: TField) => string | undefined;
  getFieldStatus: <TField extends keyof TValues>(name: TField) => FieldStatus | undefined;
};

export type FormStore<TValues extends KeyValue> = {
  values: TValues;
  rules: FormRules<TValues>;
  errors: FormErrors<TValues>;
  fieldStatus: FormFieldStatus<TValues>;
  formStatus: FormStatus;
  hook: FormHookHandle<TValues>;
};
