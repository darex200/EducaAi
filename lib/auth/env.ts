export function cleanEnvValue(value?: string) {
  if (!value) return "";
  return value.trim().replace(/^["']|["']$/g, "");
}
