import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  Button,
  Text,
  BlockStack,
  Box,
  InlineStack,
  LegacyCard,
} from "@shopify/polaris";
import { useForm, FormProvider } from "react-hook-form";

import { authenticate } from "../shopify.server";
import { TextFiled } from "../components/TextField";
import { CheckboxField } from "../components/ChecBoxField"; // Note the typo in the filename
import { RadioGroupField } from "../components/RadioGroupField";
import { ChoiceListField } from "../components/ChoiceListField";
import { RangeSliderField } from "../components/RangeSliderField";

// Define the form data type
interface FormData {
  name: string;
  email: string;
  subscribe: boolean;
  gender: string;
  interests: string[];
  satisfaction: number;
  plan: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function ComponentsDemo() {
  const { apiKey } = useLoaderData<typeof loader>();

  // Initialize React Hook Form
  const methods = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      subscribe: false,
      gender: "",
      interests: [],
      satisfaction: 50,
      plan: "basic",
    },
  });

  const { handleSubmit, reset, watch } = methods;

  // Watch form values for live preview
  const formData = watch();

  // Handle form submission
  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    alert(`Form submitted!\nCheck console for details.`);
  };

  // Handle form reset
  const handleReset = () => {
    reset();
  };

  return (
    <AppProvider embedded apiKey={apiKey}>
      <Page
        title="Form Components Demo"
        backAction={{ content: "Home", url: "/app" }}
      >
        <BlockStack gap="500">
          <Layout>
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    All Form Components Working Together
                  </Text>
                  <Text as="p">
                    This page demonstrates all the custom form components
                    working with React Hook Form.
                  </Text>

                  <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <FormLayout>
                        {/* Text Fields */}
                        <FormLayout.Group>
                          <TextFiled<FormData>
                            name="name"
                            label="Full Name"
                            placeholder="Enter your full name"
                            autoComplete="name"
                          />
                        </FormLayout.Group>

                        <FormLayout.Group>
                          <TextFiled<FormData>
                            name="email"
                            label="Email Address"
                            placeholder="Enter your email"
                            autoComplete="email"
                            type="email"
                          />
                        </FormLayout.Group>

                        {/* Checkbox */}
                        <FormLayout.Group>
                          <CheckboxField<FormData>
                            name="subscribe"
                            label="Subscribe to newsletter"
                          />
                        </FormLayout.Group>

                        {/* Radio Group */}
                        <LegacyCard sectioned>
                          <FormLayout>
                            <Text variant="headingSm" as="legend">
                              Gender
                            </Text>
                            <RadioGroupField<FormData>
                              name="gender"
                              options={[
                                { label: "Male", value: "male" },
                                { label: "Female", value: "female" },
                                { label: "Other", value: "other" },
                              ]}
                            />
                          </FormLayout>
                        </LegacyCard>

                        {/* Choice List */}
                        <LegacyCard sectioned>
                          <FormLayout>
                            <Text variant="headingSm" as="legend">
                              Interests
                            </Text>
                            <ChoiceListField<FormData>
                              name="interests"
                              choices={[
                                { label: "Technology", value: "tech" },
                                { label: "Sports", value: "sports" },
                                { label: "Music", value: "music" },
                                { label: "Travel", value: "travel" },
                                { label: "Food", value: "food" },
                              ]}
                              title=""
                              selected={[]}
                              allowMultiple
                            />
                          </FormLayout>
                        </LegacyCard>

                        {/* Range Slider */}
                        <LegacyCard sectioned>
                          <FormLayout>
                            <Text variant="headingSm" as="legend">
                              Satisfaction Level
                            </Text>
                            <RangeSliderField<FormData>
                              name="satisfaction"
                              min={0}
                              max={100}
                              step={1}
                              output
                              label=""
                              value={50}
                              onChange={() => {}}
                            />
                          </FormLayout>
                        </LegacyCard>

                        {/* Choice List for Plan Selection */}
                        <LegacyCard sectioned>
                          <FormLayout>
                            <Text variant="headingSm" as="legend">
                              Subscription Plan
                            </Text>
                            <ChoiceListField<FormData>
                              name="plan"
                              choices={[
                                {
                                  label: "Basic Plan - $9/month",
                                  value: "basic",
                                },
                                {
                                  label: "Premium Plan - $19/month",
                                  value: "premium",
                                },
                                {
                                  label: "Enterprise Plan - $49/month",
                                  value: "enterprise",
                                },
                              ]}
                              title=""
                              selected={[]}
                            />
                          </FormLayout>
                        </LegacyCard>

                        {/* Action Buttons */}
                        <InlineStack gap="300" align="end">
                          <Button onClick={handleReset} variant="secondary">
                            Reset Form
                          </Button>
                          <Button submit variant="primary">
                            Submit Form
                          </Button>
                        </InlineStack>
                      </FormLayout>
                    </form>
                  </FormProvider>
                </BlockStack>
              </Card>
            </Layout.Section>

            {/* Preview Section */}
            <Layout.Section variant="oneThird">
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    Form Data Preview
                  </Text>
                  <Box padding="400" background="bg-surface-active">
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        margin: 0,
                        fontSize: "0.9em",
                      }}
                    >
                      {JSON.stringify(formData, null, 2)}
                    </pre>
                  </Box>
                  <Text variant="bodySm" as="p" tone="subdued">
                    This panel shows the live form data as you interact with the
                    form components.
                  </Text>
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        </BlockStack>
      </Page>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
