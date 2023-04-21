// Ref for naming https://en.wikipedia.org/wiki/Naming_convention_(programming)#Examples_of_multiple-word_identifier_formats

export function log(message: string, ...args: any[]): void {
  const LOG_PREFIX = `==== dzgn ====: `;
  console.log(`${LOG_PREFIX} ${message}`, ...args);
}

export function arrayToStingList({
  arr,
  delimiter = '',
  prefix = '',
}: {
  arr: string[];
  delimiter?: string;
  prefix?: string;
}): string {
  return arr.length > 0
    ? `${prefix}${arr.reduce(
        (acc, curr) => `${acc.trim()}${delimiter}${prefix}${curr.trim()}`
      )}`
    : '';
}

/** Ex: my-wonderful-component */
export function toDashCaseName(input: string): string {
  return spaceToDash(input.toLocaleLowerCase().trim());
}

/** Ex: MyWonderfulComponent */
export function toUpperCamelCaseName(input: string): string {
  return toCamelCase(toTitleCase(input));
}

/** Ex: My Wonderful Component */
export function toUpperReadableName(input: string): string {
  return toWordCase(toTitleCase(dashToSpace(input)));
}

/** Ex: MY_WONDERFUL_COMPONENT */
export function toConstantCaseName(input: string): string {
  return dashToUnderscore(input.toUpperCase());
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

/** Ex: my-wonderful-component */
function spaceToDash(input: string): string {
  return input.replace(/\s/g, '-');
}

/** Ex: my wonderful component */
function dashToSpace(input: string): string {
  return input.replace(/-/g, ' ');
}

/** Ex: my_wonderful_component */
function dashToUnderscore(input: string): string {
  return input.replace(/-/g, '_');
}
