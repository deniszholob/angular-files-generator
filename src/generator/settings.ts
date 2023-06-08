// Settings
// From package.json/contributes/configuration/properties
import * as vscode from 'vscode';
export const getSetting_customTemplateFolder = () =>
  getExtensionSetting<string | null | undefined>('customTemplateFolder');

export const getSetting_defaultSpecsUseTestBed = () =>
  getExtensionSetting<boolean | undefined>('defaultSpecsUseTestBed');

export const getSetting_generateSpec = () =>
  getExtensionSetting<boolean | undefined>('generateSpec');

export const getSetting_generateStories = () =>
  getExtensionSetting<boolean | undefined>('generateStories');

function getExtensionSetting<T>(settingKey: string): T | undefined {
  return getExtensionSettings().get(settingKey);
}

function getExtensionSettings(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration('angular-files-generator');
}
