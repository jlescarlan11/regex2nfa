// components/ErrorAlert.tsx
"use client";
import React from "react";
import { Callout } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface ErrorAlertProps {
  error: string | null;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
  if (!error) {
    return null;
  }

  return (
    <Callout.Root color="red" role="alert" highContrast>
      <Callout.Icon>
        <ExclamationTriangleIcon />
      </Callout.Icon>
      <Callout.Text>{error}</Callout.Text>
    </Callout.Root>
  );
};

export default ErrorAlert;
