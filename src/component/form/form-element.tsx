import { Stack, type StackProps } from "@mui/material";
import { observer } from "mobx-react-lite";
import { type ReactNode } from "react";
import { waiting } from "../../../tools";
import { type FormInstance } from "./use-form";
export type FormElementSubmitContext = {
  focusField: (fieldName: string) => void;
};

type FormElementEvent = {
  preventDefault: () => void;
  currentTarget: HTMLFormElement;
};

type FormElementProps<TValues extends KeyValue> = Omit<
  StackProps<"form">,
  "component"
> & {
  id?: string;
  spacing?: StackProps["spacing"];
  store: FormInstance<TValues>;
  onSubmit?: (
    formData: FormData,
    context: FormElementSubmitContext,
  ) => void | Promise<void>;
  children: ReactNode;
};

const escapeFieldNameForSelector = (fieldName: string) =>
  fieldName.replace(/"/g, '\\"');

const getFieldByName = (formElement: HTMLFormElement, fieldName: string) => {
  const escapedFieldName = escapeFieldNameForSelector(fieldName);

  return formElement.querySelector<HTMLElement>(`[name="${escapedFieldName}"]`);
};

const isFieldInvalid = (field: HTMLElement) => {
  if (field.getAttribute("aria-invalid") === "true") {
    return true;
  }

  const formControlElement = field.closest<HTMLElement>(".MuiFormControl-root");

  if (!formControlElement) {
    return false;
  }

  return (
    formControlElement.classList.contains("Mui-error") ||
    Boolean(formControlElement.querySelector(".Mui-error"))
  );
};

const getFirstInvalidFieldName = (
  formElement: HTMLFormElement,
  fieldNames: string[],
) => {
  for (const fieldName of fieldNames) {
    const field = getFieldByName(formElement, fieldName);

    if (field && isFieldInvalid(field)) {
      return fieldName;
    }
  }

  return null;
};

const getValidationFieldNames = <TValues extends KeyValue>(
  store: FormInstance<TValues>,
) => {
  return Object.keys(store.rules) as Array<keyof TValues>;
};

const getStickyTopOffset = () => {
  const stickyElements = Array.from(
    document.querySelectorAll<HTMLElement>(".MuiAppBar-positionSticky"),
  );

  return stickyElements.reduce((maxOffset, element) => {
    const rect = element.getBoundingClientRect();

    if (rect.top <= 0 && rect.bottom > 0) {
      return Math.max(maxOffset, rect.bottom);
    }

    return maxOffset;
  }, 0);
};

const getFieldVisibleEdges = (field: HTMLElement) => {
  const containerElement =
    field.closest<HTMLElement>(".MuiFormControl-root") ?? field;
  const containerRect = containerElement.getBoundingClientRect();
  const labelElement = containerElement.querySelector<HTMLElement>(
    ".MuiInputLabel-root",
  );
  const labelRect = labelElement?.getBoundingClientRect();

  return {
    top: Math.min(containerRect.top, labelRect?.top ?? containerRect.top),
    bottom: Math.max(
      containerRect.bottom,
      labelRect?.bottom ?? containerRect.bottom,
    ),
  };
};

const focusFieldElement = (field: HTMLElement) => {
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const stickyTopOffset = getStickyTopOffset();
  const safetyGap = 12;
  const minVisibleTop = stickyTopOffset + safetyGap;
  const maxVisibleBottom = viewportHeight - safetyGap;
  const edges = getFieldVisibleEdges(field);

  if (edges.top < minVisibleTop) {
    window.scrollBy({ top: edges.top - minVisibleTop, behavior: "smooth" });
  } else if (edges.bottom > maxVisibleBottom) {
    window.scrollBy({
      top: edges.bottom - maxVisibleBottom,
      behavior: "smooth",
    });
  }

  field.focus({ preventScroll: true });
};

const FormElementBase = <TValues extends KeyValue>({
  id,
  spacing = 2.5,
  store,
  onSubmit,
  children,
  ...others
}: FormElementProps<TValues>) => {
  const handleSubmit = async (event: FormElementEvent) => {
    event.preventDefault();
    if (store.formState.data.submitting) {
      return;
    }

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const validationFieldNames = getValidationFieldNames(store).map(
      (fieldName) => String(fieldName),
    );
    const context: FormElementSubmitContext = {
      focusField: (fieldName) => {
        const field = getFieldByName(formElement, fieldName);

        if (field) {
          focusFieldElement(field);
        }
      },
    };

    const isValid = await store.trigger();
    const canSubmit = isValid && Boolean(onSubmit);

    store.formState.set((previousState) => ({
      ...previousState,
      submitAttempted: true,
      submitResolved: false,
      submitCount: (previousState.submitCount ?? 0) + 1,
      submitting: canSubmit,
    }));

    if (!isValid) {
      await waiting();
      const firstInvalidFieldName = getFirstInvalidFieldName(
        formElement,
        validationFieldNames,
      );
      if (firstInvalidFieldName) {
        context.focusField(firstInvalidFieldName);
      }
      return;
    }

    if (!onSubmit) {
      return;
    }
    await waiting();
    let submitResolved = false;
    try {
      await onSubmit(formData, context);
      submitResolved = true;
    } finally {
      store.formState.set((previousState) => ({
        ...previousState,
        submitting: false,
        submitResolved,
      }));
    }
  };

  return (
    <Stack
      id={id}
      component="form"
      spacing={spacing}
      onSubmit={handleSubmit}
      noValidate
      {...others}
    >
      {children}
    </Stack>
  );
};

export const FormElement = observer(FormElementBase) as typeof FormElementBase;
