// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getAngularProjectPrefix } from './generator/angular-config';
import {
  TemplateType,
  TEMPLATE_TYPE_OPTIONS,
} from './generator/template-type.enum';
import {
  GenerationPathInfo,
  displayNotGeneratedFilesMessage,
  displayNothingToGenerateMessage,
  displaySuccessMessage,
  showFileNameDialog,
} from './editor';
import {
  log,
  toCamelCase,
  toConstantCaseName,
  toDashCaseName,
  toUpperCamelCaseName,
  toUpperReadableName,
} from './util/formatter.util';
import {
  GenerationResponse,
  GenerationStatus,
  GeneratorVariables,
  generate,
} from './generator/generate-files';
import { TemplateVariables } from './generator/template-ops/TemplateVariables.model';

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
        (args) =>
          generationCommand(args, type).catch((e: unknown): void => {
            vscode.window.showErrorMessage(String(e));
          })
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
      camelCaseName: toCamelCase(dashCaseName),
      upperCamelCaseName: toUpperCamelCaseName(dashCaseName),
      constantCaseName: toConstantCaseName(dashCaseName),
      upperReadableName: toUpperReadableName(dashCaseName),
      type: paths.customType,
    } satisfies TemplateVariables,
    {
      extensionSrcDir: __dirname,
      outputDir: paths.rootPath,
      templateType: templateType,
      customType: paths.customType,
    } satisfies GeneratorVariables
  )
    .then((response: GenerationResponse): void => {
      switch (response.status) {
        case GenerationStatus.filesAlreadyExist: {
          displayNotGeneratedFilesMessage(response.filesAlreadyExist);
        }
        case GenerationStatus.noTemplatesFound: {
          displayNothingToGenerateMessage(templateType);
        }
        case GenerationStatus.success:
        default: {
          displaySuccessMessage(templateType, dashCaseName);
        }
      }
    })
    .catch((e: unknown): void => {
      vscode.window.showErrorMessage(String(e));
    });
}

async function test() {}
