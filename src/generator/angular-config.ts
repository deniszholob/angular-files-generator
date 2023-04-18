import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { log } from './formatter';

export type AngularJsonConfig = {
  projects?: {
    [key: string]: ProjectConfig;
  };
};

type ProjectConfig = {
  prefix?: string;
};

type NgProject = {
  name: string;
  config: ProjectConfig;
};

/** Can be angular.json or project.json if using nx
 * @deprecated use `getAngularConfigFile()` because in this function the
 * `vscode.workspace.findFiles()` will take into account the excluded files in vscode config
 * so if `angular.json` is hidden then it wont be read here
 */
async function getAngularConfigFileAsync(): Promise<string | undefined> {
  // https://code.visualstudio.com/api/references/vscode-api#GlobPattern
  const configFilesGlob: string = `{${[
    'angular.json',
    // 'project.json',
    // '.angular-cli.json',
  ].reduce((acc, cur) => `${acc},**/${cur}`, '')}}`;
  return await vscode.workspace
    .findFiles(configFilesGlob, '{**/node_modules/*}', 1)
    .then((files) => (files.length > 0 ? files[0].fsPath : undefined));
}

/** @returns workspace root angular.json or undefined if cant find one */
export function getAngularConfigFile(): string | undefined {
  const dir = vscode.workspace.workspaceFolders?.[0].uri;
  if (!dir) return;

  const configFile = path.join(dir.fsPath, `angular.json`);
  return fs.existsSync(configFile) ? configFile : undefined;
}

/** @returns angular.json file contents as json*/
export async function getAngularConfig(): Promise<
  AngularJsonConfig | undefined
> {
  const angularJsonPath: string | undefined = await getAngularConfigFile();
  log('angularJsonPath', angularJsonPath);

  if (!angularJsonPath) return;

  const angularJsonContents: string = await fs.promises.readFile(
    angularJsonPath,
    'utf8'
  );

  try {
    return JSON.parse(angularJsonContents);
  } catch (ex) {
    return;
  }
}

/** @returns angular prefix for the project where user clicked in if found in angular.json, or undefined */
export async function getAngularPrefix(
  config?: AngularJsonConfig,
  locationPath?: string
): Promise<string | undefined> {
  if (!config || !config.projects) return;

  const projects: NgProject[] = Object.entries(config.projects).map(
    ([name, config]) => ({
      name,
      config,
    })
  );
  if (projects.length <= 0) return;

  return (
    projects.find((project) => !!locationPath?.includes(project.name)) ??
    projects[0]
  ).config.prefix;
}
