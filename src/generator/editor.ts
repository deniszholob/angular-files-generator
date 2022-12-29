import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import {
  AngularJsonConfig,
  getAngularConfig,
  getAngularPrefix,
} from './angular-config';
import { NgFileType } from './angular-file-type.model';
import { log } from './formatter';

export interface GenerationPathInfo {
  /** Full file path
   *  Ex: c:/target/module-name */
  fullPath: string;
  /** User Input file name
   * Ex: module-name */
  fileName: string;
  /** If user input dir/module-name
   * Ex: dir
   */
  // dirName: string;
  /** Ex: c:/target/dir */
  // dirPath: string;
  /** Target root path
   * Ex: c:/target */
  rootPath: string;
}

export function displayStatusMessage(
  type: string,
  name: string,
  timeout = 2000
): void {
  vscode.window.setStatusBarMessage(
    `${type} ${name} was successfully generated`,
    timeout
  );
}

export async function showFileNameDialog(
  resourceType: NgFileType,
  clickedFolderPath?: string
): Promise<GenerationPathInfo> {
  if (!clickedFolderPath) {
    if (!vscode.window.activeTextEditor) {
      throw new Error(
        'Please open a file first.. or just right-click on a file/folder and use the context menu!'
      );
    }
    clickedFolderPath = path.dirname(
      vscode.window.activeTextEditor.document.fileName
    );
  }

  const rootPath: string = fs.lstatSync(clickedFolderPath).isDirectory()
    ? clickedFolderPath
    : path.dirname(clickedFolderPath);

  const workspaceExists: boolean =
    !!vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders?.length > 0;

  if (!workspaceExists) {
    throw new Error('Please open a project first.');
  }

  let fileName: string | undefined = await vscode.window.showInputBox({
    prompt: `Type the name of the new ${resourceType}`,
    value: `new-${resourceType}`,
  });

  if (!fileName) {
    throw new Error(
      "That's not a valid name! (no white spaces or special characters)"
    );
  }

  let dirName: string = '';

  const filenameTokens: string[] = fileName.split(' ');
  [fileName] = filenameTokens;

  const fullPath: string = path.join(rootPath, fileName);

  if (fileName.indexOf('\\') !== -1) {
    [dirName, fileName] = fileName.split('\\');
  }
  // const dirPath: string = path.join(rootPath, dirName);

  return {
    fullPath,
    fileName,
    // dirName,
    // dirPath,
    rootPath,
  };
}
