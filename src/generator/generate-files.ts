///<reference path="../..//node_modules/@types/mustache/index.d.ts" />
import Mustache = require('mustache');
// import * as Mustache from 'mustache';
import * as fs from 'fs';
import * as path from 'path';
import { log } from './formatter';
import { NgFileType } from './angular-file-type.model';

export interface TemplateVariables {
  /** Ex: my-component */
  inputName: string;
  /** Ex: MyComponent */
  upperName: string;
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

export const TEMPLATES_FOLDER = 'templates';

export async function generate(
  templateVariables: TemplateVariables
): Promise<void> {
  log(`Generating into ${templateVariables.outputDir}`);
  log('Template Variables:', templateVariables);

  const templatesPath: string = path.join(
    templateVariables.extensionRoot,
    TEMPLATES_FOLDER
  );
  log(`templatesPath ${templatesPath}`);

  // Add named directory if not already in path
  const outputPath: string = path.join(
    templateVariables.outputDir,
    templateVariables.outputDir.includes(templateVariables.inputName)
      ? ''
      : templateVariables.inputName
  );
  log(`outputPath ${outputPath}`);

  if (await !fs.existsSync(outputPath)) {
    await fs.promises.mkdir(outputPath);
  }

  const templateFiles: string[] = await fs.promises.readdir(templatesPath);
  log(`Template files`, templateFiles);

  const filteredTemplateFiles: string[] = templateFiles.filter(
    (templateFile) => {
      return templateVariables.resourceType === 'module'
        ? templateFile.includes('module') || templateFile.includes('component')
        : templateFile.includes(templateVariables.resourceType);
    }
  );

  for (const templateFile of filteredTemplateFiles) {
    const outputFileName: string = templateFile
      .replace('__name__', templateVariables.inputName)
      .replace('.mustache', '');
    const outputFilePath = `${outputPath}/${outputFileName}`;

    if (await !fs.existsSync(outputFileName)) {
      const templateContent: string = await fs.promises.readFile(
        `${templatesPath}/${templateFile}`,
        'utf8'
      );

      const renderedTemplate: string = Mustache.render(
        templateContent,
        templateVariables
      );

      // write the rendered template to a file in the desired output directory

      log(`Writing template to ${outputFilePath}`);
      fs.promises.writeFile(outputFilePath, renderedTemplate, {
        flag: 'wx',
      });
    }
  }
}
