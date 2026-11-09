import { useCallback, useRef, useState } from "react";
import type {
  FormHookHandle,
  FormRule,
  FormRulePatch,
  FormRules,
  FormProps,
  RuleProps,
  RuleType,
} from "./types";

const isRuleWithMessage = <TValue>(
  input: RuleProps<TValue>,
): input is RuleType<TValue> =>
  typeof input === "object" && input !== null && "value" in input;

export const normalizeRuleValue = <TValue>(
  input: RuleProps<TValue> | undefined,
): RuleType<TValue> | null => {
  if (input === undefined) {
    return null;
  }

  if (isRuleWithMessage(input)) {
    return input;
  }

  return { value: input, message: "" };
};

export const extractRuleValue = <TValue>(
  input: RuleProps<TValue> | undefined,
): TValue | undefined => {
  const normalizedRule = normalizeRuleValue(input);
  return normalizedRule?.value;
};

export const useFormRule = <TValues extends KeyValue>(
  rules?: FormRules<TValues>,
) => {
  const [initialRules] = useState<FormRules<TValues>>(
    () => ({ ...(rules ?? {}) }) as FormRules<TValues>,
  );
  const [ruleState, setRuleState] = useState<FormRules<TValues>>(
    () => ({ ...initialRules }) as FormRules<TValues>,
  );
  const ruleStateRef = useRef<FormRules<TValues>>(ruleState);

  const setRule: FormHookHandle<TValues>["setRule"] = useCallback(
    (
      ...args: [
        nameOrPatch: keyof TValues | FormRulePatch<TValues>,
        rule?: FormRule<TValues[keyof TValues], TValues> | null,
      ]
    ) => {
      const [nameOrPatch, rule] = args;

      setRuleState((previousValue) => {
        if (typeof nameOrPatch === "object" && nameOrPatch !== null) {
          const nextValue = { ...previousValue };

          (Object.keys(nameOrPatch) as Array<keyof TValues>).forEach(
            (fieldName) => {
              const fieldRule = nameOrPatch[fieldName];
              if (fieldRule === undefined) {
                return;
              }
              if (fieldRule === null) {
                delete nextValue[fieldName];
                return;
              }
              nextValue[fieldName] = fieldRule as FormRule<
                TValues[typeof fieldName],
                TValues
              >;
            },
          );

          ruleStateRef.current = nextValue;
          return nextValue;
        }

        if (args.length < 2) {
          ruleStateRef.current = previousValue;
          return previousValue;
        }

        const nextValue = { ...previousValue };
        const fieldName = nameOrPatch as keyof TValues;

        if (rule === undefined || rule === null) {
          delete nextValue[fieldName];
          ruleStateRef.current = nextValue;
          return nextValue;
        }

        nextValue[fieldName] = rule as FormRule<
          TValues[typeof fieldName],
          TValues
        >;
        ruleStateRef.current = nextValue;
        return nextValue;
      });
    },
    [],
  );

  const resetRules: FormHookHandle<TValues>["resetRules"] = useCallback(() => {
    const nextRules = { ...initialRules } as FormRules<TValues>;
    ruleStateRef.current = nextRules;
    setRuleState(nextRules);
  }, [initialRules]);

  const getRuleValue: FormHookHandle<TValues>["ruleValue"] = useCallback(
    (rule) => extractRuleValue(rule),
    [],
  );

  const getRule: FormHookHandle<TValues>["getRule"] = useCallback(
    (name) =>
      ruleStateRef.current[name] as
        | FormRule<TValues[typeof name], TValues>
        | undefined,
    [],
  );

  return {
    data: ruleState,
    set: setRule,
    get: getRule,
    reset: resetRules,
    ruleValue: getRuleValue,
  };
};
