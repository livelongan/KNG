import ClearRoundedIcon from '@mui/icons-material/ClearRounded'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { IconButton, ListSubheader, MenuItem, TextField, type TextFieldProps } from '@mui/material'
import { memo, useMemo, useState, type ReactNode } from 'react'
import { FormBase, type FormTextName } from './form-base'
import { areFormFieldPropsEqual } from './form-field-memo'
import type {
  FormRule,
  FormSelectFilter,
  FormSelectOption,
  FormStore,
  FormSelectFilter as RuleSelectFilter,
} from './use-form'

type FormValues = Record<string, unknown>
type GenericSlotProps = Record<string, unknown>

const resolveSlotProps = (source: unknown, ownerState: unknown): GenericSlotProps => {
  if (typeof source === 'function') {
    const resolved = (source as (input: unknown) => unknown)(ownerState)

    if (resolved && typeof resolved === 'object') {
      return resolved as GenericSlotProps
    }

    return {}
  }

  if (source && typeof source === 'object') {
    return source as GenericSlotProps
  }

  return {}
}


export type FormSelectProps<
  TValues extends FormValues,
  TField extends FormTextName<TValues> = FormTextName<TValues>,
  TOption extends FormSelectOption = FormSelectOption,
> = Omit<TextFieldProps, 'select' | 'children' | 'type'> & {
  store: FormStore<TValues>
  name: TField
  options: ReadonlyArray<TOption>
  valueKey?: Extract<keyof TOption, string>
  labelKey?: Extract<keyof TOption, string>
  filter?: FormSelectFilter<TValues, TOption>
  keywordFilter?: boolean
  keywordFilterPlaceholder?: string
  clearable?: boolean
  onClear?: () => void
}

type SelectIconProps = { className?: string }

const getSearchSource = (labelValue: unknown, optionValue: string) => {
  if (typeof labelValue === 'string' || typeof labelValue === 'number') {
    return String(labelValue)
  }

  return optionValue
}

const shouldTrackAllValues = <
  TValues extends FormValues,
  TField extends FormTextName<TValues>,
  TOption extends FormSelectOption,
>(
  props: FormSelectProps<TValues, TField, TOption>,
) => {
  const fieldRule = props.store.rules[props.name] as FormRule<TValues[TField], TValues> | undefined
  const propFilterNeedsValues = (props.filter?.length ?? 0) >= 2
  const ruleFilterNeedsValues = (fieldRule?.filter?.length ?? 0) >= 2

  return propFilterNeedsValues || ruleFilterNeedsValues
}

const areFormSelectPropsEqual = <
  TValues extends FormValues,
  TField extends FormTextName<TValues>,
  TOption extends FormSelectOption,
>(
  previousProps: FormSelectProps<TValues, TField, TOption>,
  nextProps: FormSelectProps<TValues, TField, TOption>,
) => {
  if (!areFormFieldPropsEqual(previousProps, nextProps)) {
    return false
  }

  const needsAllValues = shouldTrackAllValues(previousProps) || shouldTrackAllValues(nextProps)
  if (!needsAllValues) {
    return true
  }

  return Object.is(previousProps.store.values, nextProps.store.values)
}

const FormSelectBase = <
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
  onChange,
  onFocus,
  onBlur,
  helperText,
  error,
  required: requiredProp,
  disabled,
  ...textFieldProps
}: FormSelectProps<TValues, TField, TOption>) => {
  const { values, rules } = store
  const fieldRule = rules[name] as FormRule<TValues[TField], TValues> | undefined
  const [keyword, setKeyword] = useState('')

  const resolvedValueKey = (valueKey ?? fieldRule?.valueKey ?? 'value') as Extract<
    keyof TOption,
    string
  >
  const resolvedLabelKey = (labelKey ?? fieldRule?.labelKey ?? 'label') as Extract<
    keyof TOption,
    string
  >
  const propFilter = filter
  const ruleFilter = fieldRule?.filter as RuleSelectFilter<TValues> | undefined
  const filterNeedsValues = (propFilter?.length ?? 0) >= 2 || (ruleFilter?.length ?? 0) >= 2
  const filterContextValues = filterNeedsValues ? values : undefined
  const resolvedKeywordFilter = keywordFilter ?? fieldRule?.keywordFilter ?? false
  const resolvedKeywordFilterPlaceholder =
    keywordFilterPlaceholder ?? fieldRule?.keywordFilterPlaceholder ?? 'Input keyword to filter'
  const normalizedKeyword = keyword.trim().toLowerCase()
  const selectedValueRaw = values[name]
  const selectedValue =
    selectedValueRaw === null || selectedValueRaw === undefined ? '' : String(selectedValueRaw)

  const filteredOptions = useMemo(() => {
    const contextValues = (filterContextValues ?? ({} as TValues)) as TValues

    if (propFilter) {
      return options.filter((option, index, list) =>
        propFilter(option, { index, options: list, values: contextValues }),
      )
    }

    if (ruleFilter) {
      return options.filter((option, index, list) =>
        ruleFilter(option as Record<string, unknown>, {
          index,
          options: list as ReadonlyArray<Record<string, unknown>>,
          values: contextValues,
        }),
      )
    }

    return options
  }, [options, propFilter, ruleFilter, filterContextValues])

  const displayedOptions = useMemo(() => {
    if (!resolvedKeywordFilter || normalizedKeyword.length === 0) {
      return filteredOptions
    }

    return filteredOptions.filter((option) => {
      const optionValueRaw = option[resolvedValueKey]
      const optionValue =
        optionValueRaw === null || optionValueRaw === undefined ? '' : String(optionValueRaw)
      const isSelectedOption = selectedValue.length > 0 && optionValue === selectedValue

      if (isSelectedOption) {
        return true
      }

      const optionLabelRaw = option[resolvedLabelKey]
      const optionSearchSource = getSearchSource(optionLabelRaw, optionValue)

      return (
        optionSearchSource.toLowerCase().includes(normalizedKeyword) ||
        optionValue.toLowerCase().includes(normalizedKeyword)
      )
    })
  }, [
    filteredOptions,
    normalizedKeyword,
    resolvedKeywordFilter,
    resolvedLabelKey,
    resolvedValueKey,
    selectedValue,
  ])

  return (
    <FormBase<TValues, TField>
      store={store}
      name={name}
      slotProps={slotProps}
      clearable={false}
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
        onFieldClear,
        onFieldFocus,
        onFieldBlur,
      }) => {
        const hasValue = value.trim().length > 0

        const SelectControlIcon = ({ className }: SelectIconProps) => {
          if (clearable && hasValue && !disabled) {
            return (
              <IconButton
                className={className}
                component="span"
                size="small"
                tabIndex={-1}
                aria-label={`Clear ${fieldName}`}
                onPointerDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onFieldClear()
                }}
                style={{ top: 'unset', pointerEvents: 'auto' }}
              >
                <ClearRoundedIcon fontSize="small" />
              </IconButton>
            )
          }

          const isOpen = className?.includes('MuiSelect-iconOpen')

          return (
            <IconButton
              className={className}
              component="span"
              size="small"
              disableRipple
              tabIndex={-1}
              aria-hidden
              style={{ top: 'unset', pointerEvents: 'none' }}
            >
              {isOpen ? (
                <KeyboardArrowUpIcon fontSize="small" />
              ) : (
                <KeyboardArrowDownIcon fontSize="small" />
              )}
            </IconButton>
          )
        }

        const appliedSlotProps: TextFieldProps['slotProps'] = {
          ...mergedSlotProps,
          select: (ownerState) => {
            const selectSlotProps = resolveSlotProps(mergedSlotProps?.select, ownerState)
            const externalOnClose = selectSlotProps.onClose as
              ((event: unknown) => void) | undefined
            const externalMenuProps =
              (selectSlotProps.MenuProps as GenericSlotProps | undefined) ?? {}

            return {
              ...selectSlotProps,
              IconComponent: selectSlotProps.IconComponent ?? SelectControlIcon,
              onClose: (event: unknown) => {
                setKeyword('')
                externalOnClose?.(event)
              },
              MenuProps: resolvedKeywordFilter
                ? { ...externalMenuProps, disableAutoFocusItem: true }
                : externalMenuProps,
            }
          },
        }

        return (
          <TextField
            {...textFieldProps}
            select
            name={fieldName}
            value={value}
            error={Boolean(errorMessage) || Boolean(error)}
            helperText={errorMessage ?? helperText}
            required={required || Boolean(requiredProp)}
            disabled={disabled}
            onChange={(event) => {
              onFieldChange(event.target.value)
              onChange?.(event)
            }}
            onFocus={(event) => {
              onFieldFocus()
              onFocus?.(event)
            }}
            onBlur={(event) => {
              onFieldBlur()
              onBlur?.(event)
            }}
            slotProps={appliedSlotProps}
          >
            {resolvedKeywordFilter ? (
              <ListSubheader disableSticky>
                <TextField
                  fullWidth
                  autoFocus
                  size="small"
                  placeholder={resolvedKeywordFilterPlaceholder}
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.target.value)
                  }}
                  onKeyDown={(event) => {
                    event.stopPropagation()
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation()
                  }}
                />
              </ListSubheader>
            ) : null}
            {displayedOptions.map((option, index) => {
              const optionValueRaw = option[resolvedValueKey]
              const optionValue =
                optionValueRaw === null || optionValueRaw === undefined
                  ? ''
                  : String(optionValueRaw)
              const optionLabelRaw = option[resolvedLabelKey]
              const optionLabel = (optionLabelRaw ?? optionValue) as ReactNode

              return (
                <MenuItem
                  key={
                    typeof option.key === 'string' ? option.key : `${optionValue}-${String(index)}`
                  }
                  value={optionValue}
                  disabled={Boolean(option.disabled)}
                >
                  {optionLabel}
                </MenuItem>
              )
            })}

            {displayedOptions.length === 0 ? (
              <MenuItem disabled>No matching options</MenuItem>
            ) : null}
          </TextField>
        )
      }}
    </FormBase>
  )
}

export const FormSelect = memo(FormSelectBase, areFormSelectPropsEqual) as typeof FormSelectBase
