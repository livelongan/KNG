import { useCallback, useRef, useState } from "react";
import type {
  FormErrors,
  FormFieldStore,
  FormHookHandle,
  FormStateStore,
} from "./types";

export const useFormError = <TValues extends KeyValue>(
  formState: FormStateStore,
  formField: Pick<FormFieldStore<TValues>, "syncError">,
) => {
  const setFormState = formState.set;
  const syncFieldErrorToState = formField.syncError;
  const [errors, setErrorsState] = useState<FormErrors<TValues>>({});
  const errorsRef = useRef<FormErrors<TValues>>({});

  const replaceErrors = useCallback((nextErrors: FormErrors<TValues>) => {
    errorsRef.current = nextErrors;
    setErrorsState(nextErrors);
  }, []);

  const resetErrors: FormHookHandle<TValues>["resetErrors"] =
    useCallback(() => {
      const nextErrors = {} as FormErrors<TValues>;

      errorsRef.current = nextErrors;
      setErrorsState(nextErrors);
      setFormState((previousState) => ({
        ...previousState,
        valid: true,
        invalid: false,
        submitable: true,
      }));
    }, [setFormState]);

  const setError: FormHookHandle<TValues>["setError"] = useCallback(
    (name, error) => {
      const nextError = error === null ? undefined : error;
      const previousErrors = errorsRef.current;
      const previousError = previousErrors[name];

      if (previousError === nextError) {
        return;
      }

      const nextErrors = { ...previousErrors };
      if (nextError === undefined) {
        delete nextErrors[name];
      } else {
        nextErrors[name] = nextError;
      }

      const hasErrors = Object.keys(nextErrors).length > 0;
      errorsRef.current = nextErrors;
      setErrorsState(nextErrors);
      setFormState((previousState) => ({
        ...previousState,
        valid: !hasErrors,
        invalid: hasErrors,
        submitable: !hasErrors,
      }));
      syncFieldErrorToState(name, nextError ?? null);
    },
    [setFormState, syncFieldErrorToState],
  );

  const getError: FormHookHandle<TValues>["getError"] = useCallback(
    (name) => errorsRef.current[name],
    [],
  );

  return {
    data: errors,
    replace: replaceErrors,
    set: setError,
    reset: resetErrors,
    get: getError,
  };
};
