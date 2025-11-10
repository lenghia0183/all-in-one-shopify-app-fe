import {
  RadioButton as PolarisRadioButton,
  LegacyStack,
  InlineError,
} from "@shopify/polaris";
import type { RadioButtonProps as PolarisRadioButtonProps } from "@shopify/polaris";
import { useFormContext, Controller, Path, FieldValues } from "react-hook-form";

interface RadioGroupFieldProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  options: PolarisRadioButtonProps[];
  onChange?: (value: string) => void;
}

export function RadioGroupField<TFormValues extends FieldValues>({
  name,
  options,
  onChange: externalOnChange,
}: RadioGroupFieldProps<TFormValues>) {
  const { control } = useFormContext<TFormValues>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const handleChange = (value: string) => {
          field.onChange(value);
          externalOnChange?.(value);
        };

        return (
          <LegacyStack vertical>
            {options.map((option) => (
              <PolarisRadioButton
                key={option.value}
                {...option}
                name={field.name}
                checked={field.value === option.value}
                onChange={() => handleChange(option.value!)}
              />
            ))}

            {fieldState.invalid && fieldState.error?.message && (
              <InlineError message={fieldState.error.message} fieldID={name} />
            )}
          </LegacyStack>
        );
      }}
    />
  );
}
