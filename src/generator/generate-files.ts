///<reference path="../..//node_modules/@types/mustache/index.d.ts" />
import Mustache = require('mustache');
// import * as Mustache from 'mustache';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { TemplateVariables } from './TemplateVariables.model';
import { NgFileType } from './angular-file-type.model';
import { log } from './formatter';
import {
  getSetting_customTemplateFolder,
  getSetting_generateSpec,
  getSetting_generateStories,
} from './settings';
import {
  ArrayComparator,
  arrayDifference,
  arrayIntersection,
} from './array-functions';

export const TEMPLATES_FOLDER = 'templates';
export interface GeneratorVariables {
  /** Ex: c:/angular-files-generator/out */
  extensionSrcDir: string;
  /** Ex: c:/right/click/dir */
  outputDir: string;
  /** Ex: 'Module' */
  ngFileType: NgFileType;
}

class TemplateFile {
  public path: string;
  constructor(public name: string, rootPath: string) {
    this.path = path.join(rootPath, name);
  }
}

interface Templates {
  templatesPath: string;
  templateFiles: string[];
}

/** Main generator function: Gathers template files and converts to angular files via Mustache.js */
export async function generate(
  templateVariables: TemplateVariables,
  generatorVariables: GeneratorVariables
): Promise<string[]> {
  log(`Generating into ${generatorVariables.outputDir}`);
  log('Template Variables:', templateVariables);
  log('Generator Variables:', generatorVariables);

  const templates: TemplateFile[] = await getRenderTemplates(
    generatorVariables.extensionSrcDir
  );
  log('templates:', templates);
  const outputPath: string = await genOutputDirIfDoesNotExist(
    generatorVariables.outputDir,
    templateVariables.dashCaseName
  );
  const filteredTemplateFiles: TemplateFile[] = filterTemplates(
    templates,
    generatorVariables.ngFileType
  );
  log('filteredTemplateFiles:', filteredTemplateFiles);

  return await renderTemplates(
    outputPath,
    filteredTemplateFiles,
    templateVariables
  );
}

/** @returns extension's default templates */
async function getExtensionTemplates(
  extensionSrcDir: string
): Promise<Templates> {
  log('extensionSrcDir:', extensionSrcDir);
  const templatesPath: string = path.join(extensionSrcDir, TEMPLATES_FOLDER);
  log('templatesPath:', templatesPath);
  const templateFiles: string[] = await fs.promises.readdir(templatesPath);
  return { templateFiles, templatesPath };

  // return templateFiles.map((f) => new TemplateFile(f, templatesPath));
}

/** @returns user's custom templates */
async function getCustomTemplates(): Promise<Templates | undefined> {
  const customTemplatesFolderName: string | null | undefined =
    getSetting_customTemplateFolder();
  const workspaceRoot: string | undefined =
    vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  const templatesPath: string | undefined =
    workspaceRoot && customTemplatesFolderName
      ? path.join(workspaceRoot, customTemplatesFolderName)
      : undefined;

  if (!(templatesPath && fs.existsSync(templatesPath))) return undefined;

  const templateFiles: string[] = await fs.promises.readdir(templatesPath);
  return { templateFiles, templatesPath };
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

/** Object conversion */
function templatesToTemplateFiles(templates: Templates): TemplateFile[] {
  return templates.templateFiles.map(
    (f) => new TemplateFile(f, templates.templatesPath)
  );
}

/** Combines default and custom templates but overrides the defaults with custom ones */
async function getRenderTemplates(
  extensionSrcDir: string
): Promise<TemplateFile[]> {
  const defaultTemplates: Templates = await getExtensionTemplates(
    extensionSrcDir
  );
  const customTemplates: Templates | undefined = await getCustomTemplates();
  const defaultTemplateFiles: TemplateFile[] =
    templatesToTemplateFiles(defaultTemplates);

  if (!customTemplates) return defaultTemplateFiles;

  // Override and extra template Logic
  const customTemplateFiles: TemplateFile[] =
    templatesToTemplateFiles(customTemplates);

  const comparator: ArrayComparator<TemplateFile> = (a, b) => a.name === b.name;
  // Default Templates that do not have a corresponding user override
  const nonOverridableDefaultTemplateFiles: TemplateFile[] = arrayDifference(
    defaultTemplateFiles,
    customTemplateFiles,
    comparator
  );
  // Templates that need to be overridden
  const overrideTemplateFiles: TemplateFile[] = arrayIntersection(
    customTemplateFiles,
    defaultTemplateFiles,
    comparator
  );
  // Custom Templates that do not have a corresponding default template
  const extraCustomTemplateFiles: TemplateFile[] = arrayDifference(
    customTemplateFiles,
    defaultTemplateFiles,
    comparator
  );

  return [
    ...nonOverridableDefaultTemplateFiles,
    ...overrideTemplateFiles,
    ...extraCustomTemplateFiles,
  ];
}

/** @returns Filtered array based on the user selected generator option (component, module service or both component+module) */
function filterTemplates(
  templates: TemplateFile[],
  ngFileType: NgFileType
): TemplateFile[] {
  let filteredTemplateFiles: TemplateFile[] = templates.filter(
    (templateFile) => {
      return ngFileType === 'module'
        ? templateFile.name.includes('module') ||
            templateFile.name.includes('component')
        : templateFile.name.includes(ngFileType);
    }
  );

  if (!getSetting_generateSpec()) {
    filteredTemplateFiles = filteredTemplateFiles.filter(
      (tf) => !tf.name.includes('.spec.ts')
    );
  }

  if (!getSetting_generateStories()) {
    filteredTemplateFiles = filteredTemplateFiles.filter(
      (tf) => !tf.name.includes('.stories.ts')
    );
  }
  return filteredTemplateFiles;
}

/** Uses Mustache.js to render each template out */
async function renderTemplates(
  outputPath: string,
  templateFiles: TemplateFile[],
  templateVariables: TemplateVariables
): Promise<string[]> {
  const filesAlreadyExist: string[] = [];
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
  return filesAlreadyExist;
}
