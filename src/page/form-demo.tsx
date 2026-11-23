import { Stack } from "@mui/material";
import {
  FormCheckbox,
  FormDropdown,
  FormElement,
  FormEmail,
  FormNumeric,
  FormPeriod,
  FormRadioGroup,
  FormText,
  TextNormal,
  TextSmall,
  TitleLevel1,
  type FormSelectOption,
} from "../component";
import {
  ButtonContained,
  ButtonOutlined,
  ButtonWrapper,
} from "../component/button";
import { useForm, type FormRules } from "../component/form";

type FormValues = {
  name: string;
  email: string;
  age: number;
  birthday: Date | null;
  appointmentAt: string;
  role: string;
  remoteRole: string;
  gender: string;
  acceptPolicy: boolean;
};
type ValidationField = "name" | "email" | "age" | "birthday" | "acceptPolicy";

const validationFieldOrder: ValidationField[] = [
  "name",
  "email",
  "age",
  "birthday",
  "acceptPolicy",
];
const nameMinLength = 2;
const nameMaxLength = 30;
const ageMin = 1;
const ageMax = 120;
const ageStep = 1;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const formDefaultValues = {
  name: "Tony King",
  email: "tony.king@example.com",
  age: 18,
  birthday: new Date(2000, 0, 1),
  appointmentAt: "",
  role: "user",
  remoteRole: "",
  gender: "male",
  acceptPolicy: true,
};
const roleOptions: ReadonlyArray<FormSelectOption> = [
  { value: "user", name: "User" },
  { value: "admin", name: "Admin" },
  { value: "guest", name: "Guest", disabled: true },
] as const;

const remoteRoleDirectory: ReadonlyArray<FormSelectOption> = [
  { value: "frontend-engineer", name: "Frontend Engineer" },
  { value: "backend-engineer", name: "Backend Engineer" },
  { value: "fullstack-engineer", name: "Fullstack Engineer" },
  { value: "mobile-engineer", name: "Mobile Engineer" },
  { value: "devops-engineer", name: "DevOps Engineer" },
  { value: "qa-engineer", name: "QA Engineer" },
  { value: "site-reliability-engineer", name: "Site Reliability Engineer" },
  { value: "cloud-architect", name: "Cloud Architect" },
  { value: "data-engineer", name: "Data Engineer" },
  { value: "data-analyst", name: "Data Analyst" },
  { value: "security-engineer", name: "Security Engineer" },
  { value: "product-manager", name: "Product Manager" },
  { value: "ux-designer", name: "UX Designer" },
] as const;

const emptyRemoteRoleOptions: ReadonlyArray<FormSelectOption> = [];
const remoteSearchDelayMs = 600;

const simulateRemoteRoleSearch = (
  keyword: string,
  context: { signal: AbortSignal },
): Promise<ReadonlyArray<FormSelectOption>> => {
  const normalizedKeyword = keyword.trim().toLowerCase();

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timerId);
      context.signal.removeEventListener("abort", onAbort);
      reject(new Error("Remote search aborted"));
    };

    const timerId = setTimeout(() => {
      context.signal.removeEventListener("abort", onAbort);

      if (context.signal.aborted) {
        reject(new Error("Remote search aborted"));
        return;
      }

      const filteredOptions = remoteRoleDirectory.filter((option) => {
        const optionName = String(option.name ?? "").toLowerCase();
        const optionValue = String(option.value ?? "").toLowerCase();

        return (
          optionName.includes(normalizedKeyword) ||
          optionValue.includes(normalizedKeyword)
        );
      });

      resolve(filteredOptions);
    }, remoteSearchDelayMs);

    context.signal.addEventListener("abort", onAbort);
  });
};

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
    autoComplete: "name",
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
  acceptPolicy: {
    required: {
      value: true,
      message: "Please agree to the policy before submitting.",
    },
  },
};
const submitDelayMs = 1800;

export const FormDemoPage = () => {
  const formStore = useForm<FormValues>({
    defaultValues: { ...formDefaultValues },
    rules: formValidationRules,
  });
  const { values, errors } = formStore;
  const formState = formStore.formState.data;

  const firstErrorField = validationFieldOrder.find((fieldName) =>
    Boolean(errors[fieldName]),
  );
  const firstErrorMessage = firstErrorField
    ? (errors[firstErrorField] ?? null)
    : null;

  const handleSubmit = async () => {
    const submittedValues = {
      name: values.name.trim(),
      email: values.email.trim(),
      age: values.age,
      birthday: values.birthday,
      appointmentAt: values.appointmentAt,
      role: values.role,
      remoteRole: values.remoteRole,
      gender: values.gender,
      acceptPolicy: values.acceptPolicy,
    };
    await new Promise((resolve) => {
      setTimeout(resolve, submitDelayMs);
    });
    console.log("Form submitted data:", submittedValues);
  };

  const handleReset = () => {
    formStore.reset();
  };

  return (
    <FormElement store={formStore} onSubmit={handleSubmit}>
      <TitleLevel1>Personal Information</TitleLevel1>
      <FormText
        store={formStore}
        name="name"
        label="Name"
        helperText="Please enter your full name"
      />
      <TextNormal>Enter your personal information below:</TextNormal>
      <FormEmail
        store={formStore}
        name="email"
        label="Email"
        helperText="Please enter your email address"
      />
      <FormNumeric
        store={formStore}
        name="age"
        label="Age"
        helperText="Please enter your age"
      />
      <TextNormal>Enter your date of birth and appointment time:</TextNormal>
      <FormPeriod
        store={formStore}
        name="birthday"
        label="Birthday"
        storageFormat="js-date"
        format="YYYY-MM-DD"
      />
      <FormPeriod
        store={formStore}
        name="appointmentAt"
        label="Appointment Time"
        format="YYYY-MM-DD HH:mm:ss"
      />
      <FormDropdown
        store={formStore}
        name="role"
        label="Role"
        options={roleOptions}
        valueKey="value"
        labelKey="name"
        renderOptionItem={(_option, context) => (
          <Stack
            direction={"row"}
            sx={{ justifyContent: "space-between", gap: 1 }}
          >
            <TextNormal>{context.label}</TextNormal>
            <TextSmall>{String(context.value ?? "")}</TextSmall>
          </Stack>
        )}
      />
      <FormDropdown
        store={formStore}
        name="remoteRole"
        label="Role (Remote Search)"
        placeholder="Type at least 2 characters"
        options={emptyRemoteRoleOptions}
        valueKey="value"
        labelKey="name"
        remote={{
          search: simulateRemoteRoleSearch,
          debounceMs: 400,
          minKeywordLength: 1,
          minKeywordHint: "Input keyword to start remote search",
        }}
        renderOptionItem={(_option, context) => (
          <Stack
            direction={"row"}
            sx={{ justifyContent: "space-between", gap: 1 }}
          >
            <TextNormal>{context.label}</TextNormal>
            <TextSmall>{String(context.value ?? "")}</TextSmall>
          </Stack>
        )}
      />
      <FormCheckbox
        store={formStore}
        name="acceptPolicy"
        label="I agree to the policy"
        helperText="You must agree to the policy"
      />
      <FormRadioGroup
        store={formStore}
        name="gender"
        label="Gender"
        options={genderOptions}
      />
      {firstErrorMessage && (
        <TextNormal variant="body2" color="error.main">
          {firstErrorMessage}
        </TextNormal>
      )}
      {formState.submitResolved && !firstErrorMessage && (
        <TextNormal variant="body2" color="success.main">
          Form submitted.
        </TextNormal>
      )}
      <ButtonWrapper>
        <ButtonContained
          type="submit"
          disabled={!formState.submittable}
          loading={formState.submitting}
        >
          Submit
        </ButtonContained>
        <ButtonOutlined
          type="reset"
          disabled={formState.submitting}
          onClick={handleReset}
        >
          Reset
        </ButtonOutlined>
      </ButtonWrapper>
    </FormElement>
  );
};
