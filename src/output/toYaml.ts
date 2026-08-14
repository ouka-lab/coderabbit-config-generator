import { stringify } from 'yaml';

// Modeline understood by the "YAML Language Support by Red Hat" VS Code
// extension; it points the editor at the CodeRabbit schema for validation.
export const SCHEMA_MODELINE
  = '# yaml-language-server: $schema=https://www.coderabbit.ai/integrations/schema.v2.json';

export function withSchemaModeline(body: string): string {
  return `${SCHEMA_MODELINE}\n${body}`;
}

export function toYaml(config: unknown): string {
  if (
    config === undefined
    || (config
      && typeof config === 'object'
      && !Array.isArray(config)
      && Object.keys(config).length === 0)
  ) {
    return '';
  }
  return stringify(config, { indent: 2, lineWidth: 0 });
}
