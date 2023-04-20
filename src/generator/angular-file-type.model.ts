export const NG_FILE_TYPE = {
  module: 'module',
  service: 'service',
  component: 'component',
  directive: 'directive',
  pipe: 'pipe',
  route: 'route',
} as const;

export const NG_FILE_TYPES: NgFileType[] = Object.keys(
  NG_FILE_TYPE
) as NgFileType[];

export type NgFileType = keyof typeof NG_FILE_TYPE;
