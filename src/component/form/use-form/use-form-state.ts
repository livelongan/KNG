import { useCallback, useState } from "react";
import type { FormState } from "./types";

export const initialFormState: FormState = {
  // Whether at least one validation cycle has finished.
  validated: false,
  // Whether validation is running right now.
  validating: false,
  // Whether submit is currently in progress.
  submitting: false,
  // Whether submit has ever been attempted.
  submitAttempted: false,
  // Whether the latest submit handler resolved without throwing.
  submitResolved: false,
  // Whether any field value differs from its initial value.
  dirty: false,
  // Whether any field has been interacted with.
  touched: false,
  // Whether the current form state is valid.
  valid: true,
  // Whether the current form state is invalid.
  invalid: false,
  // Whether current values/rules allow submit.
  submittable: true,
  // Number of submit attempts.
  submitCount: 0,
};

// Accept either a partial state patch or a producer function.
export type FormStateUpdate =
  Partial<FormState> | ((previousState: FormState) => FormState);

export const useFormState = () => {
  const [formState, setFormStateStore] = useState<FormState>(() => ({
    ...initialFormState,
  }));

  // Merge object patches or replace state via updater function.
  const setFormState = useCallback((inputState: FormStateUpdate) => {
    setFormStateStore((previousState) => {
      if (typeof inputState === "function") {
        return inputState(previousState);
      }
      return { ...previousState, ...inputState };
    });
  }, []);

  // Restore the form state to its initial snapshot.
  const resetFormState = useCallback(() => {
    setFormStateStore({ ...initialFormState });
  }, []);

  return { data: formState, set: setFormState, reset: resetFormState };
};
