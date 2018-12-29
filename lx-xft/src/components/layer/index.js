require('vendors/layer/skin/default/layer.css');
require('./index.css');
var layer = require('vendors/layer/layer.js');
var _msg = layer.msg;

layer.msg = function(msg, opts, fn) {
  var iconClass = '';
  if (opts && opts.icon == 0) {
    iconClass = 'icon-tishifu';
  } else if (opts && opts.icon == 1) {
    iconClass = 'icon-zhengque1';
  } else if (opts && opts.icon == 2) {
    iconClass = 'icon-jinggao';
  } else {
    return _msg(msg, opts, fn);
  }

  delete opts.icon;
  opts.maxWidth = opts.maxWidth || 800;
  opts.skin = opts.skin ? (opts.skin + ' custom-layer-msg') : ' custom-layer-msg';
  opts.time = opts.time || (opts.closeBtn ? 5000 : 3000);
  var msg = '<div class="content"><i class="iconfont ' + iconClass + '"></i>' + msg + '</div>';
  _msg(msg, opts, fn);
};

module.exports = layer;
