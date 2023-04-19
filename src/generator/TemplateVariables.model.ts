import { NgFileType } from './angular-file-type.model';

export interface TemplateVariables {
  /** Ex: my-component */
  inputName: string;
  /** Ex: MyComponent */
  pascalName: string;
  /** Ex: My Component */
  readableName: string;
  /** Ex: app */
  cmpSelector: string;
  /** Ex: c:/out */
  extensionRoot: string;
  /** Ex: c:/right/click/dir */
  outputDir: string;
  /** Ex: 'Module' */
  resourceType: NgFileType;
}
