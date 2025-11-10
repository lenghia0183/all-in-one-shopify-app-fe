import {
  Checkbox as PolarisCheckbox,
  CheckboxProps as PolarisCheckboxProps,
} from "@shopify/polaris";
import { useFormContext, Controller, Path, FieldValues } from "react-hook-form";

interface CheckboxFieldProps<TFormValues extends FieldValues>
  extends Omit<PolarisCheckboxProps, "checked"> {
  name: Path<TFormValues>;
}

export function CheckboxField<TFormValues extends FieldValues>({
  name,
  onChange: externalOnChange,
  ...rest
}: CheckboxFieldProps<TFormValues>) {
  const { control } = useFormContext<TFormValues>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const handleChange = (checked: boolean, id: string) => {
          field.onChange(checked);
          externalOnChange?.(checked, id);
        };

        return (
          <PolarisCheckbox
            {...rest}
            checked={!!field.value}
            onChange={handleChange}
          />
        );
      }}
    />
  );
}
