import { Stack } from '@mui/material';
import { observer } from 'mobx-react-lite';
import type { ReactNode } from 'react';
import type { FormStore } from '../../hook';

type FormElementValues = Record<string, unknown>;
type FormElementEvent = { preventDefault: () => void; currentTarget: HTMLFormElement };

type FormElementSubmitContext = {
  focusField: (fieldName: string) => void;
};

export type FormElementProps<TValues extends FormElementValues> = {
  id?: string;
  spacing?: number;
  store: FormStore<TValues>;
  onSubmit: (
    formData: FormData,
    context: FormElementSubmitContext,
  ) => void | Promise<void>;
  children: ReactNode;
};

const waitForNextTick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

const FormElementBase = <TValues extends FormElementValues>({
  id,
  spacing = 2,
  store,
  onSubmit,
  children,
}: FormElementProps<TValues>) => {
  const handleSubmit = async (event: FormElementEvent) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const isValid = await store.hook.trigger();
    store.hook.setFormStatus((previousStatus) => ({
      ...previousStatus,
      submitted: true,
      submitSuccess: false,
      submitCount: previousStatus.submitCount + 1,
    }));

    if (!isValid) {
      await waitForNextTick();
      const firstInvalid = formElement.querySelector<HTMLElement>(
        '[aria-invalid="true"], .Mui-error input',
      );
      firstInvalid?.focus({ preventScroll: true });
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const formData = new window.FormData(formElement);
    try {
      await onSubmit(formData, {
        focusField: (fieldName) =>
          formElement.querySelector<HTMLElement>(`[name="${fieldName}"]`)?.focus(),
      });
      store.hook.setFormStatus((previousStatus) => ({
        ...previousStatus,
        submitting: false,
        submitSuccess: true,
      }));
    } catch {
      store.hook.setFormStatus((previousStatus) => ({
        ...previousStatus,
        submitting: false,
        submitSuccess: false,
      }));
      throw new Error('Form submission failed.');
    }
  };

  return (
    <Stack id={id} component="form" spacing={spacing} onSubmit={handleSubmit} noValidate>
      {children}
    </Stack>
  );
};

export const FormElement = observer(FormElementBase) as typeof FormElementBase;
