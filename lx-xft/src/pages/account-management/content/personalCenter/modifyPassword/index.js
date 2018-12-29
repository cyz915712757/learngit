var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');
var layer = require('components/layer');
var successTip = require('../successTip');
var domPrefixStr = '<div class="modify-error-message"><i class="iconfont icon-gantanhao"></i>';
var domSuffixStr = '</div>';
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    openSuccessTip: function(msg) {
      var index = layer.open({
        type: 1,
        area: ['425px', '290px'],
        title: '&nbsp;',
        content: '<div id="success-tip-content"></div>'
      });
      var $title = $('#layui-layer' + index + ' .layui-layer-title');
      var d = coala.mount(successTip, '#success-tip-content');
      d.index = index;
      d.trigger('render', msg);
    }
  },
  events: {
    'click .modify-btn': 'registerAccount'
  },
  mixins: [{
    validateAccount: function(opts) {
      this.$('.modify-error-message').remove();
      var msg = '';
      var extMsg = '';
      if (!opts.oldPwd) {
        extMsg = '请输入旧密码';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#oldPassword').parent().after(msg);
        this.$('#oldPassword').focus();
        return false;
      } else if (!opts.newPwd) {
        extMsg = '请输入新密码';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#newPassword').parent().after(msg);
        this.$('#newPassword').focus();
        return false;
      } else if (opts.newPwd.length < 6 || opts.newPwd.length > 16) {
        extMsg = '请输入6-16位密码';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#newPassword').parent().after(msg);
        this.$('#newPassword').focus();
        return false;
      } else if (!opts.confirmPwd) {
        extMsg = '请确认新密码';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#newPassword').parent().after(msg);
        this.$('#ensureNewPassword').focus();
        return false;
      } else if (opts.newPwd !== opts.confirmPwd) {
        extMsg = '两次输入的密码不一致，请重新输入';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#newPassword').parent().after(msg);
        this.$('#ensureNewPassword').focus();
        return false;
      }
      return true;
    }
  }],
  handle: {
    registerAccount: function(e) {
      var $ele = this.$(e.target);
      var oldPassword = this.$('#oldPassword').val().trim();
      var newPassword = this.$('#newPassword').val().trim();
      var ensureNewPassword = this.$('#ensureNewPassword').val().trim();
      var userInfo = {
        oldPwd: oldPassword,
        newPwd: newPassword,
        confirmPwd: ensureNewPassword
      };

      //validate user infomation,if false,alert the message
      var flag = this.validateAccount(userInfo);
      if (flag) {
        var _this = this;
        $.ajax({
          url: '/newhouse-web/info/account/resetPwd',
          type: 'post',
          data: userInfo,
          success: function(data) {
            if (data.status === 'C0000') {
              _this.trigger('openSuccessTip', '修改密码成功，下次登录请使用新密码登录。');
            } else {
              layer.msg(data.message);
            }
          }
        });
      }
    }
  }
};
