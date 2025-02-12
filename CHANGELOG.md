# Change Log

## [Unreleased]

## [0.1.2]
### Added
- Model Mock Template: Add faker-js code

### Changed
- Component Template: Removed "standalone" from (newer version have that as default now)
- Model Mock Template: Add array mock and removed ".ts" from import string
- Spec toggle ignores the util and only applies to angular stuff (services components etc..)

### Fixed
- Enum template: Fox invalid console.log that was breaking the generation by default

## [0.1.1]
### Added
- Add templates for mocks and data
- Add mock data setting
- Add data option
- Add support for PascalCase and camelCase names

### Changed
- Directive Template: Added Standalone flag
- Pipe Template: Added Standalone flag and removed [] from name
- Enum Template: Added data mapping
- Util/Util Spec Templates: Uses camelCase name for function itself

### Fixed
- ComponentWithCustomControls with & {} was not doing type checking anymore

## [0.1.0]
### Added
- Support for custom template types
- util, model, enum templates/menu options
- Setting for only using the custom templates
### Changed
- Storybook template: Update types for latest SB and add some argType common boilerplate
- Component template: Add style display:contents as a comment
- Service template: Add providedIn: 'root'

## [0.0.9]
### Changed
- Look for project.json in addition to angular.json for nx workspaces to grab prefix setting
- Standalone Component template: moved imports to the bottom
- Tweak Component and Directive spec templates for instantiating

## [0.0.8]
### Added
- Standalone Component Menu Option
### Changed
- Settings for specs to be false, simple, testbed
- Settings for stories to be none, CSFv2, CSFv3

## [0.0.7]
### Added
- New setting to toggle `TestBed` in angular spec tests
### Changed
- Default specs do not have the `TestBed`
- Can toggle `defaultSpecsUseTestBed` setting to revert back to using `TestBed`

## [0.0.6]
### Added
- Error message popup for any errors that were encountered
### Changed
- If there are extra custom templates that has the known file suffixes (component, service, pipe, etc..), they will be rendered as well.

## [0.0.5]
### Added
- More generator options: Route, Directive, Pipe
- New setting options to toggle specs and stories
### Changed
- Template variable names to be more consistent

## [0.0.4]
### Added
- Custom Templates support; allowing to customize rendering of the files
- Custom Templates path configuration in settings.json

### Fixed
- Component prefix will be generated even if angular.json is hidden in the workspace
- Multi word names were rendering mixed readable and dash case Storybook title

## [0.0.3]
### Changed
- Storybook title commented out by default, with title case words
- Remove commented out constructor from component.ts

## [0.0.2]
### Changed
- Read angular.json to grab default selector name
- Move menu item from the very top of the list into it own group instead
### Fixed
- Generated files will not replace existing ones

## [0.0.1]
- Initial release
### Added
- Generator Explorer context menu
- Generation support for modules, component, services
