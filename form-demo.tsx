import { CircularProgress } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import {
  FormCheckbox,
  FormDigital,
  FormElement,
  FormEmail,
  FormNumeric,
  FormPeriod,
  FormRadioGroup,
  FormSelect,
  FormText,
  TextNormal,
  TitleLevel1,
} from "./src/component";
import {
  ButtonContained,
  ButtonOutlined,
  ButtonWrapper,
} from "./src/component/button";
import { useForm, type FormRules } from "./src/component/form";
import { DATE_TIME_FORMAT } from "./constant";

type FormValues = {
  name: string;
  email: string;
  ageDigits: string;
  age: number | null;
  birthday: Date | null;
  datetime: Date | null;
  role: string;
  gender: string;
  acceptPolicy: boolean;
};

type ValidationField = keyof FormValues;

const validationFieldOrder: ValidationField[] = [
  "name",
  "email",
  "age",
  "birthday",
  "datetime",
  "acceptPolicy",
];
const nameMinLength = 3;
const nameMaxLength = 30;
const ageMin = 1;
const ageMax = 120;
const ageStep = 1;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formDefaultValues: FormValues = {
  name: "Tony King",
  email: "tony.king@example.com",
  ageDigits: "18",
  age: 18,
  birthday: new Date(2000, 0, 1),
  datetime: new Date(2026, 0, 1, 12, 0, 0),
  role: "user",
  gender: "male",
  acceptPolicy: true,
};

const roleOptions = [
  { id: "user", name: "User", enabled: true },
  { id: "admin", name: "Admin", enabled: true },
  { id: "guest", name: "Guest", enabled: false },
] as const;

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

const formValidationRules: FormRules<FormValues> = {
  name: {
    required: { value: true, message: "Name is required." },
    minLength: {
      value: nameMinLength,
      message: `Name must be between ${String(nameMinLength)} and ${String(nameMaxLength)} characters.`,
    },
    maxLength: {
      value: nameMaxLength,
      message: `Name must be between ${String(nameMinLength)} and ${String(nameMaxLength)} characters.`,
    },
  },
  email: {
    required: { value: true, message: "Email is required." },
    pattern: {
      value: emailPattern,
      message: "Please enter a valid email address.",
    },
    autoComplete: "email",
    inputMode: "email",
  },
  age: {
    required: { value: true, message: "Age is required." },
    min: {
      value: ageMin,
      message: `Age must be an integer between ${String(ageMin)} and ${String(ageMax)}.`,
    },
    max: {
      value: ageMax,
      message: `Age must be an integer between ${String(ageMin)} and ${String(ageMax)}.`,
    },
    validate: (value) => {
      const numberValue = Number(value);
      if (!Number.isInteger(numberValue)) {
        return `Age must be an integer between ${String(ageMin)} and ${String(ageMax)}.`;
      }
      return true;
    },
    step: ageStep,
    inputMode: "numeric",
  },
  birthday: { required: { value: true, message: "Birthday is required." } },
  datetime: {
    required: { value: true, message: "Date and Time is required." },
  },
  role: {
    required: { value: true, message: "Role is required." },
    filter: (option, context) =>
      option.value !== "guest" && context.options.length > 0,
    keywordFilter: true,
    keywordFilterPlaceholder: "Filter role by keyword",
  },
  acceptPolicy: {
    required: {
      value: true,
      message: "Please agree to the policy before submitting.",
    },
  },
};

const formId = "form-demo";
const submitDelayMs = 1800;

const createInitialFormValues = (): FormValues => ({ ...formDefaultValues });

const FormActions = ({
  onReset,
  submitting,
}: {
  onReset: () => void;
  submitting: boolean | undefined;
}) => {
  const loading = submitting;
  return (
    <ButtonWrapper>
      <ButtonContained
        type="submit"
        disabled={loading}
        startIcon={
          loading ? <CircularProgress size={14} color="inherit" /> : undefined
        }
      >
        Submit
      </ButtonContained>
      <ButtonOutlined type="reset" disabled={loading} onClick={onReset}>
        Reset
      </ButtonOutlined>
    </ButtonWrapper>
  );
};

export const FormDemoPage = observer(() => {
  const formStore = useForm<FormValues>({
    defaultValues: createInitialFormValues(),
    rules: formValidationRules,
  });
  const { values } = formStore;
  const { submitResolved, submitting } = formStore.formState.data;

  const firstErrorField = validationFieldOrder.find((fieldName) =>
    Boolean(formStore.errors[fieldName]),
  );
  const firstErrorMessage = firstErrorField
    ? formStore.errors[firstErrorField]
    : null;

  useEffect(() => {
    return formStore.formValue.subscribe(() => {
      formStore.formState.set({ submitResolved: false });
    });
  }, [formStore.formValue]);

  const handleSubmit = async () => {
    const submittedValues = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
    };
    console.log("Form submitted data:", submittedValues);
    await new Promise<void>((resolve) => setTimeout(resolve, submitDelayMs));
  };

  return (
    <FormElement
      id={formId}
      spacing={2}
      store={formStore}
      onSubmit={handleSubmit}
    >
      <TitleLevel1 variant="h4">Form Demo</TitleLevel1>
      <FormText store={formStore} name="name" label="Name" />
      <FormEmail store={formStore} name="email" label="Email" />
      <FormDigital store={formStore} name="ageDigits" label="Age (Digits)" />
      <FormNumeric store={formStore} name="age" label="Age" />
      <FormPeriod store={formStore} name="birthday" label="Birthday" />
      <FormPeriod
        store={formStore}
        name="datetime"
        label="Date and Time"
        format={DATE_TIME_FORMAT}
      />
      <FormSelect
        store={formStore}
        name="role"
        label="Role"
        options={roleOptions.map((option) => ({
          value: option.id,
          label: option.name,
          disabled: !option.enabled,
        }))}
      />
      <FormCheckbox
        store={formStore}
        name="acceptPolicy"
        label="I agree to the policy"
      />
      <FormRadioGroup
        store={formStore}
        name="gender"
        label="Gender"
        options={genderOptions}
      />
      <FormActions
        submitting={submitting}
        onReset={() => {
          formStore.reset();
        }}
      />
      {firstErrorMessage && (
        <TextNormal variant="body2" color="error.main">
          {firstErrorMessage}
        </TextNormal>
      )}
      {submitResolved && !firstErrorMessage && (
        <TextNormal variant="body2" color="success.main">
          Form submitted.
        </TextNormal>
      )}
    </FormElement>
  );
});
