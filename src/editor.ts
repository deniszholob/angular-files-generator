import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
// import {
//   AngularJsonConfig,
//   getAngularConfig,
//   getAngularPrefix,
// } from './angular-config';
import { NgFileType } from './generator/angular-file-type.model';
import {
  arrayToStingList,
  log,
  toDashCaseName,
  toUpperReadableName,
} from './util/formatter';

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

export function displaySuccessMessage(
  type: string,
  name: string,
  timeout = 2000
): void {
  const message: string = `${type} ${name} was successfully generated`;
  log(message);
  vscode.window.setStatusBarMessage(message, timeout);
}

export function displayNotGeneratedFilesMessage(files: string[]): void {
  const message: string =
    'Skipped these files as they already exist:\n' +
    arrayToStingList({ arr: files, delimiter: ', ' });
  log(message);
  vscode.window.showInformationMessage(message);
}
export async function showFileNameDialog(
  ngFileType: NgFileType,
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

  const fileTypeDashed: string = toDashCaseName(ngFileType);
  let fileName: string | undefined = await vscode.window.showInputBox({
    prompt: `Type the name of the new ${toUpperReadableName(fileTypeDashed)}`,
    value: `my-${fileTypeDashed}-name`,
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
