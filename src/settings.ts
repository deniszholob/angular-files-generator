// Settings
// From package.json/contributes/configuration/properties
import * as vscode from 'vscode';

export const getSetting_customTemplateFolder = () =>
  getExtensionSetting<string | null | undefined>('customTemplateFolder');

export const getSetting_useOnlyCustomTemplates = () =>
  getExtensionSetting<boolean | undefined>('useOnlyCustomTemplates');

export const getSetting_generateSpec = () =>
  getExtensionSetting<number | undefined>('generateSpec');

export const getSetting_generateStories = () =>
  getExtensionSetting<number | undefined>('generateStories');

export const getSetting_generateMock = () =>
  getExtensionSetting<boolean | undefined>('generateMock');

function getExtensionSetting<T>(settingKey: string): T | undefined {
  return getExtensionSettings().get(settingKey);
}

function getExtensionSettings(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration('angular-files-generator');
}
