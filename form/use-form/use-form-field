import { useCallback, useRef, useState } from "react";
import type {
  FieldState,
  FormErrors,
  FormFieldState,
  FormHookHandle,
  FormStateStore,
  PartialFieldState,
} from "./types";

export const useFormField = <TValues extends KeyValue>(
  formState: FormStateStore,
) => {
  const setFormState = formState.set;
  const [fieldState, setFieldStateStore] = useState<FormFieldState<TValues>>(
    () => ({}) as FormFieldState<TValues>,
  );
  const fieldStateRef = useRef<FormFieldState<TValues>>(fieldState);

  const setFieldState: FormHookHandle<TValues>["setFieldState"] = useCallback(
    (name, nextFieldState) => {
      setFieldStateStore((previousValue) => {
        const nextValue = { ...previousValue };

        if (nextFieldState === undefined) {
          delete nextValue[name];
          fieldStateRef.current = nextValue;
          return nextValue;
        }

        nextValue[name] = nextFieldState;

        if (nextFieldState.touched || nextFieldState.dirty) {
          setFormState((previousState) => ({
            ...previousState,
            touched: previousState.touched || Boolean(nextFieldState.touched),
            dirty: previousState.dirty || Boolean(nextFieldState.dirty),
          }));
        }

        fieldStateRef.current = nextValue;
        return nextValue;
      });
    },
    [setFormState],
  );

  const syncFieldError = useCallback(
    (name: keyof TValues, error?: string | null) => {
      setFieldStateStore((previousValue) => {
        const currentFieldState = previousValue[name];
        const normalizedError = error === undefined ? null : error;

        if (currentFieldState === undefined && normalizedError === null) {
          fieldStateRef.current = previousValue;
          return previousValue;
        }

        const nextValue = {
          ...previousValue,
          [name]: {
            ...(currentFieldState ?? ({} as FieldState)),
            error: normalizedError,
          } as FieldState,
        };

        fieldStateRef.current = nextValue;
        return nextValue;
      });
    },
    [],
  );

  const syncFieldErrors = useCallback(
    (fieldNames: Array<keyof TValues>, nextErrors: FormErrors<TValues>) => {
      setFieldStateStore((previousValue) => {
        const nextValue = { ...previousValue };
        let changed = false;

        fieldNames.forEach((fieldName) => {
          const currentFieldState = nextValue[fieldName];
          const nextError = nextErrors[fieldName] ?? null;

          if (currentFieldState === undefined && nextError === null) {
            return;
          }

          nextValue[fieldName] = {
            ...(currentFieldState ?? ({} as FieldState)),
            error: nextError,
          } as FieldState;
          changed = true;
        });

        const result = changed ? nextValue : previousValue;

        fieldStateRef.current = result;
        return result;
      });
    },
    [],
  );

  const mergeFieldState = useCallback(
    (name: keyof TValues, patch: PartialFieldState) => {
      setFieldStateStore((previousValue) => {
        const nextValue = {
          ...previousValue,
          [name]: {
            ...(previousValue[name] ?? ({} as FieldState)),
            ...patch,
          } as FieldState,
        };

        fieldStateRef.current = nextValue;
        return nextValue;
      });

      if (patch.touched || patch.dirty) {
        setFormState((previousState) => ({
          ...previousState,
          touched: previousState.touched || Boolean(patch.touched),
          dirty: previousState.dirty || Boolean(patch.dirty),
        }));
      }
    },
    [setFormState],
  );

  const setFieldFocus: FormHookHandle<TValues>["setFieldFocus"] = useCallback(
    (name) => {
      mergeFieldState(name, { visited: true, focus: true });
    },
    [mergeFieldState],
  );

  const setFieldBlur: FormHookHandle<TValues>["setFieldBlur"] = useCallback(
    (name) => {
      mergeFieldState(name, { touched: true, focus: false, blurred: true });
    },
    [mergeFieldState],
  );

  const resetFieldState: FormHookHandle<TValues>["resetFieldState"] =
    useCallback(() => {
      const nextFieldState = {} as FormFieldState<TValues>;
      fieldStateRef.current = nextFieldState;
      setFieldStateStore(nextFieldState);
      setFormState((previousState) => ({
        ...previousState,
        touched: false,
        dirty: false,
      }));
    }, [setFormState]);

  const getFieldState: FormHookHandle<TValues>["getFieldState"] = useCallback(
    (name) => fieldStateRef.current[name],
    [],
  );

  return {
    data: fieldState,
    set: setFieldState,
    focus: setFieldFocus,
    blur: setFieldBlur,
    reset: resetFieldState,
    get: getFieldState,
    syncError: syncFieldError,
    syncErrors: syncFieldErrors,
  };
};
