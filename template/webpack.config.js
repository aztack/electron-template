// webpack.config.js
module.exports = [{
  mode: 'development',
  entry: {
    main: './src/main.ts', 
    preload: './src/preload.ts',
    renderer: './src/renderer.ts'
  },
  target: 'electron-main',
  module: {
    rules: [{
      test: /\.ts$/,
      include: /src/,
      use: [{ loader: 'ts-loader' }]
    }]
  },
  output: {
    path: __dirname + '/app',
    filename: '[name].js'
  }
}];