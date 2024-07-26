// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getAngularProjectPrefix } from './generator/angular-config';
import { TemplateType, TEMPLATE_TYPE_OPTIONS } from './generator/template-type.enum';
import {
  GenerationPathInfo,
  displayNotGeneratedFilesMessage,
  displaySuccessMessage,
  showFileNameDialog,
} from './editor';
import {
  log,
  toConstantCaseName,
  toDashCaseName,
  toUpperCamelCaseName,
  toUpperReadableName,
} from './util/formatter.util';
import { generate } from './generator/generate-files';

type RegisterCmdArgs = { fsPath: string };
const EXTENSION_ID = 'angular-files-generator';
const DEFAULT_ANGULAR_PREFIX = 'app';

/**
 * This method is called when your extension is activated
 * Extension is activated the very first time a command is executed
 * Commands need to be defined in the package.json file
 */
export function activate(context: vscode.ExtensionContext): void {
  const generatorCommands: vscode.Disposable[] = TEMPLATE_TYPE_OPTIONS.map(
    (type: TemplateType): vscode.Disposable =>
      // Provided implementation of commands registered in package.json
      // The commandId parameter must match the command field in package.json
      vscode.commands.registerCommand(
        `${EXTENSION_ID}.generate${toUpperCamelCaseName(toDashCaseName(type))}`,
        (args) => generationCommand(args, type)
      )
  );

  context.subscriptions.push(
    ...generatorCommands,
    vscode.commands.registerCommand(`${EXTENSION_ID}.test`, (args) => test())
  );
}

// This method is called when your extension is deactivated
export function deactivate(): void {}

async function generationCommand(
  registerCmdArgs: RegisterCmdArgs | undefined,
  templateType: TemplateType
): Promise<void> {
  const paths: GenerationPathInfo = await showFileNameDialog(
    templateType,
    registerCmdArgs?.fsPath
  );
  log('Paths', paths);

  const prefix: string | undefined = await getAngularProjectPrefix();
  const dashCaseName: string = toDashCaseName(paths.fileName);
  await generate(
    {
      componentPrefix: prefix ?? DEFAULT_ANGULAR_PREFIX,
      dashCaseName,
      upperCamelCaseName: toUpperCamelCaseName(dashCaseName),
      constantCaseName: toConstantCaseName(dashCaseName),
      upperReadableName: toUpperReadableName(dashCaseName),
    },
    {
      extensionSrcDir: __dirname,
      outputDir: paths.rootPath,
      templateType: templateType,
    }
  )
    .then((filesAlreadyExist: string[]) => {
      if (filesAlreadyExist.length) {
        displayNotGeneratedFilesMessage(filesAlreadyExist);
      }
      displaySuccessMessage(templateType, dashCaseName);
    })
    .catch((e) => {
      vscode.window.showErrorMessage(String(e));
    });
}

async function test() {}
