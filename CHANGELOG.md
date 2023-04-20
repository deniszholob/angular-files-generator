# Change Log

## [Unreleased]

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
