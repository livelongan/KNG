import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import SearchIcon from '@mui/icons-material/Search'
import {
    Autocomplete,
    Stack,
    TextField,
    type AutocompleteProps,
    type TextFieldProps,
} from '@mui/material'
import {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type Key,
    type ReactNode,
} from 'react'
import { TextSmall } from '../typography'
import type { FormTextName } from './form-base'
import { areFormFieldPropsEqual } from './form-field-memo'
import type { FormInstance, FormRule, FormSelectOption } from './use-form'

type FormValues = Record<string, unknown>
type Primitive = string | number | boolean

export type FormDropdownOption = FormSelectOption

type FormDropdownOptionValue<TOption extends FormDropdownOption> = TOption[Extract<
    keyof TOption,
    string
>]

export type FormDropdownRenderContext<TOption extends FormDropdownOption> = {
    label: string
    value: FormDropdownOptionValue<TOption>
    keyword: string
    selected: boolean
    index: number
    disabled: boolean
    option: TOption
}

export type FormDropdownRemoteConfig<TOption extends FormDropdownOption> = {
    search: (keyword: string, context: { signal: AbortSignal }) => Promise<ReadonlyArray<TOption>>
    debounceMs?: number
    minKeywordLength?: number
    minKeywordHint?: ReactNode
}

type BaseAutocompleteProps<TOption extends FormDropdownOption> = Omit<
    AutocompleteProps<TOption, false, boolean, false>,
    'options' | 'value' | 'renderInput' | 'onChange' | 'onInputChange'
>

export type FormDropdownProps<
    TValues extends FormValues,
    TField extends FormTextName<TValues> = FormTextName<TValues>,
    TOption extends FormDropdownOption = FormDropdownOption,
> = BaseAutocompleteProps<TOption> & {
    store: FormInstance<TValues>
    name: TField
    options: ReadonlyArray<TOption>
    label?: TextFieldProps['label']
    helperText?: TextFieldProps['helperText']
    placeholder?: string
    required?: boolean
    textFieldProps?: Omit<
        TextFieldProps,
        'name' | 'label' | 'value' | 'error' | 'helperText' | 'required'
    >
    valueKey?: Extract<keyof TOption, string>
    labelKey?: Extract<keyof TOption, string>
    keywordFilter?: boolean
    fuzzySearch?: boolean
    searchKeys?: ReadonlyArray<Extract<keyof TOption, string>>
    clearable?: boolean
    emptyValue?: TValues[TField]
    remote?: FormDropdownRemoteConfig<TOption>
    renderOptionItem?: (option: TOption, context: FormDropdownRenderContext<TOption>) => ReactNode
    onValueChange?: (value: TValues[TField], option: TOption | null) => void
    onFieldFocus?: () => void
    onFieldBlur?: () => void
    popupIcon?: ReactNode
    onOpen?: AutocompleteProps<TOption, false, boolean, false>['onOpen']
    onClose?: AutocompleteProps<TOption, false, boolean, false>['onClose']
    onChange?: AutocompleteProps<TOption, false, boolean, false>['onChange']
    onInputChange?: AutocompleteProps<TOption, false, boolean, false>['onInputChange']
    disableClearable?: boolean
    className?: string
}

const isPrimitive = (input: unknown): input is Primitive =>
    typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean'

const toSearchableText = (input: unknown): string => {
    if (isPrimitive(input)) {
        return String(input)
    }
    return ''
}

const toComparableText = (input: unknown): string | null => {
    if (isPrimitive(input)) {
        return String(input)
    }
    return null
}

const isOptionValueEqual = (left: unknown, right: unknown): boolean => {
    if (Object.is(left, right)) {
        return true
    }

    const leftText = toComparableText(left)
    const rightText = toComparableText(right)

    if (leftText === null || rightText === null) {
        return false
    }

    return leftText === rightText
}

const tokenizeKeyword = (keyword: string): string[] =>
    keyword
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((token) => token.length > 0)

const getSubsequenceScore = (source: string, query: string): number | null => {
    let sourceIndex = 0
    let score = 0
    let streak = 0

    for (let index = 0; index < query.length; index += 1) {
        const character = query[index]
        const foundIndex = source.indexOf(character, sourceIndex)

        if (foundIndex < 0) {
            return null
        }

        const gap = foundIndex - sourceIndex
        score += gap

        if (gap === 0) {
            streak += 1
            score -= Math.min(streak, 3)
        } else {
            streak = 0
        }

        sourceIndex = foundIndex + 1
    }

    return score + Math.max(0, source.length - query.length) * 0.01
}

const getFuzzyScore = (source: string, tokens: string[]): number | null => {
    if (tokens.length === 0) {
        return 0
    }

    let score = 0

    for (const token of tokens) {
        const directIndex = source.indexOf(token)
        if (directIndex >= 0) {
            score += directIndex
            continue
        }

        const subsequenceScore = getSubsequenceScore(source, token)
        if (subsequenceScore === null) {
            return null
        }

        score += subsequenceScore + 2
    }

    return score
}

const areFormDropdownPropsEqual = <
    TValues extends FormValues,
    TField extends FormTextName<TValues>,
    TOption extends FormDropdownOption,
>(
    previousProps: FormDropdownProps<TValues, TField, TOption>,
    nextProps: FormDropdownProps<TValues, TField, TOption>,
): boolean => areFormFieldPropsEqual(previousProps, nextProps)

const FormDropdownBase = <
    TValues extends FormValues,
    TField extends FormTextName<TValues> = FormTextName<TValues>,
    TOption extends FormDropdownOption = FormDropdownOption,
>({
    store,
    name,
    options,
    label,
    helperText,
    placeholder,
    required: requiredProp,
    textFieldProps,
    valueKey,
    labelKey,
    keywordFilter = true,
    fuzzySearch = true,
    searchKeys,
    clearable = true,
    emptyValue,
    remote,
    renderOptionItem,
    onValueChange,
    onFieldFocus,
    onFieldBlur,
    popupIcon,
    onOpen,
    onClose,
    onChange,
    onInputChange,
    disableClearable,
    className = '',
    ...others
}: FormDropdownProps<TValues, TField, TOption>) => {
    const {
        values,
        errors,
        rules,
        formRule: formRuleStore,
        formError: formErrorStore,
        formField: formFieldStore,
        formValue: formValueStore,
    } = store

    const getRuleValue = formRuleStore.ruleValue
    const setError = formErrorStore.set
    const setFieldBlur = formFieldStore.blur
    const setFieldFocus = formFieldStore.focus
    const setValue = formValueStore.set

    const fieldRule = rules[name] as FormRule<TValues[TField], TValues> | undefined
    const fieldError = errors[name]
    const selectedFieldValue = values[name]
    const [keyword, setKeyword] = useState('')
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [remoteOptions, setRemoteOptions] = useState<ReadonlyArray<TOption>>([])
    const [isRemoteLoading, setIsRemoteLoading] = useState(false)
    const remoteRequestIdRef = useRef(0)
    const remoteAbortControllerRef = useRef<AbortController | null>(null)

    const remoteSearch = remote?.search
    const isRemoteMode = typeof remoteSearch === 'function'
    const remoteDebounceMs = Math.max(0, remote?.debounceMs ?? 300)
    const remoteMinKeywordLength = Math.max(0, remote?.minKeywordLength ?? 1)
    const normalizedKeyword = keyword.trim()
    const resolvedOpen = typeof others.open === 'boolean' ? others.open : isPopupOpen
    const remoteMinKeywordHint =
        remote?.minKeywordHint ?? `Type at least ${String(remoteMinKeywordLength)} characters`

    const abortRemoteRequest = useCallback(() => {
        if (remoteAbortControllerRef.current) {
            remoteAbortControllerRef.current.abort()
            remoteAbortControllerRef.current = null
        }
    }, [])

    useEffect(
        () => () => {
            abortRemoteRequest()
        },
        [abortRemoteRequest],
    )

    useEffect(() => {
        if (!isRemoteMode || !remoteSearch) {
            return
        }

        if (!resolvedOpen) {
            abortRemoteRequest()
            return
        }

        if (normalizedKeyword.length < remoteMinKeywordLength) {
            abortRemoteRequest()
            return
        }

        const timerId = setTimeout(() => {
            abortRemoteRequest()

            const controller = new AbortController()
            remoteAbortControllerRef.current = controller
            const currentRequestId = remoteRequestIdRef.current + 1
            remoteRequestIdRef.current = currentRequestId
            setIsRemoteLoading(true)

            remoteSearch(normalizedKeyword, { signal: controller.signal })
                .then((nextOptions) => {
                    if (
                        controller.signal.aborted ||
                        currentRequestId !== remoteRequestIdRef.current
                    ) {
                        return
                    }

                    setRemoteOptions(nextOptions ?? [])
                })
                .catch(() => {
                    if (
                        controller.signal.aborted ||
                        currentRequestId !== remoteRequestIdRef.current
                    ) {
                        return
                    }

                    setRemoteOptions([])
                })
                .finally(() => {
                    if (currentRequestId !== remoteRequestIdRef.current) {
                        return
                    }

                    setIsRemoteLoading(false)
                })
        }, remoteDebounceMs)

        return () => {
            clearTimeout(timerId)
        }
    }, [
        abortRemoteRequest,
        isRemoteMode,
        normalizedKeyword,
        remoteDebounceMs,
        remoteMinKeywordLength,
        remoteSearch,
        resolvedOpen,
    ])

    const resolvedValueKey = (valueKey ?? fieldRule?.valueKey ?? 'value') as Extract<
        keyof TOption,
        string
    >
    const resolvedLabelKey = (labelKey ?? fieldRule?.labelKey ?? 'label') as Extract<
        keyof TOption,
        string
    >

    const isRequired = useMemo(
        () => Boolean(getRuleValue(fieldRule?.required)) || Boolean(requiredProp),
        [fieldRule, getRuleValue, requiredProp],
    )

    const getOptionValue = useCallback(
        (option: TOption) => option[resolvedValueKey],
        [resolvedValueKey],
    )

    const getOptionLabelValue = useCallback(
        (option: TOption) => {
            const labelValue = toSearchableText(option[resolvedLabelKey])
            if (labelValue.length > 0) {
                return labelValue
            }

            return toSearchableText(getOptionValue(option))
        },
        [getOptionValue, resolvedLabelKey],
    )

    const getOptionSearchSource = useCallback(
        (option: TOption) => {
            const parts = new Set<string>()
            const optionLabel = getOptionLabelValue(option)
            const optionValue = toSearchableText(getOptionValue(option))

            if (optionLabel.length > 0) {
                parts.add(optionLabel)
            }
            if (optionValue.length > 0) {
                parts.add(optionValue)
            }

            searchKeys?.forEach((key) => {
                const partText = toSearchableText(option[key])
                if (partText.length > 0) {
                    parts.add(partText)
                }
            })

            return Array.from(parts).join(' ').toLowerCase()
        },
        [getOptionLabelValue, getOptionValue, searchKeys],
    )

    const optionSource = isRemoteMode
        ? normalizedKeyword.length >= remoteMinKeywordLength
            ? remoteOptions
            : options
        : options

    const normalizedTokens = useMemo(() => tokenizeKeyword(keyword), [keyword])

    const displayedOptions = useMemo(() => {
        if (isRemoteMode) {
            return optionSource
        }

        if (!keywordFilter || normalizedTokens.length === 0) {
            return optionSource
        }

        if (!fuzzySearch) {
            return optionSource.filter((option) => {
                const searchSource = getOptionSearchSource(option)
                if (searchSource.length === 0) {
                    return false
                }
                return normalizedTokens.every((token) => searchSource.includes(token))
            })
        }

        type OptionScore = { option: TOption; score: number; index: number }
        const scoredOptions: OptionScore[] = []

        optionSource.forEach((option, index) => {
            const searchSource = getOptionSearchSource(option)
            if (searchSource.length === 0) {
                return
            }

            const score = getFuzzyScore(searchSource, normalizedTokens)
            if (score === null) {
                return
            }

            scoredOptions.push({ option, score, index })
        })

        scoredOptions.sort((left, right) => {
            if (left.score !== right.score) {
                return left.score - right.score
            }
            return left.index - right.index
        })

        return scoredOptions.map((item) => item.option)
    }, [
        fuzzySearch,
        getOptionSearchSource,
        isRemoteMode,
        keywordFilter,
        normalizedTokens,
        optionSource,
    ])

    const selectedOption = useMemo(() => {
        const selectedSource = isRemoteMode ? [...options, ...remoteOptions] : options

        return (
            selectedSource.find((option) =>
                isOptionValueEqual(getOptionValue(option), selectedFieldValue),
            ) ?? null
        )
    }, [getOptionValue, isRemoteMode, options, remoteOptions, selectedFieldValue])

    const resolvedDisableClearable = disableClearable ?? !clearable
    const resolvedLoading = Boolean(others.loading) || (isRemoteMode && isRemoteLoading)
    const defaultNoOptionsText = others.noOptionsText ?? 'No options'
    const showRemoteMinKeywordHint =
        isRemoteMode && resolvedOpen && normalizedKeyword.length < remoteMinKeywordLength
    const resolvedNoOptionsText = showRemoteMinKeywordHint
        ? remoteMinKeywordHint
        : defaultNoOptionsText
    const resolvedNoOptionsNode = showRemoteMinKeywordHint ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <SearchIcon />
            <TextSmall>{resolvedNoOptionsText}</TextSmall>
        </Stack>
    ) : (
        defaultNoOptionsText
    )
    const baseSx = {
        '.MuiAutocomplete-endAdornment .MuiButtonBase-root': { padding: '4px' },
        '& .MuiAutocomplete-popupIndicatorOpen': { transform: 'none' },
    }
    const mergedSx = [
        baseSx,
        ...(Array.isArray(others.sx) ? others.sx : others.sx === undefined ? [] : [others.sx]),
    ]

    return (
        <Autocomplete<TOption, false, boolean, false>
            {...others}
            className={`MuiFormControl-root ${className}`.trim()}
            popupIcon={
                popupIcon ??
                (resolvedOpen ? (
                    <KeyboardArrowUpIcon fontSize="small" />
                ) : (
                    <KeyboardArrowDownIcon fontSize="small" />
                ))
            }
            filterOptions={(inputOptions) => inputOptions}
            options={displayedOptions}
            value={selectedOption}
            loading={resolvedLoading}
            noOptionsText={resolvedNoOptionsNode}
            disableClearable={resolvedDisableClearable}
            getOptionDisabled={(option) => Boolean(option.disabled)}
            isOptionEqualToValue={(option, value) =>
                isOptionValueEqual(getOptionValue(option), getOptionValue(value))
            }
            getOptionLabel={(option) => getOptionLabelValue(option)}
            renderOption={(renderProps, option, state, ownerState) => {
                if (others.renderOption) {
                    return others.renderOption(renderProps, option, state, ownerState)
                }

                const { key: optionKey, ...optionRenderProps } =
                    renderProps as typeof renderProps & {
                        key: Key
                    }
                const optionLabel = getOptionLabelValue(option)
                if (!renderOptionItem) {
                    return (
                        <li key={optionKey} {...optionRenderProps}>
                            {optionLabel}
                        </li>
                    )
                }

                const context: FormDropdownRenderContext<TOption> = {
                    label: optionLabel,
                    value: getOptionValue(option) as FormDropdownOptionValue<TOption>,
                    keyword,
                    selected: state.selected,
                    index: state.index,
                    disabled: Boolean(option.disabled),
                    option,
                }

                return (
                    <li key={optionKey} {...optionRenderProps}>
                        {renderOptionItem(option, context)}
                    </li>
                )
            }}
            onOpen={(event) => {
                setIsPopupOpen(true)
                if (isRemoteMode && normalizedKeyword.length >= remoteMinKeywordLength) {
                    setIsRemoteLoading(true)
                }
                onOpen?.(event)
            }}
            onClose={(event, reason) => {
                setIsPopupOpen(false)
                setKeyword('')
                setIsRemoteLoading(false)
                abortRemoteRequest()
                onClose?.(event, reason)
            }}
            onChange={(event, nextOption, reason, details) => {
                const nextValue = (
                    nextOption ? getOptionValue(nextOption) : (emptyValue ?? '')
                ) as TValues[TField]

                setValue(name, nextValue)
                setKeyword('')
                if (isRemoteMode) {
                    setIsRemoteLoading(false)
                    abortRemoteRequest()
                }
                if (fieldError !== undefined) {
                    setError(name, null)
                }
                onValueChange?.(nextValue, nextOption)
                onChange?.(event, nextOption, reason, details)
            }}
            onInputChange={(event, nextInputValue, reason) => {
                if (reason === 'input') {
                    setKeyword(nextInputValue)
                    if (isRemoteMode && nextInputValue.trim().length >= remoteMinKeywordLength) {
                        setIsRemoteLoading(true)
                    } else if (isRemoteMode) {
                        setIsRemoteLoading(false)
                    }
                } else {
                    setKeyword('')
                    if (isRemoteMode) {
                        setIsRemoteLoading(false)
                    }
                }

                onInputChange?.(event, nextInputValue, reason)
            }}
            sx={mergedSx}
            renderInput={(params) => (
                <TextField
                    {...params}
                    {...textFieldProps}
                    label={label}
                    name={String(name)}
                    placeholder={placeholder}
                    error={Boolean(fieldError)}
                    helperText={fieldError ?? helperText}
                    required={isRequired}
                    disabled={Boolean(others.disabled)}
                    onFocus={(event) => {
                        setFieldFocus(name)
                        textFieldProps?.onFocus?.(event)
                        onFieldFocus?.()
                    }}
                    onBlur={(event) => {
                        setFieldBlur(name)
                        textFieldProps?.onBlur?.(event)
                        onFieldBlur?.()
                    }}
                />
            )}
        />
    )
}

export const FormDropdown = memo(
    FormDropdownBase,
    areFormDropdownPropsEqual,
) as typeof FormDropdownBase
