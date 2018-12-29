const webpack = require('webpack');
const plugins = require('./webpack-config/plugins');
const SshWebpackPlugin = require('ssh-webpack-plugin');

plugins.push(
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
      drop_console: true
    }
  })
);

// var flag = process.argv.slice(2);
// if (process.argv.indexOf('--deploy') > -1) {
plugins.push(
  new SshWebpackPlugin({
    host: '192.168.0.241',
    port: '22',
    username: 'root',
    password: 'qfang.c0m', //or use privateKey login(privateKey: require('fs').readFileSync('/path/to/private/key')).
    from: 'lxnewhouse',
    cover: false,
    to: '/data/www/lx-xft', //important: If the 'cover' of value is false,All files in this folder will be cleared before starting deployment.
  })
);
// }

module.exports = {
  entry: require('./webpack-config/entry'),
  output: require('./webpack-config/output'),
  plugins: plugins,
  module: require('./webpack-config/modules'),
  resolve: {
    modulesDirectories: ['node_modules', 'src', 'src/pages', 'src/assets'],
    alias: {},
    noParse: []
  }
};
