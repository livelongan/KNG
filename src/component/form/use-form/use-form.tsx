import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { FormErrors, FormHookOptions, FormStore } from "./types";
import { useFormError } from "./use-form-error";
import { useFormField } from "./use-form-field";
import { useFormRule, normalizeRuleValue } from "./use-form-rule";
import { useFormState } from "./use-form-state";
import { useFormValue } from "./use-form-value";

export type {
  FieldState,
  FormErrors,
  FormFieldState,
  FormHookOptions,
  FormRule,
  FormRulePatch,
  FormRules,
  FormSelectFilter,
  FormSelectOption,
  FormState,
  FormStore,
  KeyValue,
  RuleProps,
  RuleType,
  ValidateResult,
} from "./types";

const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === "string") {
    return value.trim().length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === "boolean") {
    return value === false;
  }
  if (typeof value === "number") {
    return Number.isNaN(value);
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime());
  }
  return false;
};

const getValueLength = (value: unknown): number | null => {
  if (typeof value === "string" || Array.isArray(value)) {
    return value.length;
  }
  return null;
};

const getNumericValue = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    if (value.trim().length === 0) {
      return null;
    }
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }
  return null;
};

export const useForm = <TValues extends KeyValue>(
  options: FormHookOptions<TValues>,
): FormStore<TValues> => {
  const { defaultValues, rules: optionRules } = options;
  const formState = useFormState();
  const setFormState = formState.set;
  const formValue = useFormValue<TValues>(defaultValues, formState);
  const formRule = useFormRule<TValues>(optionRules);
  const formField = useFormField<TValues>(formState);
  const formError = useFormError<TValues>(formState, formField);

  const values = formValue.data;

  const validateField = useCallback(
    async (name: keyof TValues): Promise<string | undefined> => {
      const value = values[name];
      const rule = formRule.data[name];
      if (!rule) {
        return undefined;
      }
      const requiredRule = normalizeRuleValue(rule.required);
      if (requiredRule?.value && isEmptyValue(value)) {
        return requiredRule.message || "This field is required.";
      }
      const patternRule = normalizeRuleValue(rule.pattern);
      if (patternRule && !isEmptyValue(value)) {
        const sourceValue = String(value);
        const testPattern = new RegExp(
          String(patternRule.value.source),
          patternRule.value.flags,
        );
        if (!testPattern.test(sourceValue)) {
          return patternRule.message || "Invalid format.";
        }
      }
      const maxLengthRule = normalizeRuleValue(rule.maxLength);
      if (maxLengthRule) {
        const sourceLength = getValueLength(value);
        if (
          sourceLength !== null &&
          sourceLength > Number(maxLengthRule.value)
        ) {
          return (
            maxLengthRule.message ||
            `Maximum length is ${String(maxLengthRule.value)}.`
          );
        }
      }
      const minLengthRule = normalizeRuleValue(rule.minLength);
      if (minLengthRule) {
        const sourceLength = getValueLength(value);
        if (
          sourceLength !== null &&
          sourceLength < Number(minLengthRule.value)
        ) {
          return (
            minLengthRule.message ||
            `Minimum length is ${String(minLengthRule.value)}.`
          );
        }
      }
      const maxRule = normalizeRuleValue(rule.max);
      if (maxRule) {
        const sourceNumber = getNumericValue(value);
        if (sourceNumber !== null && sourceNumber > Number(maxRule.value)) {
          return (
            maxRule.message || `Maximum value is ${String(maxRule.value)}.`
          );
        }
      }
      const minRule = normalizeRuleValue(rule.min);
      if (minRule) {
        const sourceNumber = getNumericValue(value);
        if (sourceNumber !== null && sourceNumber < Number(minRule.value)) {
          return (
            minRule.message || `Minimum value is ${String(minRule.value)}.`
          );
        }
      }
      if (rule.validate) {
        const validationResult = await rule.validate(value, values);
        if (typeof validationResult === "string") {
          return validationResult;
        }
        if (!validationResult) {
          return "Validation failed.";
        }
      }
      return undefined;
    },
    [formRule.data, values],
  );

  const trigger: FormStore<TValues>["trigger"] = useCallback(
    async (name?: keyof TValues): Promise<boolean> => {
      if (name !== undefined) {
        const fieldError = await validateField(name);
        const nextErrors = { ...formError.data };
        if (fieldError !== undefined) {
          nextErrors[name] = fieldError;
        } else {
          delete nextErrors[name];
        }
        const hasErrors = Object.keys(nextErrors).length > 0;
        formError.replace(nextErrors);
        formField.syncError(name, fieldError);
        setFormState((previousState) => ({
          ...previousState,
          validating: false,
          validated: true,
          valid: !hasErrors,
          invalid: hasErrors,
          submitable: !hasErrors,
        }));
        return fieldError === undefined;
      }

      const allFieldNames = Object.keys(formRule.data) as Array<keyof TValues>;
      const nextErrors: FormErrors<TValues> = {};
      await Promise.all(
        allFieldNames.map(async (fieldName) => {
          const fieldError = await validateField(fieldName);
          if (fieldError !== undefined) {
            nextErrors[fieldName] = fieldError;
          }
        }),
      );
      formError.replace(nextErrors);
      formField.syncErrors(allFieldNames, nextErrors);
      const hasErrors = Object.keys(nextErrors).length > 0;
      setFormState((previousState) => ({
        ...previousState,
        validating: false,
        validated: true,
        valid: !hasErrors,
        invalid: hasErrors,
        submitable: !hasErrors,
      }));
      return Object.keys(nextErrors).length === 0;
    },
    [formError, formField, formRule.data, setFormState, validateField],
  );

  const submitableEvaluationIdRef = useRef(0);
  const triggerChangedFieldRef = useRef(
    (name: keyof TValues) => void trigger(name),
  );
  const submittedRef = useRef(Boolean(formState.data.submitted));

  useEffect(() => {
    const evaluationId = submitableEvaluationIdRef.current + 1;
    submitableEvaluationIdRef.current = evaluationId;

    const validationFieldNames = Object.keys(formRule.data) as Array<
      keyof TValues
    >;

    if (validationFieldNames.length === 0) {
      setFormState((previousState) =>
        previousState.submitable === true
          ? previousState
          : { ...previousState, submitable: true },
      );
      return;
    }

    void Promise.all(
      validationFieldNames.map((fieldName) => validateField(fieldName)),
    )
      .then((validationErrors) => {
        if (submitableEvaluationIdRef.current !== evaluationId) {
          return;
        }

        const canSubmit = validationErrors.every(
          (validationError) => validationError === undefined,
        );

        setFormState((previousState) =>
          previousState.submitable === canSubmit
            ? previousState
            : { ...previousState, submitable: canSubmit },
        );
      })
      .catch(() => {
        if (submitableEvaluationIdRef.current !== evaluationId) {
          return;
        }

        setFormState((previousState) =>
          previousState.submitable === false
            ? previousState
            : { ...previousState, submitable: false },
        );
      });
  }, [formRule.data, setFormState, validateField]);

  useLayoutEffect(() => {
    submittedRef.current = Boolean(formState.data.submitted);
  }, [formState.data.submitted]);

  useLayoutEffect(() => {
    triggerChangedFieldRef.current = (fieldName) => {
      void trigger(fieldName);
    };
  }, [trigger]);

  const subscribeValueChange = formValue.subscribe;

  useEffect(() => {
    const unsubscribe = subscribeValueChange((_nextValues, context) => {
      if (!submittedRef.current) {
        return;
      }

      context.changedFields.forEach((fieldName) => {
        triggerChangedFieldRef.current(fieldName);
      });
    });

    return unsubscribe;
  }, [subscribeValueChange]);

  const reset: FormStore<TValues>["reset"] = useCallback(() => {
    formError.reset();
    formField.reset();
    formState.reset();
    formRule.reset();
    formValue.reset();
  }, [formError, formField, formState, formRule, formValue]);

  return {
    values,
    rules: formRule.data,
    errors: formError.data,
    formRule,
    formError,
    formField,
    formState,
    formValue,
    trigger,
    reset,
  };
};
