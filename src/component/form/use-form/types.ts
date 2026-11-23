export type RuleType<TValue> = { value: TValue; message: string };

export type RuleProps<TValue> = TValue | RuleType<TValue>;

export type ValidateResult = boolean | string | Promise<boolean | string>;

export type FormSelectOption = { key?: string; disabled?: boolean } & Record<
  string,
  unknown
>;

export type FormSelectFilter<
  TValues extends KeyValue,
  TOption extends FormSelectOption = FormSelectOption,
> = (
  option: TOption,
  context: { index: number; options: ReadonlyArray<TOption>; values: TValues },
) => boolean;

export type FormRule<TValue, TValues extends KeyValue = KeyValue> = {
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
  keywordFilter?: boolean;
  keywordFilterPlaceholder?: string;
  filter?: FormSelectFilter<TValues>;
};

export type FormRules<TValues extends KeyValue> = Partial<{
  [TField in keyof TValues]: FormRule<TValues[TField], TValues>;
}>;

export type FormErrors<TValues extends KeyValue> = Partial<
  Record<keyof TValues, string>
>;

export type FieldState = {
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

export type PartialFieldState = Partial<FieldState>;

export type FormFieldState<TValues extends KeyValue> = Partial<
  Record<keyof TValues, FieldState>
>;

export type FormState = {
  validated?: boolean;
  validating?: boolean;
  submitting?: boolean;
  submitAttempted?: boolean;
  submitResolved?: boolean;
  dirty?: boolean;
  touched?: boolean;
  valid?: boolean;
  invalid?: boolean;
  submittable?: boolean;
  submitCount?: number;
};

export type FormHookOptions<TValues extends KeyValue> = {
  defaultValues?: TValues;
  rules?: FormRules<TValues>;
};

export type FormRulePatch<TValues extends KeyValue> = Partial<{
  [TField in keyof TValues]:
    FormRule<TValues[TField], TValues> | null | undefined;
}>;

export type FormValueSubscriber<TValues extends KeyValue> = (
  values: TValues,
  context: {
    previousValues: TValues;
    changedFields: Array<keyof TValues>;
  },
) => void;

export type SetRule<TValues extends KeyValue> = {
  <TField extends keyof TValues>(name: TField): void;
  <TField extends keyof TValues>(
    name: TField,
    rule: FormRule<TValues[TField], TValues> | null | undefined,
  ): void;
  (patch: FormRulePatch<TValues>): void;
};

export type FormHookHandle<TValues extends KeyValue> = {
  setValue: <TField extends keyof TValues>(
    name: TField,
    value: TValues[TField],
  ) => void;
  setRule: SetRule<TValues>;
  setError: <TField extends keyof TValues>(
    name: TField,
    error: string | null,
  ) => void;
  setFieldState: <TField extends keyof TValues>(
    name: TField,
    fieldState?: FieldState,
  ) => void;
  setFormState: (
    formState: Partial<FormState> | ((previousState: FormState) => FormState),
  ) => void;
  setFieldFocus: <TField extends keyof TValues>(name: TField) => void;
  setFieldBlur: <TField extends keyof TValues>(name: TField) => void;
  subscribe: (subscriber: FormValueSubscriber<TValues>) => () => void;
  trigger: (name?: keyof TValues) => Promise<boolean>;
  resetValues: () => void;
  resetFieldState: () => void;
  resetFormState: () => void;
  resetErrors: () => void;
  resetRules: () => void;
  getValue: <TField extends keyof TValues>(name: TField) => TValues[TField];
  getRuleValue: <TValue>(
    rule: RuleProps<TValue> | undefined,
  ) => TValue | undefined;
  getRule: <TField extends keyof TValues>(
    name: TField,
  ) => FormRule<TValues[TField], TValues> | undefined;
  getError: <TField extends keyof TValues>(name: TField) => string | undefined;
  getFieldState: <TField extends keyof TValues>(
    name: TField,
  ) => FieldState | undefined;
};

export type FormStateStore = {
  data: FormState;
  set: FormHookHandle<KeyValue>["setFormState"];
  reset: () => void;
};

export type FormValueStore<TValues extends KeyValue> = {
  data: TValues;
  set: FormHookHandle<TValues>["setValue"];
  subscribe: (subscriber: FormValueSubscriber<TValues>) => () => void;
  reset: () => void;
  get: FormHookHandle<TValues>["getValue"];
};

export type FormRuleStore<TValues extends KeyValue> = {
  data: FormRules<TValues>;
  set: SetRule<TValues>;
  get: FormHookHandle<TValues>["getRule"];
  reset: () => void;
  ruleValue: FormHookHandle<TValues>["getRuleValue"];
};

export type FormErrorsStore<TValues extends KeyValue> = {
  data: FormErrors<TValues>;
  replace: (nextErrors: FormErrors<TValues>) => void;
  set: FormHookHandle<TValues>["setError"];
  reset: () => void;
  get: FormHookHandle<TValues>["getError"];
};

export type FormFieldStore<TValues extends KeyValue> = {
  data: FormFieldState<TValues>;
  set: FormHookHandle<TValues>["setFieldState"];
  focus: FormHookHandle<TValues>["setFieldFocus"];
  blur: FormHookHandle<TValues>["setFieldBlur"];
  reset: () => void;
  get: FormHookHandle<TValues>["getFieldState"];
  syncError: FormHookHandle<TValues>["setError"];
  syncErrors: (
    fieldNames: Array<keyof TValues>,
    nextErrors: FormErrors<TValues>,
  ) => void;
};

export type FormInstance<TValues extends KeyValue> = {
  values: TValues;
  rules: FormRules<TValues>;
  errors: FormErrors<TValues>;
  formRule: FormRuleStore<TValues>;
  formError: FormErrorsStore<TValues>;
  formField: FormFieldStore<TValues>;
  formState: FormStateStore;
  formValue: FormValueStore<TValues>;
  trigger: (name?: keyof TValues) => Promise<boolean>;
  reset: () => void;
};

export type FormProps<TValues extends KeyValue> = FormInstance<TValues>;
