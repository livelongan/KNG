import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  FormErrors,
  FormFieldStatus,
  FormHookHandle,
  FormRule,
  FormRulePatch,
  FormRules,
  FormStatus,
  FormStore,
  FormValueSubscriber,
  KeyValue,
  RuleProps,
} from './types';

const normalizeRuleValue = <TValue,>(
  input: RuleProps<TValue> | undefined,
): RuleProps<TValue> | null => {
  if (input === undefined) {
    return null;
  }

  if (typeof input === 'object' && input !== null && 'value' in input) {
    return input;
  }

  return { value: input, message: '' };
};

const extractRuleValue = <TValue,>(
  input: RuleProps<TValue> | undefined,
): TValue | undefined => {
  const normalizedRule = normalizeRuleValue(input);
  return normalizedRule === null
    ? undefined
    : typeof normalizedRule === 'object' && 'value' in normalizedRule
      ? normalizedRule.value
      : normalizedRule;
};

const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'boolean') return value === false;
  if (typeof value === 'number') return Number.isNaN(value);
  if (value instanceof Date) return Number.isNaN(value.getTime());
  return false;
};

const getValueLength = (value: unknown): number | null => {
  if (typeof value === 'string' || Array.isArray(value)) return value.length;
  return null;
};

const getNumericValue = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim().length > 0) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }
  return null;
};

const initialFormStatus: FormStatus = {
  validated: false,
  validating: false,
  submitting: false,
  submitted: false,
  submitSuccess: false,
  dirty: false,
  touched: false,
  valid: true,
  invalid: false,
  submitCount: 0,
};

export const useForm = <TValues extends KeyValue>({
  defaultValues,
  rules,
}: {
  defaultValues: TValues;
  rules?: FormRules<TValues>;
}): FormStore<TValues> => {
  const initialValuesRef = useRef<TValues>({ ...defaultValues });
  const initialRulesRef = useRef<FormRules<TValues>>({
    ...(rules ?? {}),
  } as FormRules<TValues>);
  const [values, setValues] = useState<TValues>({ ...defaultValues });
  const [formStatus, setFormStatusState] = useState<FormStatus>({ ...initialFormStatus });
  const [fieldStatus, setFieldStatusState] = useState<FormFieldStatus<TValues>>({});
  const [ruleState, setRuleState] = useState<FormRules<TValues>>({
    ...(rules ?? {}),
  } as FormRules<TValues>);
  const [errors, setErrors] = useState<FormErrors<TValues>>({});
  const subscribersRef = useRef(new Set<FormValueSubscriber<TValues>>());
  const previousValuesRef = useRef<TValues>(values);
  const isFirstValuesEffectRef = useRef(true);

  const setValue: FormHookHandle<TValues>['setValue'] = useCallback((name, value) => {
    setValues((previousValue) => ({ ...previousValue, [name]: value }));
    setFormStatusState((previousStatus) => ({ ...previousStatus, dirty: true }));
  }, []);

  const setFieldStatus: FormHookHandle<TValues>['setFieldStatus'] = useCallback(
    (name, status) => {
      setFieldStatusState((previousValue) => ({ ...previousValue, [name]: status }));
      setFormStatusState((previousStatus) => ({
        ...previousStatus,
        touched: previousStatus.touched || Boolean(status.touched),
        dirty: previousStatus.dirty || Boolean(status.dirty),
      }));
    },
    [],
  );

  const setFormStatus: FormHookHandle<TValues>['setFormStatus'] = useCallback(
    (inputStatus) => {
      setFormStatusState((previousStatus) =>
        typeof inputStatus === 'function'
          ? inputStatus(previousStatus)
          : { ...previousStatus, ...inputStatus },
      );
    },
    [],
  );

  const subscribe = useCallback((subscriber: FormValueSubscriber<TValues>) => {
    subscribersRef.current.add(subscriber);
    return () => subscribersRef.current.delete(subscriber);
  }, []);

  useEffect(() => {
    if (isFirstValuesEffectRef.current) {
      isFirstValuesEffectRef.current = false;
      previousValuesRef.current = values;
      return;
    }

    const previousValues = previousValuesRef.current;
    const changedFields = Array.from(
      new Set([...Object.keys(previousValues), ...Object.keys(values)]),
    ).filter((fieldName) => previousValues[fieldName] !== values[fieldName]) as Array<
      keyof TValues
    >;

    if (changedFields.length > 0) {
      subscribersRef.current.forEach((subscriber) =>
        subscriber(values, { previousValues, changedFields }),
      );
    }
    previousValuesRef.current = values;
  }, [values]);

  const setError: FormHookHandle<TValues>['setError'] = useCallback((name, error) => {
    setErrors((previousErrors) => {
      const nextErrors = { ...previousErrors };
      if (error === null || error === undefined) delete nextErrors[name];
      else nextErrors[name] = error;
      return nextErrors;
    });
    setFieldStatusState((previousStatus) => ({
      ...previousStatus,
      [name]: { ...(previousStatus[name] ?? {}), error: error ?? null },
    }));
  }, []);

  const setRule: FormHookHandle<TValues>['setRule'] = useCallback(
    (
      nameOrPatch: keyof TValues | FormRulePatch<TValues>,
      rule?: FormRule<TValues[keyof TValues], TValues> | null,
    ) => {
      setRuleState((previousRules) => {
        const nextRules = { ...previousRules } as FormRules<TValues>;
        if (typeof nameOrPatch === 'object' || nameOrPatch === null) {
          Object.entries(nameOrPatch ?? {}).forEach(([fieldName, fieldRule]) => {
            if (fieldRule === null) delete nextRules[fieldName as keyof TValues];
            else
              nextRules[fieldName as keyof TValues] = fieldRule as FormRule<
                TValues[keyof TValues],
                TValues
              >;
          });
        } else if (rule === null) {
          delete nextRules[nameOrPatch];
        } else {
          nextRules[nameOrPatch] = rule as FormRule<TValues[keyof TValues], TValues>;
        }
        return nextRules;
      });
    },
    [],
  ) as FormHookHandle<TValues>['setRule'];

  const validateField = useCallback(
    async (name: keyof TValues): Promise<string | undefined> => {
      const value = values[name];
      const rule = ruleState[name] as FormRule<unknown, TValues> | undefined;
      if (!rule) return undefined;

      const requiredRule = normalizeRuleValue(rule.required);
      if (extractRuleValue(rule.required) && isEmptyValue(value)) {
        return requiredRule &&
          typeof requiredRule === 'object' &&
          'message' in requiredRule
          ? requiredRule.message || 'This field is required.'
          : 'This field is required.';
      }

      const patternRule = normalizeRuleValue(rule.pattern);
      const pattern = extractRuleValue(rule.pattern);
      if (pattern && !isEmptyValue(value) && !pattern.test(String(value))) {
        return patternRule && typeof patternRule === 'object' && 'message' in patternRule
          ? patternRule.message || 'Invalid format.'
          : 'Invalid format.';
      }

      const valueLength = getValueLength(value);
      const maxLength = extractRuleValue(rule.maxLength);
      if (maxLength !== undefined && valueLength !== null && valueLength > maxLength) {
        return typeof rule.maxLength === 'object'
          ? rule.maxLength.message
          : `Maximum length is ${String(maxLength)}.`;
      }

      const minLength = extractRuleValue(rule.minLength);
      if (minLength !== undefined && valueLength !== null && valueLength < minLength) {
        return typeof rule.minLength === 'object'
          ? rule.minLength.message
          : `Minimum length is ${String(minLength)}.`;
      }

      const numericValue = getNumericValue(value);
      const max = extractRuleValue(rule.max);
      if (max !== undefined && numericValue !== null && numericValue > max) {
        return typeof rule.max === 'object'
          ? rule.max.message
          : `Maximum value is ${String(max)}.`;
      }

      const min = extractRuleValue(rule.min);
      if (min !== undefined && numericValue !== null && numericValue < min) {
        return typeof rule.min === 'object'
          ? rule.min.message
          : `Minimum value is ${String(min)}.`;
      }

      if (rule.validate) {
        const result = await rule.validate(value, values);
        if (typeof result === 'string') return result;
        if (!result) return 'Validation failed.';
      }

      return undefined;
    },
    [ruleState, values],
  );

  const trigger: FormHookHandle<TValues>['trigger'] = useCallback(
    async (name) => {
      const fieldNames =
        name === undefined
          ? (Array.from(
              new Set([...Object.keys(values), ...Object.keys(ruleState)]),
            ) as Array<keyof TValues>)
          : [name];
      setFormStatusState((previousStatus) => ({ ...previousStatus, validating: true }));
      const nextErrors: FormErrors<TValues> = {};
      await Promise.all(
        fieldNames.map(async (fieldName) => {
          const error = await validateField(fieldName);
          if (error) nextErrors[fieldName] = error;
        }),
      );
      setErrors(nextErrors);
      setFormStatusState((previousStatus) => ({
        ...previousStatus,
        validating: false,
        validated: true,
        valid: Object.keys(nextErrors).length === 0,
        invalid: Object.keys(nextErrors).length > 0,
      }));
      return Object.keys(nextErrors).length === 0;
    },
    [ruleState, validateField, values],
  );

  const resetValues = useCallback(() => setValues({ ...initialValuesRef.current }), []);
  const resetFieldStatus = useCallback(() => setFieldStatusState({}), []);
  const resetFormStatus = useCallback(
    () => setFormStatusState({ ...initialFormStatus }),
    [],
  );
  const resetErrors = useCallback(() => setErrors({}), []);
  const resetRules = useCallback(() => setRuleState({ ...initialRulesRef.current }), []);

  const hook: FormHookHandle<TValues> = {
    setValue,
    setRule,
    setError,
    setFieldStatus,
    setFormStatus,
    setFieldFocus: (name) => setFieldStatus(name, { visited: true, focus: true }),
    setFieldBlur: (name) =>
      setFieldStatus(name, { touched: true, focus: false, blurred: true }),
    subscribe,
    trigger,
    resetValues,
    resetFieldStatus,
    resetFormStatus,
    resetErrors,
    resetRules,
    getValue: (name) => values[name],
    getRuleValue: extractRuleValue,
    getRule: (name) => ruleState[name],
    getError: (name) => errors[name],
    getFieldStatus: (name) => fieldStatus[name],
  };

  return { values, rules: ruleState, errors, fieldStatus, formStatus, hook };
};
