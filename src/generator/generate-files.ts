///<reference path="../..//node_modules/@types/mustache/index.d.ts" />
import Mustache = require('mustache');
// import * as Mustache from 'mustache';
import * as fs from 'fs';
import * as path from 'path';
import {
  TEMPLATES_FOLDERS,
  TemplateFile,
} from './template-ops/TemplateFolders.model';
import { TemplateVariables } from './template-ops/TemplateVariables.model';
import { TemplateType } from './template-type.enum';
import { log } from '../util/formatter.util';
import {
  getSetting_customTemplateFolder,
  getSetting_generateMock,
  getSetting_generateSpec,
  getSetting_generateStories,
  getSetting_useOnlyCustomTemplates,
} from '../settings';
import {
  getCustomTemplateDir,
  getExtensionTemplateDir,
  getTemplateFilesAndOverride,
} from './template-ops/template-ops';

export interface GeneratorVariables {
  /** Ex: c:/angular-files-generator/out */
  extensionSrcDir: string;
  /** Ex: c:/right/click/dir */
  outputDir: string;
  /** Ex: 'Module' */
  templateType: TemplateType;
  /** Used with TemplateType.custom_type, will otherwise be '' */
  customType: string;
}

export enum GenerationStatus {
  'success' = 'success',
  'filesAlreadyExist' = 'filesAlreadyExist',
  'noTemplatesFound' = 'noTemplatesFound',
}

export interface GenerationResponse {
  status: GenerationStatus;
  filesAlreadyExist: string[];
}

/** Main generator function: Gathers template files and converts to angular files via Mustache.js */
export async function generate(
  templateVariables: TemplateVariables,
  generatorVariables: GeneratorVariables
): Promise<GenerationResponse> {
  log(`Generating into ${generatorVariables.outputDir}`);
  log('Template Variables:', templateVariables);
  log('Generator Variables:', generatorVariables);

  const templates: TemplateFile[] = await getRenderTemplates(
    generatorVariables.extensionSrcDir,
    generatorVariables.templateType
  );
  log('templates:', templates);

  const filteredTemplateFiles: TemplateFile[] = filterTemplates(
    templates,
    generatorVariables.templateType,
    generatorVariables.customType
  );
  log('filteredTemplateFiles:', filteredTemplateFiles);

  // Add a folder to put generated templates into but not for all
  // Some templates are just meant for single files like a model, other like components hav html, ts, spec, stories etc..
  // e.g. clicked-dir/my-component/my-component.component.html
  // e.g. clicked-dir/my-model.model.ts
  const outputPath: string = await genOutputDirIfDoesNotExist(
    generatorVariables.outputDir,
    filteredTemplateFiles.length <= 1 ? '' : templateVariables.dashCaseName
  );

  return await renderTemplates(
    outputPath,
    filteredTemplateFiles,
    templateVariables
  );
}

/**
 * Add named directory if not already in path
 * @returns final output directory
 */
async function genOutputDirIfDoesNotExist(
  outputDir: string,
  dashCaseName: string
): Promise<string> {
  const outputPath: string = path.join(
    outputDir,
    outputDir.includes(dashCaseName) ? '' : dashCaseName
  );
  log(`outputPath ${outputPath}`);
  if (await !fs.existsSync(outputPath)) {
    await fs.promises.mkdir(outputPath);
  }
  return outputPath;
}

/** Combines default and custom templates but overrides the defaults with custom ones */
async function getRenderTemplates(
  extensionSrcDir: string,
  templateType: TemplateType
): Promise<TemplateFile[]> {
  let defaultTemplateFiles: TemplateFile[] = [];

  const useDefaultTemplates: boolean = !getSetting_useOnlyCustomTemplates();

  if (useDefaultTemplates) {
    defaultTemplateFiles = await getTemplateFilesAndOverride(
      [],
      getExtensionTemplateDir(extensionSrcDir, TEMPLATES_FOLDERS.STANDARD)
    );

    // Defaults to basic tests, if 2, replace with TestBed templates
    const templateSpec: number | undefined = getSetting_generateSpec();
    if (templateSpec === 2) {
      defaultTemplateFiles = await getTemplateFilesAndOverride(
        defaultTemplateFiles,
        getExtensionTemplateDir(
          extensionSrcDir,
          TEMPLATES_FOLDERS.SUB_SPEC_TEST_BED
        )
      );
    }

    // Defaults to CSF v3, if 2 replace with CSF v2 templates
    const templateStories: number | undefined = getSetting_generateStories();
    if (templateStories === 2) {
      defaultTemplateFiles = await getTemplateFilesAndOverride(
        defaultTemplateFiles,
        getExtensionTemplateDir(
          extensionSrcDir,
          TEMPLATES_FOLDERS.SUB_STORIES_CSF_V2
        )
      );
    }

    // Standalone component template
    if (templateType === 'standalone_component') {
      defaultTemplateFiles = await getTemplateFilesAndOverride(
        defaultTemplateFiles,
        getExtensionTemplateDir(
          extensionSrcDir,
          TEMPLATES_FOLDERS.SUB_COMPONENT_STANDALONE
        )
      );
    }
    // Module component template
    else if (templateType === 'module_component') {
      defaultTemplateFiles = await getTemplateFilesAndOverride(
        defaultTemplateFiles,
        getExtensionTemplateDir(
          extensionSrcDir,
          TEMPLATES_FOLDERS.SUB_COMPONENT_MODULE
        )
      );
    }
  }

  // User templates always override
  return getTemplateFilesAndOverride(
    defaultTemplateFiles,
    getCustomTemplateDir(getSetting_customTemplateFolder() ?? null)
  );
}

/** @returns Filtered array based on the user selected generator option (component, module service or both component+module) */
function filterTemplates(
  templates: TemplateFile[],
  templateType: TemplateType,
  customType: string
): TemplateFile[] {
  let filteredTemplateFiles: TemplateFile[] = templates.filter(
    (templateFile: TemplateFile): boolean => {
      if (templateType === TemplateType.custom_type) {
        const strippedName: string = templateFile.name
          .replace('.mustache', '')
          .replace('__name__', '');
        const dotSplit: string[] = strippedName.split('.');
        return dotSplit.length > 2
          ? dotSplit.at(1) == customType
          : dotSplit.at(0) == customType;
      }

      if (templateType === TemplateType.module_component) {
        return (
          templateFile.name.includes(TemplateType.module) ||
          templateFile.name.includes(TemplateType.component)
        );
      }

      if (templateType === TemplateType.standalone_component) {
        return templateFile.name.includes(TemplateType.component);
      }

      return templateFile.name.includes(templateType);
    }
  );

  if (!getSetting_generateSpec()) {
    filteredTemplateFiles = filteredTemplateFiles.filter(
      (tf: TemplateFile): boolean => !tf.name.includes('.spec.ts')
    );
  }

  if (!getSetting_generateStories()) {
    filteredTemplateFiles = filteredTemplateFiles.filter(
      (tf: TemplateFile): boolean => !tf.name.includes('.stories.ts')
    );
  }

  if (!getSetting_generateMock()) {
    filteredTemplateFiles = filteredTemplateFiles.filter(
      (tf: TemplateFile): boolean => !tf.name.includes('.mock.ts')
    );
  }

  return filteredTemplateFiles;
}

/** Uses Mustache.js to render each template out */
async function renderTemplates(
  outputPath: string,
  templateFiles: TemplateFile[],
  templateVariables: TemplateVariables
): Promise<GenerationResponse> {
  const filesAlreadyExist: string[] = [];
  const response: GenerationResponse = {
    filesAlreadyExist,
    status: GenerationStatus.noTemplatesFound,
  };

  if (templateFiles.length <= 0) return response;

  // Render each template out
  for (const templateFile of templateFiles) {
    const outputFileName: string = templateFile.name
      .replace('__name__', templateVariables.dashCaseName)
      .replace('.mustache', '');
    const outputFilePath = `${outputPath}/${outputFileName}`;

    // Skip existing files
    if (!fs.existsSync(outputFilePath)) {
      const templateContent: string = await fs.promises.readFile(
        templateFile.path,
        'utf8'
      );

      const renderedTemplate: string = Mustache.render(
        templateContent,
        templateVariables
      );

      // Write the rendered template to a file in the desired output directory
      log(`Writing template to ${outputFilePath}`);
      fs.promises.writeFile(outputFilePath, renderedTemplate, { flag: 'wx' });
    } else {
      filesAlreadyExist.push(outputFileName);
    }
  }

  response.status =
    filesAlreadyExist.length > 0
      ? GenerationStatus.filesAlreadyExist
      : GenerationStatus.success;

  return response;
}
