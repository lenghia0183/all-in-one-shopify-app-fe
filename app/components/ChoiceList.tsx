import { ChoiceList as PolarisChoiceList } from "@shopify/polaris";
import type { ChoiceListProps as PolarisChoiceListProps } from "@shopify/polaris";
import { useFormContext, Controller, Path, FieldValues } from "react-hook-form";

// Type copied from @shopify/polaris ChoiceList.d.ts
interface PolarisChoice {
  /** Value of the choice */
  value: string;
  /** Label for the choice */
  label: React.ReactNode;
  /** A unique identifier for the choice */
  id?: string;
  /** Disable choice */
  disabled?: boolean;
  /** Additional text to aide in use */
  helpText?: React.ReactNode;
  /** Indicates that the choice is aria-describedBy the error message */
  describedByError?: boolean;
  /**  Method to render children with a choice */
  renderChildren?(isSelected: boolean): React.ReactNode | false;
}

interface ChoiceListProps<TFormValues extends FieldValues>
  extends PolarisChoiceListProps {
  name: Path<TFormValues>;
  choices: PolarisChoice[];
}

export function ChoiceListField<TFormValues extends FieldValues>({
  name,
  choices,
  onChange: externalOnChange,
  ...rest
}: ChoiceListProps<TFormValues>) {
  const { control } = useFormContext<TFormValues>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const handleChange = (selected: string[]) => {
          field.onChange(selected);
          externalOnChange?.(selected, name);
        };

        return (
          <PolarisChoiceList
            {...rest}
            choices={choices.map((choice) => ({
              ...choice,
              renderChildren: () => {
                if (!choice.renderChildren) return undefined;
                return choice.renderChildren(
                  field.value?.includes(choice.value) ?? false,
                );
              },
            }))}
            selected={Array.isArray(field.value) ? field.value : []}
            onChange={handleChange}
            error={fieldState.invalid ? fieldState.error?.message : undefined}
          />
        );
      }}
    />
  );
}
