import { useCallback, useEffect, useRef, useState } from "react";
import type {
  FormHookHandle,
  FormStateStore,
  FormValueSubscriber,
} from "./types";

export const useFormValue = <TValues extends KeyValue>(
  defaultValues: TValues | undefined,
  formState: FormStateStore,
) => {
  const setFormState = formState.set;
  const [initialValues] = useState<TValues>(
    () => ({ ...(defaultValues ?? {}) }) as TValues,
  );
  const [values, setValues] = useState<TValues>(
    () => ({ ...initialValues }) as TValues,
  );
  const valuesRef = useRef<TValues>(values);
  const subscribersRef = useRef<Set<FormValueSubscriber<TValues>>>(new Set());
  const previousValuesRef = useRef<TValues>(values);
  const isFirstValuesEffectRef = useRef(true);
  const dirtyRef = useRef(false);

  const setValue: FormHookHandle<TValues>["setValue"] = useCallback(
    (name, value) => {
      setValues((previousValue) => {
        const nextValues = { ...previousValue, [name]: value } as TValues;

        valuesRef.current = nextValues;
        return nextValues;
      });

      if (!dirtyRef.current) {
        dirtyRef.current = true;
        setFormState((previousState) =>
          previousState.dirty
            ? previousState
            : { ...previousState, dirty: true },
        );
      }
    },
    [setFormState],
  );

  const subscribe: FormHookHandle<TValues>["subscribe"] = useCallback(
    (subscriber) => {
      subscribersRef.current.add(subscriber);
      return () => {
        subscribersRef.current.delete(subscriber);
      };
    },
    [],
  );

  useEffect(() => {
    if (isFirstValuesEffectRef.current) {
      isFirstValuesEffectRef.current = false;
      previousValuesRef.current = values;
      return;
    }

    const previousValues = previousValuesRef.current;
    const allFieldNames = Array.from(
      new Set([
        ...(Object.keys(previousValues) as Array<keyof TValues>),
        ...(Object.keys(values) as Array<keyof TValues>),
      ]),
    );
    const changedFields = allFieldNames.filter(
      (fieldName) => !Object.is(previousValues[fieldName], values[fieldName]),
    );

    if (changedFields.length > 0) {
      subscribersRef.current.forEach((subscriber) => {
        subscriber(values, { previousValues, changedFields });
      });
    }

    previousValuesRef.current = values;
  }, [values]);

  const resetValues: FormHookHandle<TValues>["resetValues"] =
    useCallback(() => {
      const nextValues = { ...initialValues } as TValues;

      valuesRef.current = nextValues;
      setValues(nextValues);
      dirtyRef.current = false;
      setFormState((previousState) => ({ ...previousState, dirty: false }));
    }, [initialValues, setFormState]);

  const getValue: FormHookHandle<TValues>["getValue"] = useCallback(
    (name) => valuesRef.current[name],
    [],
  );

  return {
    data: values,
    set: setValue,
    subscribe,
    reset: resetValues,
    get: getValue,
  };
};
