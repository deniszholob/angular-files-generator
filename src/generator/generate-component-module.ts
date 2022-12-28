///<reference path="../..//node_modules/@types/mustache/index.d.ts" />
import Mustache = require('mustache');
// import * as Mustache from 'mustache';
import * as fs from 'fs';
import * as path from 'path';
import { ResourceType } from '../editor';
import { log } from '../formatter';

export interface TemplateVariables {
  /** Ex: my-component */
  inputName: string;
  /** Ex: MyComponent */
  upperName: string;
  /** Ex: app */
  cmpSelector: string;
  /** c:/src */
  extensionRoot: string;
  /** Ex:  */
  outputDir: string;
  resourceType: ResourceType;
}

export const TEMPLATES_FOLDER = 'templates';

export async function generate(
  templateVariables: TemplateVariables
): Promise<void> {
  log(`Generating into ${templateVariables.outputDir}`);

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
    const templateContent: string = await fs.promises.readFile(
      `${templatesPath}/${templateFile}`,
      'utf8'
    );

    const renderedTemplate: string = Mustache.render(
      templateContent,
      templateVariables
    );

    const outputFileName: string = templateFile
      .replace('__name__', templateVariables.inputName)
      .replace('.mustache', '');

    // write the rendered template to a file in the desired output directory
    const outputFilePath = `${outputPath}/${outputFileName}`;

    log(`Writing template to ${outputFilePath}`);
    await fs.promises.writeFile(outputFilePath, renderedTemplate);
  }
}
