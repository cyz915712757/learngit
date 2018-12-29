var tpl = require('./index.html');
var layer = require('components/layer');
require('./index.css');

module.exports = {
  tpl: tpl,
  events: {
    'click .login-btn': 'codeProcess',
    'click .get-code-btn': 'codeRefresh'
  },
  handle: {
    codeProcess: function(e) {
      var msg = '';
      var extMsg = '';
      var prefixMsg = '<div class="identity-error-message"><i class="iconfont icon-gantanhao"></i>';
      var suffixMsg = '</div>';
      var verifyCode = this.$('#verifyCode').val().trim();
      var flag = true;
      if (!verifyCode) {
        extMsg = '请输入验证码';
        flag = false;
      }

      if (!flag) {
        this.$('.identity-error-message').remove();
        msg = prefixMsg + extMsg + suffixMsg;
        this.$('#verifyCode').focus();
        this.$('#verifyCode').parent().parent().after(msg);
        return;
      } else {
        this.$('.identity-error-message').remove();
      }

      //verify tel and code
      var _this = this;
      var url = {
        find: '/newhouse-web/info/account/sendVerifyCode',
        register: '/newhouse-web/info/account/registerVerifyCode',
        modifyPhone: '/newhouse-web/info/account/changeMobile/verifyCode'
      };
      var urlDetail = url[this.type];

      var params;

      if (this.type && this.type === 'modifyPhone') {
        params = {
          mobile: _this.mobileNo || '',
          verifyCode: verifyCode
        };
      } else {
        params = {
          mobileNo: _this.mobileNo || '',
          verifyCode: verifyCode
        };
      }

      $.ajax({
        url: urlDetail,
        type: 'POST',
        data: params,
        success: function(data) {
          if (data.status === 'C0000') {
            //close layer
            layer.close(_this.index);
            $.isFunction(_this.callback) && _this.callback();
          } else {
            layer.msg(data.message);
            _this.$('.get-code-btn').find('img')[0].src = '/newhouse-web/info/verify/imageCode' + '?width=125&height=50&fontSize=24&x=30&y=30&t=' + Math.random();
          }
        },

        error: function() {
          layer.msg('系统错误，请联系管理员。');
        }
      });
    },

    codeRefresh: function(e) {
      var $ele = this.$(e.target);
      $ele[0].src = '/newhouse-web/info/verify/imageCode' + '?width=125&height=50&fontSize=24&x=30&y=30&t=' + Math.random();
    }
  }
};
