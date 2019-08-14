/* global __dirname, require, module*/

const webpack = require('webpack');
const path = require('path');
const env = require('yargs').argv.env; // use --env with webpack 2
const pkg = require('./package.json');

let libraryName = pkg.name;

let outputFile, mode;

if (env === 'build') {
  mode = 'production';
  outputFile = libraryName + '.min.js';
} else {
  mode = 'development';
  outputFile = libraryName + '.js';
}

const config = {
  mode: mode,
  entry: __dirname + '/src/index.js',
  output: {
    path: __dirname + '/lib',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this"
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'url-loader',
        ],
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      'THREE': 'three/build/three',
      'TWEEN': '@tweenjs/tween.js',
    }),

  ],
  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./src')],
    extensions: ['.json', '.js'],
    alias: {
      'three/CanvasRenderer': path.join(__dirname, 'vendor/three/CanvasRenderer.js'),
      'three/Projector': path.join(__dirname, 'vendor/three/Projector.js'),
      'three/CSS3DRenderer': path.join(__dirname, 'vendor/three/CSS3DRenderer.js'),
      'three/TrackballControls': path.join(__dirname, 'vendor/three/TrackballControls.js'),
    }
  }
};
if (mode === 'development') {
  Object.assign(config, {
    devtool: 'inline-source-map',
  }); 
}

module.exports = config;
