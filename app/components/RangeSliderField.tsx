import {
  RangeSlider as PolarisRangeSlider,
  RangeSliderProps,
} from "@shopify/polaris";
import { useFormContext, Controller, Path, FieldValues } from "react-hook-form";

interface RangeSliderFieldProps<TFormValues extends FieldValues>
  extends RangeSliderProps {
  name: Path<TFormValues>;
}

export function RangeSliderField<TFormValues extends FieldValues>({
  name,
  onChange: externalOnChange,
  ...rest
}: RangeSliderFieldProps<TFormValues>) {
  const { control } = useFormContext<TFormValues>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const handleChange = (value: number, id: string) => {
          field.onChange(value);
          externalOnChange?.(value, id);
        };

        return (
          <PolarisRangeSlider
            {...rest}
            value={field.value ?? rest.min ?? 0}
            onChange={handleChange}
          />
        );
      }}
    />
  );
}
