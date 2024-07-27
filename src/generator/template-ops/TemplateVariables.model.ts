export interface TemplateVariables {
  /** Ex: app */
  componentPrefix: string;
  /** Ex: my-component */
  dashCaseName: string;
  /** Ex: myComponent */
  camelCaseName: string;
  /** Ex: MyComponent */
  upperCamelCaseName: string;
  /** Ex: MY_COMPONENT */
  constantCaseName: string;
  /** Ex: My Component */
  upperReadableName: string;
  type: string;
}
