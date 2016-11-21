/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');


module.exports = {
  entry: {
    background: './src/common/background/index.js',
    content: './src/common/content/index.js',
  },
  output: {
    path: path.resolve(__dirname, './build/src/common'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'eslint',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue',
    },
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: './src/*/extension_info.json',
        to: path.resolve(__dirname, './build'),
      },
      {
        from: './src/*/icons/*',
        to: path.resolve(__dirname, './build'),
      },
    ]),
    new WebpackShellPlugin({
      dev: false,
      onBuildEnd: [
        'python kango/kango.py build --no-pack build',
      ],
    }),
  ],
  devtool: '#eval-source-map',
};

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map';
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
  ]);
}
