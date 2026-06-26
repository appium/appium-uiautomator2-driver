export function isCi(): boolean {
  return Boolean(process.env.CI);
}
