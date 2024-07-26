export enum TemplateType {
  standalone_component = 'standalone_component',
  module_component = 'module_component',
  module = 'module',
  service = 'service',
  component = 'component',
  directive = 'directive',
  pipe = 'pipe',
 route = 'route',
  util = 'util',
  model = 'model',
  enum = 'enum',
}

export const TEMPLATE_TYPE_OPTIONS: TemplateType[] = Object.values(TemplateType);
