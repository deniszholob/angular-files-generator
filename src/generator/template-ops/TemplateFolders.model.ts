import * as path from 'path';
import { ArrayComparator } from '../../util/array.util';

export const TEMPLATES_FOLDERS = {
  STANDARD: 'templates/standard',
  SUB_COMPONENT_MODULE: 'templates/sub_component-module',
  SUB_COMPONENT_STANDALONE: 'templates/sub_component-standalone',
  SUB_SPEC_TEST_BED: 'templates/sub_spec-test-bed',
  SUB_STORIES_CSF_V2: 'templates/sub_stories-CSF-v2',
};

export type TemplateFolder =
  | typeof TEMPLATES_FOLDERS.STANDARD
  | typeof TEMPLATES_FOLDERS.SUB_COMPONENT_MODULE
  | typeof TEMPLATES_FOLDERS.SUB_COMPONENT_STANDALONE
  | typeof TEMPLATES_FOLDERS.SUB_SPEC_TEST_BED
  | typeof TEMPLATES_FOLDERS.SUB_STORIES_CSF_V2;

export class TemplateFile {
  public path: string;
  constructor(public name: string, rootPath: string) {
    this.path = path.join(rootPath, name);
  }
}

export interface Templates {
  templatesPath: string;
  templateFiles: string[];
}

export const comparatorTemplateFile: ArrayComparator<TemplateFile> = (a, b) =>
  a.name === b.name;
