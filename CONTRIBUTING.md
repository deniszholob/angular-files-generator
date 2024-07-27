## Dev
* Run `npm i` to install dev npm packages
* Go to the debugger window (Run&Debug icon on side bar)
* Click `Run Extension`
  * New window will open where you can test the extension code changes
  * A watch task will be automatically spawned to rebuild the extension as code changes
  * NOTE: Sometimes the watch task does not pick up the template changes, so you need to run the `npm run template-copy` command


## Commit/Push/Publish
* Commit as much as you like, but squash changes into 1 commit before a new release push
* Make sure to update the following before pushing/publishing
  * [package.json](./package.json) version number (major.minor.patch = breaking changes.new features.bug fixes)
  * [CHANGELOG](./CHANGELOG.md) version change description
  * [Screenshots](./screenshots) of functionality if changed
    * Can temporarily change `"group": "navigation"` to `"group": "navigation"` in [package.json](./package.json) to change position of menu group to be at the top vs the bottom
  * [README](./README.md) description of any new functionality
* Tag the commit to be the published release and push
* [CI/CD](.github/workflows/main.yml) will automatically build and publish the extension from main branch

## References
* [Extension Development Quick Start](./vsc-extension-quickstart.md)
* [VsCode First Extension Doc](https://code.visualstudio.com/api/get-started/your-first-extension)
* [VsCode API](https://code.visualstudio.com/api/references/vscode-api)
