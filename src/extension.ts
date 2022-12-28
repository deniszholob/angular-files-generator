// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {
  displayStatusMessage,
  GenerationPathInfo,
  ResourceType,
  showFileNameDialog,
} from './editor';
import { log, toUpperCase } from './formatter';
import { generate } from './generator/generate-component-module';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const cmdGenerateModule = vscode.commands.registerCommand(
    'angular-files-generator.generateModule',
    async (args) => {
      generateCommand(args, 'module');
    }
  );
  const cmdGenerateService = vscode.commands.registerCommand(
    'angular-files-generator.generateService',
    async (args) => {
      generateCommand(args, 'service');
    }
  );
  const cmdGenerateComponent = vscode.commands.registerCommand(
    'angular-files-generator.generateComponent',
    async (args) => {
      generateCommand(args, 'component');
    }
  );

  context.subscriptions.push(
    cmdGenerateModule,
    cmdGenerateService,
    cmdGenerateComponent
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

async function generateCommand(
  registerArgs: any,
  resourceType: ResourceType
): Promise<void> {
  const paths: GenerationPathInfo = await showFileNameDialog(
    registerArgs,
    resourceType,
    `new-${resourceType}`
  );
  log('Paths', paths);
  await generate({
    cmpSelector: 'app',
    inputName: paths.fileName,
    upperName: toUpperCase(paths.fileName),
    extensionRoot: __dirname,
    outputDir: paths.rootPath,
    resourceType,
  });
  await displayStatusMessage('Module', paths.fileName);
}
