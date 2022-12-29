import * as fs from 'fs';
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

/** Can be angular.json or project.json if using nx */
export async function getAngularConfigFile(): Promise<string | undefined> {
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

export async function getAngularConfig(): Promise<
  AngularJsonConfig | undefined
> {
  const angularJsonPath: string | undefined = await getAngularConfigFile();
  log('angularJsonPath', angularJsonPath);

  if (!angularJsonPath) {
    return;
  }

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

export async function getAngularPrefix(
  config?: AngularJsonConfig,
  locationPath?: string
): Promise<string | undefined> {
  if (!config || !config.projects) {
    return;
  }

  const projects: NgProject[] = Object.entries(config.projects).map(
    ([name, config]) => ({
      name,
      config,
    })
  );
  if (projects.length <= 0) {
    return;
  }

  return (
    projects.find((project) => !!locationPath?.includes(project.name)) ??
    projects[0]
  ).config.prefix;
}
