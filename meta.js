const $fs = require('fs');
const $path = require('path');
const $cp = require('child_process');
const log = console.log.bind(console);
const npmMirrors = {
  taobao: 'https://npm.taobao.org/mirrors/electron/'
};
const npmRegistries = {
  taobao: 'https://registry.npm.taobao.org'
};

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
    },
    "lang": {
      "type": "list",
      "choices": ["js","ts"],
      "default": "ts",
    },
    "spectron": {
      "type": "boolean",
      "label": "Use spectron?",
      "default": false
    },
    "tnpm": {
      "type": "boolean",
      "label": "Use taobao registry?",
      "default": false
    },
    "globalElectron": {
      "type": "boolean",
      "label": "Use global electron?",
      "default": true
    },
    "webpack": {
      "type": "boolean",
      "label": "Use webpack?",
      "default": false
    }
  },
  complete: function (data, opts) {
    const cwd = $path.join(process.cwd(), data.inPlace ? '' : data.destDirName);
    const name = data.name;
    const projectPkgJson = $path.join(cwd, 'package.json');
    const deps = [
      'typescript',
      'eslint',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      '@types/node'
    ];
    process.chdir(cwd);
    exportNodePath();
    const npm = require('npm');

    if (data.spectron) deps.push('spectron');
    if (!data.globalElectron) deps.push('electron');

    function installDeps({}, cb) {
      npm.commands.install(deps, (err) => {
        if (err) {
          log(`Install dependencies failed:`, err);
        } else {
          cb && cb();
        }
      });
    }

    if (data.mirror) {
      process.env.ELECTRON_MIRROR = npmMirrors.taobao;
    }
    if (data.lang === 'js') {
      removeTsFiles(cwd);
    }
    if (data.webpack) {
      const webpackPkgs = ['webpack', 'webpack-cli'];
      if (data.lang === 'ts') webpackPkgs.push('ts-loader');
      deps.push.apply(deps, webpackPkgs);
    } else {
      removeWebpackFiles(cwd);
    }
    npm.load({}, (err) => {
      if (data.tnpm) npm.config.set('registry', npmRegistries.taobao);
      npm.config.set('save-dev', true);
      npm.config.set('verbose', true);
      if (!err) {
        npm.install(process.cwd(), (err) => {
          if (err) {
            log(`Install package failed:`, err);
          } else {
            installDeps(npm, () => {
              if (data.globalElectron) npm.commands.link('electron');
              build(npm, data, () => npm.commands.run(['start']));
            });
          }
        });
      } else {
        console.error(`Load ${projectPkgJson} failed`, err);
      }
    });
  },
  skipInterpolation: []
};

function exportNodePath() {
  try {
    process.env.NODE_PATH = $cp.execSync('npm root -g').toString().trim();
  } catch (e) {}
}

function removeTsFiles(cwd) {
  $fs.unlinkSync($path.resolve(cwd, 'tsconfig.json'));
  $fs.rmdirSync($path.resolve(cwd, 'src'), {recursive:true});
}

function removeWebpackFiles(cwd) {
  $fs.unlinkSync($path.resolve(cwd, 'webpack.config.js'));
}

function build(npm, data, cb) {
  if (!data.webpack && data.lang != 'ts') cb();
  npm.commands.run(data.webpack ? 'build-webpack' : 'build-ts', err => {
    if (err) {
      console.error(`Build with Webpack failed:`, err);
    } else {
      cb();
    }
  });
}
