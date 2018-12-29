var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');
var layer = require('components/layer');
var successTip = require('../successTip');
var domPrefixStr = '<div class="login-error-message"><i class="iconfont icon-gantanhao"></i>';
var domSuffixStr = '</div>';
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    openSuccessTip: function (msg) {
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
    },
    render: function () {
      this.update();
    }

  },
  events: {
    'click .next-btn': 'nextProcess',
    'click .confirm-btn': 'modifyProcess',
    'click .get-code-btn': 'getCodeProcess'
  },
  mixins: [{
    validateAccount: function (opts) {
      this.$('.login-error-message').remove();
      var msg = '';
      var extMsg = '';
      if (!opts.mobile.match(/^1(3[0-9]|4[57]|5[0-35-9]|7[0135678]|8[0-9]|9[0-9])\d{8}$/)) {
        extMsg = '请输入正确的手机号';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#mobileNo').parent().parent().after(msg);
        this.$('#mobileNo').focus();
        return false;
      } else if (!opts.smsVerifyCode) {
        extMsg = '请输入验证码';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#mobileNo').parent().parent().after(msg);
        this.$('#verifyCode').focus();
        return false;
      }

      return true;
    }
  }],
  handle: {
    nextProcess: function (e) {
      var mobileNo = this.$('#mobileNo').val().trim();
      var verifyCode = this.$('#verifyCode').val().trim();
      var userInfo = {
        mobile: mobileNo,
        smsVerifyCode: verifyCode,
        isNewMobile: false
      };

      // validate user infomation,if false,alert the message
      var flag = this.validateAccount(userInfo);
      if (flag) {
        var _this = this;
        $.ajax({
          url: '/newhouse-web/info/account/changeMobile/confirm',
          type: 'post',
          data: userInfo,
          success: function (data) {
            if (data.status === 'C0000') {
              _this.$('#mobileNo').val('').attr('placeholder', '新手机号');
              _this.$('.next-btn').attr('class', 'confirm-btn').text('确定');
              clearInterval(_this.i);
              _this.$('.get-code-btn').removeClass('disable').text('获取验证码');
              _this.$('#verifyCode').val('');
            } else {
              layer.msg(data.message);
            }
          }
        });
      }
    },
    modifyProcess: function (e) {
      var mobileNo = this.$('#mobileNo').val().trim();
      var verifyCode = this.$('#verifyCode').val().trim();
      var userInfo = {
        mobile: mobileNo,
        smsVerifyCode: verifyCode,
        isNewMobile: true
      };

      // validate user infomation,if false,alert the message
      var flag = this.validateAccount(userInfo);
      if (flag) {
        var _this = this;
        $.ajax({
          url: '/newhouse-web/info/account/changeMobile/confirm',
          type: 'post',
          data: userInfo,
          success: function (data) {
            if (data.status === 'C0000') {
              _this.trigger('openSuccessTip', '修改手机号成功，下次登录请使用新手机号登录。');
            } else {
              layer.msg(data.message);
            }
          }
        });
      }
    },

    getCodeProcess: function (e) {
      var _this = this;
      this.$('.login-error-message').remove();
      var mobileNo = this.$('#mobileNo').val().trim();
      if (!mobileNo.match(/^1(3[0-9]|4[57]|5[0-35-9]|7[0135678]|8[0-9]|9[0-9])\d{8}$/)) {
        var extMsg = '请输入正确的手机号';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#mobileNo').parent().parent().after(msg);
        this.$('#mobileNo').focus();
        return;
      }

      require.ensure([], function (require) {
        var identifyCode = require('components/identify-code');
        var index = layer.open({
          type: 1,
          area: ['520px', '240px'],
          title: '&nbsp;',
          content: '<div id="identify-code-content" class="identify-code-content"></div>'
        });
        var $title = $('#layui-layer' + index + ' .layui-layer-title');
        $title.css('border-bottom', '1px solid #fff');
        $title.css('background-color', '#fff');
        var d = coala.mount(identifyCode, '#identify-code-content');
        d.index = index;
        d.parent = this;
        d.mobileNo = mobileNo;
        d.type = 'modifyPhone';

        // ready to sending code
        d.callback = function () {
          var t = '60';
          _this.i = setInterval(function () {
            _this.$('.get-code-btn').addClass('disable').text(t + 's之后再获取');
            --t;
            if (t === -1) {
              clearInterval(_this.i);
              _this.$('.get-code-btn').removeClass('disable').text('获取验证码');
            }
          }, 1000);
        };
      });
    }
  }
};
