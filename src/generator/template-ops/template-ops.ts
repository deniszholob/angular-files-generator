import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import {
  TemplateFile,
  TemplateFolder,
  Templates,
  comparatorTemplateFile,
} from './TemplateFolders.model';
import { arrayUnionOverride } from '../../util/array.util';
import { log } from '../../util/formatter.util';

export function getExtensionTemplateDir(
  extensionSrcDir: string,
  templateFolder: TemplateFolder
): string {
  log('extensionSrcDir:', extensionSrcDir);
  const templatesPath: string = path.join(extensionSrcDir, templateFolder);
  log('templatesPath:', templatesPath);
  return templatesPath;
}

export function getCustomTemplateDir(
  customTemplatesFolderName: string | null
): string | null {
  log('customTemplatesFolderName:', customTemplatesFolderName);
  const workspaceRoot: string | undefined =
    vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  log('workspaceRoot:', workspaceRoot);
  const templatesPath: string | undefined =
    workspaceRoot && customTemplatesFolderName?.length
      ? path.join(workspaceRoot, customTemplatesFolderName)
      : undefined;
  log('templatesPath:', templatesPath);
  return templatesPath ?? null;
}

export async function getTemplateFilesAndOverride(
  defaultTemplateFiles: TemplateFile[],
  templatesPath: string | null
): Promise<TemplateFile[]> {
  const customTemplates: Templates | null = await getTemplates(templatesPath);
  if (!customTemplates) return defaultTemplateFiles;

  return arrayUnionOverride(
    defaultTemplateFiles,
    templatesToTemplateFiles(customTemplates),
    comparatorTemplateFile
  );
}

/** @returns templates from directory */
async function getTemplates(
  templatesPath: string | null
): Promise<Templates | null> {
  return templatesPath && fs.existsSync(templatesPath)
    ? { templatesPath, templateFiles: await fs.promises.readdir(templatesPath) }
    : null;
}

/** Object conversion */
function templatesToTemplateFiles(templates: Templates): TemplateFile[] {
  return templates.templateFiles.map(
    (f: string): TemplateFile => new TemplateFile(f, templates.templatesPath)
  );
}
