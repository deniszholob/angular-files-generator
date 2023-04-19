import { NgFileType } from './angular-file-type.model';

export interface TemplateVariables {
  /** Ex: app */
  componentPrefix: string;
  /** Ex: my-component */
  dashCaseName: string;
  /** Ex: MyComponent */
  upperCamelCaseName: string;
  /** Ex: MY_COMPONENT */
  constantCaseName: string;
  /** Ex: My Component */
  upperReadableName: string;
  /** Ex: c:/out */
  extensionRoot: string;
  /** Ex: c:/right/click/dir */
  outputDir: string;
  /** Ex: 'Module' */
  resourceType: NgFileType;
}
