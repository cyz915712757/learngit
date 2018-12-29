const config = require('./config');

// 定义输出目录
const output = {
  path: config.distDir,
  publicPath: '/',
  filename: 'js/[name]-[chunkhash:8].js',
  chunkFilename: 'js/[name]-[id].bundle-[chunkhash:8].js'
};

module.exports = output;
