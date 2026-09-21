import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  IconButton,
  InputAdornment,
  ListSubheader,
  MenuItem,
  TextField,
} from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { useMemo, useState } from 'react';
import type { FormRule, FormSelectFilter, FormStore } from '../../hook';
import { FormBase, type FormTextName } from './form-base';

type FormValues = Record<string, unknown>;
type GenericSlotProps = Record<string, unknown>;

export type FormSelectOption = {
  key?: string;
  disabled?: boolean;
  [key: string]: unknown;
};

export type FormSelectProps<
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
  TOption extends FormSelectOption = FormSelectOption,
> = Omit<TextFieldProps, 'select' | 'children' | 'value' | 'onChange'> & {
  store: FormStore<TValues>;
  name: TField;
  options: readonly TOption[];
  valueKey?: Extract<keyof TOption, string>;
  labelKey?: Extract<keyof TOption, string>;
  filter?: FormSelectFilter<TValues>;
  keywordFilter?: boolean;
  keywordFilterPlaceholder?: string;
  clearable?: boolean;
  onClear?: () => void;
};

const resolveSlotProps = (source: unknown, ownerState: unknown): GenericSlotProps => {
  if (typeof source === 'function') {
    const resolved = (source as (state: unknown) => unknown)(ownerState);
    return resolved && typeof resolved === 'object' ? (resolved as GenericSlotProps) : {};
  }
  return source && typeof source === 'object' ? (source as GenericSlotProps) : {};
};

const getSearchSource = (value: unknown, fallback: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return fallback;
};

export const FormSelect = <
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
  TOption extends FormSelectOption = FormSelectOption,
>({
  store,
  name,
  options,
  valueKey,
  labelKey,
  filter,
  keywordFilter,
  keywordFilterPlaceholder,
  clearable = true,
  onClear,
  slotProps,
  ...textFieldProps
}: FormSelectProps<TValues, TField, TOption>) => {
  const rule = store.rules[name] as FormRule<unknown, TValues> | undefined;
  const [keyword, setKeyword] = useState('');
  const value = store.values[name];
  const selectedValue = value === null || value === undefined ? '' : String(value);
  const resolvedValueKey =
    valueKey ?? (rule?.valueKey as Extract<keyof TOption, string> | undefined) ?? 'value';
  const resolvedLabelKey =
    labelKey ?? (rule?.labelKey as Extract<keyof TOption, string> | undefined) ?? 'label';
  const resolvedFilter = filter ?? rule?.filter;
  const resolvedKeywordFilter = keywordFilter ?? rule?.keywordFilter ?? false;
  const resolvedPlaceholder =
    keywordFilterPlaceholder ??
    rule?.keywordFilterPlaceholder ??
    'Input keyword to filter';

  const filteredOptions = useMemo(() => {
    const ruleFiltered = options.filter((option, index, list) => {
      if (!resolvedFilter) return true;
      return resolvedFilter(option as never, {
        index,
        options: list as never,
        values: store.values,
      });
    });
    if (!resolvedKeywordFilter || keyword.trim().length === 0) return ruleFiltered;
    const normalizedKeyword = keyword.trim().toLowerCase();
    return ruleFiltered.filter((option) => {
      const optionValue = getSearchSource(option[resolvedValueKey], '');
      const optionLabel = getSearchSource(option[resolvedLabelKey], optionValue);
      return (
        String(optionValue).toLowerCase().includes(normalizedKeyword) ||
        String(optionLabel).toLowerCase().includes(normalizedKeyword)
      );
    });
  }, [
    keyword,
    options,
    resolvedFilter,
    resolvedKeywordFilter,
    resolvedLabelKey,
    resolvedValueKey,
    store.values,
  ]);

  const selectedOption = options.find(
    (option) => String(option[resolvedValueKey]) === selectedValue,
  );
  const selectedLabel = selectedOption
    ? String(selectedOption[resolvedLabelKey])
    : selectedValue;
  const mergedSlotProps = resolveSlotProps(slotProps, store.values);
  const inputSlotProps = mergedSlotProps.input as GenericSlotProps | undefined;
  const externalEndAdornment = inputSlotProps?.endAdornment;

  return (
    <FormBase<TValues, TField>
      store={store}
      name={name}
      clearable={clearable}
      onClear={onClear}
      slotProps={slotProps}
    >
      {(field) => (
        <TextField
          {...textFieldProps}
          select
          fullWidth
          name={field.name}
          value={field.value}
          error={Boolean(field.errorMessage) || Boolean(textFieldProps.error)}
          helperText={field.errorMessage ?? textFieldProps.helperText}
          required={field.required || textFieldProps.required}
          onChange={(event) => field.onFieldChange(event.target.value)}
          onFocus={field.onFieldFocus}
          onBlur={field.onFieldBlur}
          slotProps={{
            ...(field.slotProps as TextFieldProps['slotProps']),
            input: {
              ...(inputSlotProps ?? {}),
              endAdornment: (
                <>
                  {clearable && field.value.trim().length > 0 && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label={`Clear ${String(field.name)}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => field.onFieldClear?.()}
                      >
                        <ClearRoundedIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )}
                  {externalEndAdornment}
                </>
              ),
            },
            select: {
              IconComponent: ({ className }: { className?: string }) => (
                <IconButton
                  className={className}
                  component="span"
                  size="small"
                  tabIndex={-1}
                >
                  {className?.includes('MuiSelect-iconOpen') ? (
                    <KeyboardArrowUpIcon fontSize="small" />
                  ) : (
                    <KeyboardArrowDownIcon fontSize="small" />
                  )}
                </IconButton>
              ),
            },
          }}
        >
          {resolvedKeywordFilter && (
            <ListSubheader disableSticky>
              <TextField
                autoFocus
                fullWidth
                size="small"
                placeholder={resolvedPlaceholder}
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              />
            </ListSubheader>
          )}
          {filteredOptions.map((option, index) => {
            const optionValue = String(option[resolvedValueKey] ?? '');
            const optionLabel = option[resolvedLabelKey] ?? optionValue;
            return (
              <MenuItem
                key={
                  typeof option.key === 'string'
                    ? option.key
                    : `${optionValue}-${String(index)}`
                }
                value={optionValue}
                disabled={Boolean(option.disabled)}
              >
                {optionLabel as React.ReactNode}
              </MenuItem>
            );
          })}
          {filteredOptions.length === 0 && (
            <MenuItem disabled>No matching options</MenuItem>
          )}
          {!selectedOption && selectedLabel && (
            <MenuItem value={selectedValue}>{selectedLabel}</MenuItem>
          )}
        </TextField>
      )}
    </FormBase>
  );
};
