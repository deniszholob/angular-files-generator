export const TEMPLATE_TYPE = {
  componentHtml: '__name__.component.html.template',
  componentSpec: '__name__.component.spec.ts.template',
  componentStories: '__name__.component.stories.ts.template',
  componentTs: '__name__.component.ts.template',
  moduleSpec: '__name__.module.spec.ts.template',
  moduleTs: '__name__.module.ts.template',
  serviceSpec: '__name__.service.spec.ts.template',
  serviceTs: '__name__.service.ts.template',
} as const;

export type TemplateType = keyof typeof TEMPLATE_TYPE;
