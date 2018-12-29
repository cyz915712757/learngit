var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');
var header = require('components/header');
var layer = require('components/layer');
var successTip = require('./successTip');
var amplify = require('vendors/amplify/amplify.store.min').amplify;

require('./index.css');

module.exports = {
  tpl: tpl,
  refs: {
    header: {
      component: header,
      el: '#header'
    }
  },
  listen: {
    openSuccessTip: function () {
      var index = layer.open({
        type: 1,
        area: ['420px', '290px'],
        title: '&nbsp;',
        content: '<div id="success-tip-content"></div>'
      });
      var $title = $('#layui-layer' + index + ' .layui-layer-title');
      var d = coala.mount(successTip, '#success-tip-content');
      d.index = index;
    },

    openIdentifyCode: function (userName) {
      var index = layer.open({
        type: 1,
        area: ['520px', '240px'],
        title: '&nbsp;',
        content: '<div id="identify-code-content" class="identify-code-content"></div>'
      });
      var $title = $('#layui-layer' + index + ' .layui-layer-title');
      var _this = this;

      require.ensure([], function () {
        var identifyCode = require('components/identify-code');
        var d = coala.mount(identifyCode, '#identify-code-content');

        d.index = index;
        d.mobileNo = userName;
        d.type = 'find';
        d.callback = function () {
          _this.$('.login-form-group.step-one').addClass('dn');
          _this.$('.login-form-group.step-two').removeClass('dn');
          _this.$('.login-btn.step-one').addClass('dn');
          _this.$('.login-btn.step-two').removeClass('dn');
          _this.$('.step-item-first').removeClass('current');
          _this.$('.step-item-last').addClass('current');
        };
      });
    }
  },
  events: {
    'click .login-btn.step-one': 'findAccount',
    'click .login-btn.step-two': 'submitAccount'
  },
  mixins: [{
    validateAccount: function (userName) {

      var msg = '';
      var extMsg = '';
      var prefixMsg = '<div class="login-error-message step-one"><i class="iconfont icon-gantanhao"></i>';
      var suffixMsg = '</div>';

      var flag = true;
      if (!userName) {
        extMsg = '请输入手机号';
        flag = false;
      } else if (!userName.match(/^1(3[0-9]|4[57]|5[0-35-9]|7[0135678]|8[0-9]|9[0-9])\d{8}$/)) {
        extMsg = '请输入正确的手机号';
        flag = false;
      }

      if (!flag) {
        this.$('.login-error-message').remove();
        msg = prefixMsg + extMsg + suffixMsg;
        this.$('#userName').focus();
        this.$('#verifyCode').parent().after(msg);
        return false;
      }
        this.$('.login-error-message').remove();
        return true;


    },

    validatePassword: function (userinfo) {
      var msg = '';
      var extMsg = '';
      var prefixMsg = '<div class="login-error-message"><i class="iconfont icon-gantanhao"></i>';
      var suffixMsg = '</div>';
      this.$('.login-error-message').remove();
      var flag = true;
      if (!userinfo.verifyCode) {
        extMsg = '请输入验证码';
        msg = prefixMsg + extMsg + suffixMsg;
        this.$('#verifyCode').focus();
        this.$('#verifyCode').parent().after(msg);
        return false;
      } else if (!userinfo.password) {
        extMsg = '请输入密码';
        msg = prefixMsg + extMsg + suffixMsg;
        this.$('#password').focus();
        this.$('#password').parent().after(msg);
        return false;
      } else if (!userinfo.ensurePassword) {
        extMsg = '请输入密码';
        msg = prefixMsg + extMsg + suffixMsg;
        this.$('#ensurePassword').focus();
        this.$('#ensurePassword').parent().after(msg);
        this.$('.login-error-message').css({ 'margin-bottom': '20px' });
        return false;
      } else if (userinfo.password.length < 6 || userinfo.password.length > 16) {
        extMsg = '密码长度为6-16位';
        msg = prefixMsg + extMsg + suffixMsg;
        this.$('#password').focus();
        this.$('#password').parent().after(msg);
        return false;
      } else if (userinfo.password !== userinfo.ensurePassword) {
        extMsg = '两次密码输入不一致';
        msg = prefixMsg + extMsg + suffixMsg;
        this.$('#password').focus();
        this.$('#password').parent().after(msg);
        return false;
      }

      return true;
    }
  }],
  handle: {
    findAccount: function (e) {
      var userName = this.$('#userName').val().trim();
      var flag = this.validateAccount(userName);
      if (flag) {
        this.trigger('openIdentifyCode', userName);
      }
    },

    submitAccount: function (e) {
      var verifyCode = this.$('#verifyCode').val().trim();
      var password = this.$('#password').val().trim();
      var ensurePassword = this.$('#ensurePassword').val().trim();
      var userinfo = { verifyCode: verifyCode, password: password, ensurePassword: ensurePassword };
      var flag = this.validatePassword(userinfo);
      if (flag) {
        var _this = this;
        $.ajax({
          url: '/newhouse-web/info/account/updatePassword',
          type: 'POST',
          data: {
            password: password,
            verifyCode: verifyCode
          },
          success: function (data) {
            layer.msg(data.message);
            if (data.status === 'C0000') {
              _this.trigger('openSuccessTip');
            }
          }
        });
      }
    }
  }
};
