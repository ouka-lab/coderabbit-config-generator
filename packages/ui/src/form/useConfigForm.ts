import { useForm } from '@formisch/react';
import { configSchema } from '@coderabbit-config/core';

export function useConfigForm() {
  return useForm({ schema: configSchema });
}
