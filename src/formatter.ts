export function toCamelCase(input: string): string {
  return input.replace(/-([a-z])/gi, (all, letter) => letter.toUpperCase());
}

export function toTileCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

export function toUpperCase(input: string): string {
  return toCamelCase(input.charAt(0).toUpperCase() + input.slice(1));
}

export function log(message: string, ...args: any[]): void {
  const LOG_PREFIX = `=== dz-ng-fl-gn ===`;
  console.log(`${LOG_PREFIX} ${message}`, ...args);
}
