var tpl = require('./index.html');
var layer = require('components/layer');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function() {
      this.el.append('<script src="http://connect.qq.com/widget/loader/loader.js" widget="shareqq" charset="utf-8"></script>');
    }
  },

  events: {
    'mouseenter .icon-weixin': 'showCode',
    'mouseleave .icon-weixin': 'hideCode',
    'click .close-direct': 'closeDirect',
    'click .preview-btn': 'previewLayout'
  },
  handle: {
    showCode: function(e) {
      var $code = this.$(e.target).parent().next().next();
      var url = $code.data('url');
      $code.find('img').attr('src', '/newhouse-web/garden/qrCode?url=' + url);
      $code.removeClass('dn');
    },

    hideCode: function(e) {
      var $code = this.$(e.target).parent().next().next();
      $code.addClass('dn');
    },

    closeDirect: function(e) {
      layer.close(this.tip);
    },

    previewLayout: function(e) {

      var url = $(e.target).data('url');
      layer.open({
        type: 2,
        title: '预览',
        shadeClose: true,
        shade: 0.8,
        area: ['500px', '90%'],
        content: url
      });
    }
  }
};
