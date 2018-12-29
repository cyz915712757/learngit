var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');
var header = require('components/header');
var layer = require('components/layer');
// 登录访问权限
var permission = require('components/permission');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    init: function () {
      $.ajax({
        url: '/newhouse-web/info/validate',
        type: 'POST',
        success: function (res) {
          res.status === 'C0000' && location.replace('./index.html');
        }
      });
    },
    mount: function () {
      var userInfo = amplify.store.localStorage('userInfo');
      if (userInfo) {
        this.$('#userName').val(userInfo.userName);
        this.$('#password').val(userInfo.password);
        this.$('#rememberme').attr('checked', true);
      }

      $(document).keyup(function (event) {
        if (event.keyCode == 13) {
          $('.login-btn').trigger('click');
        }
      });
    }
  },
  refs: {
    header: {
      component: header,
      el: '#header'
    }
  },
  events: {
    'click .login-btn': 'loginProcess',
    'click .get-code-btn': 'codeRefresh'
  },
  mixins: [{
    validateAccount: function (userInfo) {
      this.$('.login-error-message').remove();
      var msg = '';
      var extMsg = '';
      var domPrefixStr = '<div class="login-error-message"><i class="iconfont icon-gantanhao"></i>';
      var domSuffixStr = '</div>';
      if (!userInfo.userName) {
        extMsg = '请输入账号';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#userName').parent().after(msg);
        this.$('#userName').focus();
        return false;
      } else if (!userInfo.userName.match(/^(13|14|15|16|17|18|19)[0-9]{9}$/)) {
        extMsg = '请输入正确的手机号';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#userName').parent().after(msg);
        this.$('#userName').focus();
        return false;
      } else if (!userInfo.password) {
        extMsg = '请输入密码';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#password').parent().after(msg);
        this.$('#password').focus();
        return false;
      } else if (this.$('#verifyCode').is(':visible') && !userInfo.verifyCode) {
        extMsg = '请输入验证码';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#verifyCode').parent().parent().after(msg);
        this.$('#verifyCode').focus();
        return false;
      }

      return true;
    }
  }],
  handle: {
    loginProcess: function (e) {
      var userName = this.$('#userName').val().trim();
      var password = this.$('#password').val().trim();
      var verifyCode = this.$('#verifyCode').val().trim();
      var userInfo = { userName: userName, password: password, verifyCode: verifyCode };
      var flag = this.validateAccount(userInfo);
      if (flag) {
        var _this = this;
        $.ajax({
          url: '/newhouse-web/info/login',
          type: 'POST',
          data: userInfo,
          beforeSend: function () {
            _this.$('.login-btn').text('正在登录...').css({ backgroundColor: '#ededed' });
          },
          success: function (data) {
            // data.status = 'E00023';
            if (data.status === 'E00023') {
              _this.$('.login-btn').text('立即登录').css({ backgroundColor: '#00b4ed' });
              layer.open({
                type: 1,
                shadeClose: true,
                area: ['600px', '445px'],
                title: '',
                content: '<div id="permission"></div>'
              });
              var d = coala.mount(permission, '#permission');
              return;
            }
            if (data.status === 'C0000') {
              var uid = amplify.store.sessionStorage('uid');
              if (uid) {
                amplify.store.sessionStorage('infoMenu_' + uid, null);
              }

              // 清除用户信息
              amplify.store.sessionStorage('uid', null);
              amplify.store.sessionStorage('area', null);
              amplify.store.sessionStorage('opencity', null);
              amplify.store.sessionStorage('position', null);
              amplify.store.sessionStorage('userConfig', null);
              amplify.store.sessionStorage('isrow', null);
              amplify.store.sessionStorage('isrowindex', null);
              amplify.store.sessionStorage('userInfo', { sessionId: data.result.sessionId });
              var rememberme = _this.$('input[type="checkbox"]:checked').val();
              if (rememberme) {
                amplify.store.localStorage('userInfo', { userName: userName, password: password });
              } else {
                amplify.store.localStorage('userInfo', null);
              }
              location.href = 'index.html';
            } else {
              _this.$('.login-btn').text('登录').css({ backgroundColor: '#00b4ed' });
              if (data.result && data.result.verifyNum && data.result.verifyNum >= 3) {
                _this.$('.js-login-code').removeClass('dn');
                _this.$('.get-code-btn').html('<img src="/newhouse-web/info/verify/imageCode?width=125&height=50&fontSize=24&x=30&y=30&t=' + Math.random() + '" width="125" height="50">');
              }
              if (data.status === 'INFO47') {
                layer.msg('抱歉，公司已停用，您的账号无法登录，如需要报备请联系公司负责人');
                return;
              }
              layer.msg(data.message);
            }
          }
        });
      }
    },

    codeRefresh: function (e) {
      var $ele = this.$(e.target);
      $ele[0].src = '/newhouse-web/info/verify/imageCode' + '?width=125&height=50&fontSize=24&x=30&y=30&t=' + Math.random();
    }
  }
};
