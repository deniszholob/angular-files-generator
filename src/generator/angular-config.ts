import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { log } from '../util/formatter.util';

/** angular.json */
type AngularJsonConfig = {
  projects?: {
    [key: string]: ProjectConfig;
  };
  defaultProject?: string;
};

type ProjectConfig = {
  prefix?: string;
};

/** project.json */
type NxProjectConfig = {
  name: string;
  prefix: string;
};

function isNxConfig(
  config: AngularJsonConfig | NxProjectConfig
): config is NxProjectConfig {
  return 'prefix' in config;
}

export async function getAngularProjectPrefix(): Promise<string | undefined> {
  const config: AngularJsonConfig | NxProjectConfig | undefined =
    await readAngularProjectConfig();
  if (!config) return;
  return isNxConfig(config) ? config.prefix : await getAngularPrefix(config);
}

/**
 * @returns workspace root angular.json or undefined if cant find one
 *  Can be angular.json
 * or project.json if using nx
 * or .angular-cli.json for older angular versions */
function getProjectConfigFilePath(
  potentialConfigFileNames: string[] = [
    'angular.json',
    'project.json',
    // '.angular-cli.json',
  ]
): string | undefined {
  const dir: vscode.Uri | undefined =
    vscode.workspace.workspaceFolders?.[0].uri;
  if (!dir) return;

  const potentialConfigFiles = potentialConfigFileNames.map((name) =>
    path.join(dir.fsPath, name)
  );

  for (const i in potentialConfigFiles) {
    const configFilePath: string = potentialConfigFiles[i];
    if (fs.existsSync(configFilePath)) return configFilePath;
  }

  return undefined;
}

/** @returns angular.json file contents as json*/
async function readAngularProjectConfig(): Promise<
  AngularJsonConfig | NxProjectConfig | undefined
> {
  const angularProjectConfigPath: string | undefined =
    getProjectConfigFilePath();
  log('angularProjectConfigPath', angularProjectConfigPath);

  if (!angularProjectConfigPath) return;

  const angularJsonContents: string = await fs.promises.readFile(
    angularProjectConfigPath,
    'utf8'
  );

  try {
    return JSON.parse(angularJsonContents);
  } catch (ex) {
    return;
  }
}

/** @returns angular prefix for the project where user clicked in if found in angular.json, or undefined */
async function getAngularPrefix(
  config?: AngularJsonConfig,
  locationPath?: string
): Promise<string | undefined> {
  if (!config || !config.projects) return;

  type NgProjectMap = {
    name: string;
    config: ProjectConfig;
  };

  const projects: NgProjectMap[] = Object.entries(config.projects).map(
    ([name, config]): NgProjectMap => ({
      name,
      config,
    })
  );
  if (projects.length <= 0) return;

  return (
    projects.find(
      (project) =>
        !!(locationPath ?? config?.defaultProject)?.includes(project.name)
    ) ?? projects[0]
  )?.config?.prefix;
}
