import CheckIcon from '@mui/icons-material/Check';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
} from '@mui/material';
import type { CheckboxProps, FormControlLabelProps } from '@mui/material';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormStore } from '../../hook';

type FormValues = Record<string, unknown>;

type FormCheckboxProps<TValues extends FormValues> = Omit<
  CheckboxProps,
  'name' | 'checked' | 'onChange' | 'required'
> & {
  store: FormStore<TValues>;
  name: keyof TValues & string;
  label: ReactNode;
  helperText?: ReactNode;
  required?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  formControlLabelProps?: Omit<FormControlLabelProps, 'control' | 'label' | 'disabled'>;
};

export const FormCheckbox = <TValues extends FormValues>({
  store,
  name,
  label,
  helperText,
  required: requiredProp,
  onCheckedChange,
  onFocus,
  onBlur,
  formControlLabelProps,
  disabled,
  ...checkboxProps
}: FormCheckboxProps<TValues>) => {
  const formControlLabelRef = useRef<HTMLLabelElement>(null);
  const [isLabelWrapped, setIsLabelWrapped] = useState(false);
  const checked = Boolean(store.values[name]);
  const errorMessage = store.errors[name];
  const hasError = Boolean(errorMessage);
  const required = useMemo(
    () => Boolean(store.hook.getRuleValue(store.rules[name]?.required) || requiredProp),
    [requiredProp, store.hook, store.rules, name],
  );

  useEffect(() => {
    const labelElement = formControlLabelRef.current?.querySelector<HTMLElement>(
      '.MuiFormControlLabel-label',
    );
    if (!labelElement) {
      setIsLabelWrapped(false);
      return;
    }

    const updateWrapState = () => {
      const lineHeight = Number.parseFloat(
        window.getComputedStyle(labelElement).lineHeight || '0',
      );
      if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
        setIsLabelWrapped(false);
        return;
      }
      setIsLabelWrapped(labelElement.getBoundingClientRect().height > lineHeight + 1);
    };

    updateWrapState();
    const resizeObserver = new ResizeObserver(updateWrapState);
    resizeObserver.observe(labelElement);
    window.addEventListener('resize', updateWrapState);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWrapState);
    };
  }, [label]);

  const handleChange = (nextChecked: boolean) => {
    store.hook.setValue(name, nextChecked as TValues[typeof name]);
    store.hook.setError(name, null);
    onCheckedChange?.(nextChecked);
  };

  return (
    <FormControl error={hasError} required={required} disabled={disabled}>
      <Box
        sx={(theme) => ({
          borderStyle: 'solid',
          borderWidth: 1,
          borderRadius: `${theme.shape.borderRadius}px`,
          '& .MuiFormControlLabel-root': {
            alignItems: isLabelWrapped ? 'flex-start' : 'center',
            width: '100%',
            marginLeft: 0,
            marginRight: 0,
            display: 'flex',
          },
          borderColor: hasError ? theme.palette.error.main : theme.palette.divider,
          transition: 'border-color 180ms ease, background-color 180ms ease',
          '&:hover': disabled ? undefined : { borderColor: theme.palette.primary.main },
        })}
      >
        <FormControlLabel
          ref={formControlLabelRef}
          {...formControlLabelProps}
          label={label}
          disabled={disabled}
          control={
            <Checkbox
              {...checkboxProps}
              name={String(name)}
              checked={checked}
              checkedIcon={<CheckIcon />}
              required={required}
              disabled={disabled}
              onChange={(_, nextChecked) => handleChange(nextChecked)}
              onFocus={() => {
                store.hook.setFieldFocus(name);
                onFocus?.();
              }}
              onBlur={() => {
                store.hook.setFieldBlur(name);
                onBlur?.();
              }}
            />
          }
        />
      </Box>
      {(errorMessage ?? helperText) && (
        <FormHelperText>{errorMessage ?? helperText}</FormHelperText>
      )}
    </FormControl>
  );
};
