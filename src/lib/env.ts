export function requiredEnv(name: string, value: string | undefined): string {
  if (typeof value === 'string' && value.length > 0) return value;
  throw new Error(`Missing required env var: ${name}`);
}

export function optionalEnv(value: string | undefined): string | undefined {
  if (typeof value === 'string' && value.length > 0) return value;
  return undefined;
}
