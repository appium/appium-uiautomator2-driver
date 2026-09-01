export function isCi(): boolean {
  return Boolean(process.env.CI);
}

export function isCiApiLevel(apiLevel: number): boolean {
  return isCi() && process.env.E2E_API_LEVEL === String(apiLevel);
}
