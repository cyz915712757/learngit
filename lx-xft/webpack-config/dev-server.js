// dev server，定义反向代理
const devServer = {
  disableHostCheck: true,
  historyApiFallback: true,
  hot: true,
  inline: true,
  stats: {
    colors: true
  },
  proxy: {
    '/data/*': {
      target: 'http://172.16.72.25:8000/',
      changeOrigin: true
    },
    '/newhouse-web/*': {
      // target: 'http://172.16.72.119:9090',陈欢
      // 'http://xf.test.louxun.com/newhouse-web/'
      // target: 'http://lx.test.qfang.com/',
      target: 'http://xf.test.louxun.com/',
      // target: 'http://172.16.72.115:8081/',陈浩
      // target: 'http://172.16.72.124:8088/',泽源
      //  target: 'http://172.16.72.29:8081/',
      // target: 'http://172.16.72.124:8088/',
      // target: 'http://172.16.72.98:8089',
      // target: 'http://172.16.72.99:8088',
      changeOrigin: true
    }
  }
};

module.exports = devServer;
