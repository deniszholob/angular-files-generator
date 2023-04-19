///<reference path="../..//node_modules/@types/mustache/index.d.ts" />
import Mustache = require('mustache');
// import * as Mustache from 'mustache';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { TemplateVariables } from './TemplateVariables.model';
import { log } from './formatter';

interface TemplateFile {
  name: string;
  path: string;
}

export const TEMPLATES_FOLDER = 'templates';

export async function generate(
  templateVariables: TemplateVariables
): Promise<void> {
  log(`Generating into ${templateVariables.outputDir}`);
  log('Template Variables:', templateVariables);

  // Default Template Dir
  const defaultTemplatesPath: string = path.join(
    templateVariables.extensionRoot,
    TEMPLATES_FOLDER
  );
  log(`defaultTemplatesPath ${defaultTemplatesPath}`);
  const defaultTemplateFiles: string[] = await fs.promises.readdir(
    defaultTemplatesPath
  );
  log(`defaultTemplateFiles`, defaultTemplateFiles);

  // Custom Template Dir
  // From package.json/contributes/configuration/properties
  const customTemplatesFolder: string | null | undefined = vscode.workspace
    .getConfiguration('angular-files-generator')
    .get('customTemplateFolder');
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  log(`workspaceRoot `, workspaceRoot);
  const customTemplatesPath =
    workspaceRoot && customTemplatesFolder
      ? path.join(workspaceRoot, customTemplatesFolder)
      : undefined;
  log(`customTemplatesPath ${customTemplatesPath}`);
  const customTemplateFiles: string[] =
    customTemplatesPath && fs.existsSync(customTemplatesPath)
      ? await fs.promises.readdir(customTemplatesPath)
      : [];
  log(`customTemplateFiles`, customTemplateFiles);

  // Add named directory if not already in path
  const outputPath: string = path.join(
    templateVariables.outputDir,
    templateVariables.outputDir.includes(templateVariables.dashCaseName)
      ? ''
      : templateVariables.dashCaseName
  );
  log(`outputPath ${outputPath}`);
  if (await !fs.existsSync(outputPath)) {
    await fs.promises.mkdir(outputPath);
  }

  // If there is a custom template use it, otherwise use the default
  const templateFiles: TemplateFile[] = defaultTemplateFiles.map(
    (defaultFileName: string): TemplateFile => {
      const customFileName: string | undefined = customTemplateFiles.find(
        (customFile) => customFile === defaultFileName
      );
      return {
        name: customFileName ?? defaultFileName,
        path:
          customFileName && customTemplatesPath
            ? path.join(customTemplatesPath, customFileName)
            : path.join(defaultTemplatesPath, defaultFileName),
      };
    }
  );

  // Filter based on the user selected generator option (component, module service or both component+module)
  const filteredTemplateFiles: TemplateFile[] = templateFiles.filter(
    (templateFile) => {
      return templateVariables.resourceType === 'module'
        ? templateFile.name.includes('module') ||
            templateFile.name.includes('component')
        : templateFile.name.includes(templateVariables.resourceType);
    }
  );

  // Render each template out
  for (const templateFile of filteredTemplateFiles) {
    const outputFileName: string = templateFile.name
      .replace('__name__', templateVariables.dashCaseName)
      .replace('.mustache', '');
    const outputFilePath = `${outputPath}/${outputFileName}`;

    if (await !fs.existsSync(outputFileName)) {
      const templateContent: string = await fs.promises.readFile(
        templateFile.path,
        'utf8'
      );

      const renderedTemplate: string = Mustache.render(
        templateContent,
        templateVariables
      );

      // write the rendered template to a file in the desired output directory
      log(`Writing template to ${outputFilePath}`);
      fs.promises.writeFile(outputFilePath, renderedTemplate, { flag: 'wx' });
    }
  }
}
