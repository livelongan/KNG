import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { FormStore } from '../../hook';
import { FormBase, type FormNumberName } from './form-base';

type FormValues = Record<string, unknown>;
type GenericSlotProps = Record<string, unknown>;

type NumericActionButtonProps = {
  label: string;
  disabled: boolean;
  onClick: () => void;
  icon: ReactNode;
};

const resolveSlotProps = (source: unknown, ownerState: unknown): GenericSlotProps => {
  if (typeof source === 'function') {
    const resolved = (source as (input: unknown) => unknown)(ownerState);
    return resolved && typeof resolved === 'object' ? (resolved as GenericSlotProps) : {};
  }

  return source && typeof source === 'object' ? (source as GenericSlotProps) : {};
};

const normalizeBound = (value: unknown): number | undefined => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const NumericActionButton = ({
  label,
  disabled,
  onClick,
  icon,
}: NumericActionButtonProps) => (
  <IconButton
    aria-label={label}
    disabled={disabled}
    onPointerDown={(event) => event.preventDefault()}
    onClick={onClick}
    size="small"
    tabIndex={-1}
    type="button"
    sx={{ padding: '0 8px !important', borderRadius: 0 }}
  >
    {icon}
  </IconButton>
);

export type FormNumericProps<
  TValues extends FormValues,
  TField extends FormNumberName<TValues> = FormNumberName<TValues>,
> = Omit<TextFieldProps, 'type' | 'value' | 'onChange'> & {
  store: FormStore<TValues>;
  name: TField;
  clearable?: boolean;
  onClear?: () => void;
};

export const FormNumeric = <
  TValues extends FormValues,
  TField extends FormNumberName<TValues> = FormNumberName<TValues>,
>({
  store,
  name,
  slotProps,
  onChange,
  onFocus,
  onBlur,
  helperText,
  error,
  required: requiredProp,
  disabled,
  clearable = true,
  onClear,
  ...textFieldProps
}: FormNumericProps<TValues, TField>) => {
  const { values, errors, rules, hook } = store;
  const rule = rules[name];
  const rawValue = values[name];
  const {
    required,
    min: ruleMin,
    max: ruleMax,
    step: ruleStep,
    autoComplete,
    inputMode,
  } = useMemo(
    () => ({
      required: Boolean(hook.getRuleValue(rule?.required)),
      min: hook.getRuleValue(rule?.min),
      max: hook.getRuleValue(rule?.max),
      step: rule?.step,
      autoComplete: rule?.autoComplete,
      inputMode: rule?.inputMode,
    }),
    [hook, rule],
  );

  const min = useMemo(
    () => normalizeBound(textFieldProps.min ?? ruleMin),
    [ruleMin, textFieldProps.min],
  );
  const max = useMemo(
    () => normalizeBound(textFieldProps.max ?? ruleMax),
    [ruleMax, textFieldProps.max],
  );
  const step = useMemo(() => {
    const requestedStep = normalizeBound(textFieldProps.step ?? ruleStep);
    return requestedStep !== undefined && requestedStep > 0 ? requestedStep : 1;
  }, [ruleStep, textFieldProps.step]);
  const stepPrecision = useMemo(() => {
    const decimalPart = String(step).split('.')[1];
    return decimalPart ? decimalPart.length : 0;
  }, [step]);

  const inputValue = useMemo(() => {
    if (rawValue === null || rawValue === undefined || rawValue === '') return '';
    const parsedValue = typeof rawValue === 'number' ? rawValue : Number(rawValue);
    return Number.isFinite(parsedValue) ? parsedValue : '';
  }, [rawValue]);
  const currentNumericValue = useMemo(() => {
    if (inputValue === '') return min ?? 0;
    const parsedValue = Number(inputValue);
    return Number.isFinite(parsedValue) ? parsedValue : (min ?? 0);
  }, [inputValue, min]);
  const hasInputValue = inputValue !== '';
  const errorMessage = errors[name];

  const clearFieldValue = () => {
    if (onClear) {
      onClear();
      return;
    }
    hook.setValue(name, Number.NaN as TValues[TField]);
    hook.setError(name, null);
  };

  const updateNumberValue = (nextValue: number) => {
    if (!Number.isFinite(nextValue)) return;
    const roundedValue = Number(nextValue.toFixed(stepPrecision));
    const clampedMin = min !== undefined ? Math.max(roundedValue, min) : roundedValue;
    const clampedValue = max !== undefined ? Math.min(clampedMin, max) : clampedMin;
    hook.setValue(name, clampedValue as TValues[TField]);
    hook.setError(name, null);
  };

  const incrementTargetValue = hasInputValue ? currentNumericValue + step : (min ?? 0);
  const decrementTargetValue = hasInputValue
    ? currentNumericValue - step
    : min !== undefined
      ? min - step
      : -step;
  const canIncrement = !disabled && (max === undefined || incrementTargetValue <= max);
  const canDecrement = !disabled && (min === undefined || decrementTargetValue >= min);
  const effectiveSlotProps = resolveSlotProps(slotProps, values);
  const inputSlotProps = resolveSlotProps(effectiveSlotProps.input, values);
  const externalEndAdornment = inputSlotProps.endAdornment as ReactNode;
  const showClear = Boolean(clearable && hasInputValue && !disabled);
  const setFieldFocus = hook.setFieldFocus;
  const setFieldBlur = hook.setFieldBlur;
  const setValue = hook.setValue;
  const setError = hook.setError;

  const mergedSlotProps: TextFieldProps['slotProps'] = {
    ...(effectiveSlotProps as TextFieldProps['slotProps']),
    input: {
      ...inputSlotProps,
      endAdornment: (
        <>
          {externalEndAdornment}
          {showClear && (
            <InputAdornment position="end">
              <IconButton
                aria-label={`Clear ${String(name)}`}
                edge="end"
                onPointerDown={(event) => event.preventDefault()}
                onClick={clearFieldValue}
                size="small"
                type="button"
              >
                <ClearRoundedIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )}
          <InputAdornment position="end" sx={{ marginRight: '-12px !important' }}>
            <Stack direction="column" spacing={0}>
              <NumericActionButton
                label={`Increase ${String(name)}`}
                disabled={!canIncrement}
                onClick={() => updateNumberValue(incrementTargetValue)}
                icon={<KeyboardArrowUpRoundedIcon fontSize="small" />}
              />
              <NumericActionButton
                label={`Decrease ${String(name)}`}
                disabled={!canDecrement}
                onClick={() => updateNumberValue(decrementTargetValue)}
                icon={<KeyboardArrowDownRoundedIcon fontSize="small" />}
              />
            </Stack>
          </InputAdornment>
        </>
      ),
    },
    htmlInput: {
      ...resolveSlotProps(effectiveSlotProps.htmlInput, values),
      min: min ?? resolveSlotProps(effectiveSlotProps.htmlInput, values).min,
      max: max ?? resolveSlotProps(effectiveSlotProps.htmlInput, values).max,
      step,
      autoComplete:
        autoComplete ??
        resolveSlotProps(effectiveSlotProps.htmlInput, values).autoComplete,
      inputMode:
        inputMode ?? resolveSlotProps(effectiveSlotProps.htmlInput, values).inputMode,
    },
  };

  return (
    <FormBase<TValues, TField>
      store={store}
      name={name}
      clearable={false}
      disabled={disabled}
      slotProps={slotProps}
    >
      {(field) => (
        <TextField
          {...textFieldProps}
          type="number"
          name={String(name)}
          value={inputValue}
          error={Boolean(errorMessage) || Boolean(error)}
          helperText={errorMessage ?? helperText}
          required={field.required || required || Boolean(requiredProp)}
          disabled={disabled}
          onChange={(event) => {
            const nextRawValue = event.target.value;
            if (nextRawValue.trim() === '') {
              setValue(name, Number.NaN as TValues[TField]);
              setError(name, null);
              onChange?.(event);
              return;
            }

            const nextValue = Number(nextRawValue);
            if (Number.isFinite(nextValue)) updateNumberValue(nextValue);
            onChange?.(event);
          }}
          onFocus={(event) => {
            setFieldFocus(name);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFieldBlur(name);
            onBlur?.(event);
          }}
          slotProps={mergedSlotProps}
        />
      )}
    </FormBase>
  );
};
