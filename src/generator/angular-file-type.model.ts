export const NG_FILE_TYPE = {
  standalone_component: 'standalone_component',
  module_component: 'module_component',
  module: 'module',
  service: 'service',
  component: 'component',
  directive: 'directive',
  pipe: 'pipe',
  route: 'route',
  util: 'util',
  model: 'model',
  enum: 'enum',
} as const;

export const NG_FILE_TYPES: NgFileType[] = Object.keys(
  NG_FILE_TYPE
) as NgFileType[];

export type NgFileType = keyof typeof NG_FILE_TYPE;
