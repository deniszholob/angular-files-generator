// Ref for naming https://en.wikipedia.org/wiki/Naming_convention_(programming)#Examples_of_multiple-word_identifier_formats

export function log(message: string, ...args: any[]): void {
  const LOG_PREFIX = `==== dzgn ====: `;
  console.log(`${LOG_PREFIX} ${message}`, ...args);
}

/** Ex: my-wonderful-component */
export function normalize(input: string): string {
  return spaceToDash(input.toLocaleLowerCase().trim());
}

/** Ex: My wonderful component */
export function toTitleCase(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

/** Ex: my Wonderful Component */
export function toWordCase(input: string): string {
  return input.replace(/\w\S*/g, toTitleCase);
}

/** Ex: myWonderfulComponent */
export function toCamelCase(input: string): string {
  return input.replace(/[- _]([a-z])/gi, (all, letter) => letter.toUpperCase());
}

/** Ex: my wonderful component */
function dashToSpace(input: string): string {
  return input.replace(/-/g, ' ');
}

/** Ex: my-wonderful-component */
function spaceToDash(input: string): string {
  return input.replace(/\s/g, '-');
}

/** Ex: MyWonderfulComponent */
export function toPascalName(input: string): string {
  return toCamelCase(toTitleCase(input));
}

/** Ex: My Wonderful Component */
export function toReadableName(input: string): string {
  return toWordCase(toTitleCase(dashToSpace(input)));
}
