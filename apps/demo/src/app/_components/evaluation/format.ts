export function formatAssetClass(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}
