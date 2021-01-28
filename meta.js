const $fs = require('fs');
const $path = require('path');

module.exports = {
  "prompts": {
    "name": {
      "type": "string",
      "required": true,
      "label": "Project name, no space or punctuations, for example: my-project"
    },
    "description": {
      "type": "string",
      "required": true,
      "label": "Project description",
      "default": "An Electron Project"
    },
    "author": {
      "type": "string",
      "label": "Author"
    }
  },
  complete: function (data, opts) {
    const cwd = $path.join(process.cwd(), data.inPlace ? '' : data.destDirName);
    const name = data.name;

    process.chdir(cwd);
    const npm = require('npm');
    const projectPkgJson = $path.join(cwd, 'package.json');
    npm.load(projectPkgJson, (err) => {
      if (!err) {
        npm.install(process.cwd(), (err) => {
          if (err) {
            console.log(`Install package failed:`, err);
          } else {
            npm.commands.run(['start']);
          }
        });
      } else {
        console.error(`Load ${projectPkgJson} failed`, err);
      }
    });
  },
  skipInterpolation: []
}