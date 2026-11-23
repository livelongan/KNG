import TaskAltIcon from "@mui/icons-material/TaskAlt";
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  type FormControlProps,
  type FormLabelProps,
  type RadioGroupProps,
} from "@mui/material";
import { memo, useMemo, type ReactNode } from "react";
import type { FormTextName } from "./form-base";
import { areFormFieldPropsEqual } from "./form-field-memo";
import type { FormInstance } from "./use-form";

type FormValues = Record<string, unknown>;

export type FormRadioOption<TValue extends string = string> = {
  key?: string;
  value: TValue;
  label: ReactNode;
  disabled?: boolean;
};

export type FormRadioGroupProps<
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
> = Omit<RadioGroupProps, "name" | "value" | "onChange"> & {
  store: FormInstance<TValues>;
  name: TField;
  label?: ReactNode;
  options: ReadonlyArray<FormRadioOption<TValues[TField] & string>>;
  helperText?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  onValueChange?: (nextValue: TValues[TField] & string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  formControlProps?: Omit<FormControlProps, "error" | "required" | "disabled">;
  formLabelProps?: FormLabelProps;
};

const FormRadioGroupBase = <
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
>({
  store,
  name,
  label,
  options,
  helperText,
  required: requiredProp,
  disabled,
  onValueChange,
  onFocus,
  onBlur,
  formControlProps,
  formLabelProps,
  row = true,
  ...radioGroupProps
}: FormRadioGroupProps<TValues, TField>) => {
  const {
    values,
    errors,
    rules,
    formRule: formRuleStore,
    formError: formErrorStore,
    formField: formFieldStore,
    formValue: formValueStore,
  } = store;
  const getRuleValue = formRuleStore.ruleValue;
  const setError = formErrorStore.set;
  const setFieldBlur = formFieldStore.blur;
  const setFieldFocus = formFieldStore.focus;
  const setValue = formValueStore.set;

  const ruleProps = rules[name];
  const value = (values[name] as string) ?? "";
  const errorMessage = errors[name];
  const hasError = Boolean(errorMessage);
  const helperTextContent = errorMessage ?? helperText;
  const required = useMemo(
    () => Boolean(getRuleValue(ruleProps?.required)) || Boolean(requiredProp),
    [getRuleValue, requiredProp, ruleProps],
  );
  const isVertical = row !== true;

  const borderStyle = {
    borderColor: hasError ? "var(--error-main)" : "var(--divider)",
    "&:hover": {
      borderColor: hasError ? "var(--error-dark)" : "var(--text-primary)",
    },
    "&:focus-within": {
      borderColor: hasError ? "var(--error-main)" : "var(--primary-main)",
    },
  };

  return (
    <FormControl
      {...formControlProps}
      error={hasError}
      required={required}
      disabled={disabled}
    >
      {label ? <FormLabel {...formLabelProps}>{label}</FormLabel> : null}
      <RadioGroup
        {...radioGroupProps}
        row={row}
        name={String(name)}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value as TValues[TField] & string;

          setValue(name, nextValue as TValues[TField]);
          if (errorMessage !== undefined) {
            setError(name, null);
          }
          onValueChange?.(nextValue);
        }}
        onFocus={() => {
          setFieldFocus(name);
          onFocus?.();
        }}
        onBlur={() => {
          setFieldBlur(name);
          onBlur?.();
        }}
        sx={
          isVertical
            ? { gap: 1 }
            : { border: "1px solid", ...borderStyle, columnGap: 2 }
        }
      >
        {options.map((option, index) => {
          const optionDisabled = Boolean(disabled || option.disabled);
          return (
            <FormControlLabel
              key={option.key ?? `${String(option.value)}-${String(index)}`}
              value={option.value}
              disabled={optionDisabled}
              control={<Radio checkedIcon={<TaskAltIcon />} />}
              label={option.label}
              sx={{
                alignItems: "center",
                border: isVertical ? "1px solid" : "none",
                borderRadius: "var(--border-radius)",
                transition:
                  "border-color 180ms ease, background-color 180ms ease",
                margin: 0,
                marginLeft: 0,
                width: isVertical ? "100%" : "auto",
                ...(optionDisabled
                  ? {
                      borderColor: "var(--divider)",
                      backgroundColor: "var(--background-disabled)",
                    }
                  : borderStyle),
              }}
            />
          );
        })}
      </RadioGroup>
      {helperTextContent && (
        <FormHelperText>{helperTextContent}</FormHelperText>
      )}
    </FormControl>
  );
};

export const FormRadioGroup = memo(
  FormRadioGroupBase,
  areFormFieldPropsEqual,
) as typeof FormRadioGroupBase;
