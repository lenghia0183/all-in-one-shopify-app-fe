import { TextField as PolarisTextField } from "@shopify/polaris";
import type { TextFieldProps as PolarisTextFieldProps } from "@shopify/polaris";
import { useFormContext, Controller, Path, FieldValues } from "react-hook-form";

type TextFiledProps<TFormValues> = PolarisTextFieldProps & {
  name: Path<TFormValues>;
  allow?: RegExp;
  onChange?: (value: string, id: string) => void;
  onBlur?(event?: React.FocusEvent): void;
};

export function TextFiled<TFormValues extends FieldValues>({
  name,
  allow,
  onChange: externalOnChange,
  onBlur: externalOnBlur,
  ...rest
}: TextFiledProps<TFormValues>) {
  const { control } = useFormContext<TFormValues>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const handleChange = (value: string, id: string) => {
          let newValue = value;

          if (allow) {
            newValue = newValue.replace(allow, "");
          }

          field.onChange(newValue);
          externalOnChange?.(newValue, id);
        };

        const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
          field.onBlur();
          externalOnBlur?.(event);
        };

        return (
          <PolarisTextField
            {...field}
            {...rest}
            value={field.value ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldState.invalid ? fieldState.error?.message : undefined}
          />
        );
      }}
    />
  );
}
