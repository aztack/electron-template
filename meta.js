const $fs = require('fs');
const $path = require('path');
const log = console.log.bind(console);
const npmMirrors = {
  taobao: 'https://npm.taobao.org/mirrors/electron/'
}

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
    },
    "mirror": {
      "type": "boolean",
      "label": "Use taobao.org mirror to download electron (Recommended if you are in China)?",
      "default": false
    }
  },
  complete: function (data, opts) {
    const cwd = $path.join(process.cwd(), data.inPlace ? '' : data.destDirName);
    const name = data.name;
    const projectPkgJson = $path.join(cwd, 'package.json');

    if (data.mirror) {
      process.env.ELECTRON_MIRROR = npmMirrors.taobao;
    }

    process.chdir(cwd);
    const npm = require('npm');
    npm.load(projectPkgJson, (err) => {
      if (!err) {
        npm.install(process.cwd(), (err) => {
          if (err) {
            log(`Install package failed:`, err);
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