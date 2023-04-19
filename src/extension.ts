// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {
  AngularJsonConfig,
  getAngularConfig,
  getAngularPrefix,
} from './generator/angular-config';
import { NG_FILE_TYPES, NgFileType } from './generator/angular-file-type.model';
import {
  GenerationPathInfo,
  displayStatusMessage,
  showFileNameDialog,
} from './generator/editor';
import {
  log,
  toConstantCaseName,
  toDashCaseName,
  toTitleCase,
  toUpperCamelCaseName,
  toUpperReadableName,
} from './generator/formatter';
import { generate } from './generator/generate-files';

type RegisterCmdArgs = { fsPath: string };
const EXTENSION_ID = 'angular-files-generator';

/**
 * This method is called when your extension is activated
 * Extension is activated the very first time a command is executed
 * Commands need to be defined in the package.json file
 */
export function activate(context: vscode.ExtensionContext): void {
  const generatorCommands: vscode.Disposable[] = NG_FILE_TYPES.map(
    (type: NgFileType): vscode.Disposable =>
      // Provided implementation of commands registered in package.json
      // The commandId parameter must match the command field in package.json
      vscode.commands.registerCommand(
        `${EXTENSION_ID}.generate${toTitleCase(type)}`,
        (args) => generateCommand(args, type)
      )
  );

  context.subscriptions.push(
    ...generatorCommands,
    vscode.commands.registerCommand(`${EXTENSION_ID}.test`, (args) => test())
  );
}

// This method is called when your extension is deactivated
export function deactivate(): void {}

async function generateCommand(
  registerCmdArgs: RegisterCmdArgs | undefined,
  resourceType: NgFileType
): Promise<void> {
  const paths: GenerationPathInfo = await showFileNameDialog(
    resourceType,
    registerCmdArgs?.fsPath
  );
  log('Paths', paths);

  const config: AngularJsonConfig | undefined = await getAngularConfig();
  const prefix: string | undefined = await getAngularPrefix(config);
  const dashCaseName: string = toDashCaseName(paths.fileName);
  await generate({
    componentPrefix: prefix ?? 'app',
    dashCaseName,
    upperCamelCaseName: toUpperCamelCaseName(dashCaseName),
    constantCaseName: toConstantCaseName(dashCaseName),
    upperReadableName: toUpperReadableName(dashCaseName),
    extensionRoot: __dirname,
    outputDir: paths.rootPath,
    resourceType,
  }).then(() => displayStatusMessage(resourceType, dashCaseName));
}

async function test() {}
