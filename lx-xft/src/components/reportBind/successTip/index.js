var tpl = require('./index.html');
var layer = require('components/layer');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function () {

    },
    render: function () {
      var _this = this;
      _this.update();
    }
  },
  events: {
    'click .js-ok': 'closeTip'
    // 'click .js-cancel': 'closeTip'
  },
  handle: {
    closeTip: function () {
      $.isFunction(this.callback) && this.callback();
      layer.closeAll();

      // 需要退出登录，才能从服务器获取最新岗位信息。
      $.ajax({
        type: 'POST',
        url: '/newhouse-web/info/logout',
        dataType: 'json',
        success: function (data) {
          if (data.status === 'C0000') {
            amplify.store.sessionStorage('userInfo', null);
            var uid = amplify.store.sessionStorage('uid');
            if (uid) {
              amplify.store.sessionStorage('infoMenu_' + uid, null);
            }
            amplify.store.sessionStorage('area', null);
            amplify.store.sessionStorage('uid', null);
            amplify.store.sessionStorage('opencity', null);
            amplify.store.sessionStorage('position', null);
            amplify.store.sessionStorage('userConfig', null);
            amplify.store.sessionStorage('isrow', null);
            amplify.store.sessionStorage('isrowindex', null);
            amplify.store.sessionStorage('refer', null);
            location.href = 'login.html';
          }
        }
      });
    },
    closeCancel: function () {
      layer.close(layer.index);
    }
  }
};
