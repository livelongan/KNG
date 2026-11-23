import { TextField, type TextFieldProps } from "@mui/material";
import { memo } from "react";
import { FormBase, type FormTextName } from "./form-base";
import { areFormFieldPropsEqual } from "./form-field-memo";
import type { FormInstance } from "./use-form";

type FormValues = Record<string, unknown>;

export type FormTextProps<
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
> = TextFieldProps & {
  name: TField;
  store: FormInstance<TValues>;
  clearable?: boolean;
  onClear?: () => void;
};

const FormTextBase = <
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
>({
  store,
  name,
  clearable = true,
  onClear,
  slotProps,
  onChange,
  onFocus,
  onBlur,
  helperText,
  error,
  required: requiredProp,
  disabled,
  ...textFieldProps
}: FormTextProps<TValues, TField>) => {
  return (
    <FormBase
      store={store}
      name={name}
      slotProps={slotProps}
      clearable={clearable}
      disabled={disabled}
      onClear={onClear}
    >
      {({
        name: fieldName,
        value,
        errorMessage,
        required,
        slotProps: mergedSlotProps,
        onFieldChange,
        onFieldFocus,
        onFieldBlur,
      }) => (
        <TextField
          type="text"
          {...textFieldProps}
          name={fieldName}
          value={value}
          error={Boolean(errorMessage) || Boolean(error)}
          helperText={errorMessage ?? helperText}
          required={required || Boolean(requiredProp)}
          disabled={disabled}
          onChange={(event) => {
            onFieldChange(event.target.value);
            onChange?.(event);
          }}
          onFocus={(event) => {
            onFieldFocus();
            onFocus?.(event);
          }}
          onBlur={(event) => {
            onFieldBlur();
            onBlur?.(event);
          }}
          slotProps={mergedSlotProps}
        />
      )}
    </FormBase>
  );
};

export const FormText = memo(
  FormTextBase,
  areFormFieldPropsEqual,
) as typeof FormTextBase;
