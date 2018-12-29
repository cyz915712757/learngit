var coala = require('coala');
// var config = require('config');
var tpl = require('./index.html');
var header = require('components/header');
var layer = require('components/layer');
var successTip = require('./successTip');
var storeNumber = require('components/storeNumber');

var domPrefixStr = '<div class="login-error-message"><i class="iconfont icon-gantanhao"></i>';
var domSuffixStr = '</div>';
require('./index.css');

module.exports = {
  tpl: tpl,
  refs: {
    header: {
      component: header,
      el: '#header'
    },
    storeNumber: {
      component: storeNumber,
      el: '#storeNumber'
    }
  },
  listen: {
    mount: function () {
      this.select = $('#cityId').select({
        search: true,
        keyword: 'keyword',
        url: '/newhouse-web/pub/service/getAllCity',
        dataFormater: function (data) {
          return data.result.cities;
        },

        placeholder: '请选择城市'
      });
    },

    openSuccessTip: function () {
      var index = layer.open({
        type: 1,
        area: ['420px', '290px'],
        title: '&nbsp;',
        content: '<div id="success-tip-content"></div>'
      });
      // var $title = $('#layui-layer' + index + ' .layui-layer-title');
      var d = coala.mount(successTip, '#success-tip-content');
      d.index = index;
    },

    checkRegisterParams: function (params) {
      var _this = this;

      $.ajax({
        url: '/newhouse-web/info/account/checkRegisterParams',
        type: 'post',
        data: params,
        success: function (data) {
          if (data.status === 'C0000') {
            $('#firstStep').hide();
            $('#secondStep').show();
            layer.closeAll();
            _this.trigger('passwordFocusEvent');
          } else {
            layer.msg(data.message);
          }
        }
      });
    },
    passwordFocusEvent: function () {
      var _this = this;
      $('#password').off().on('blur', function () {
        _this.validateAccount2({ password: this.value });
      });

      $('#passwordAgain').off().on('blur', function () {
        _this.validateAccount2({
          password: $('#password').val(),
          passwordAgain: this.value
        });
      });
    }
  },
  events: {
    'click .js-next': 'nextStep',
    'click .js-register': 'registerAccount',
    'click .get-code-btn': 'getCodeProcess',
    'blur #userName': 'validateUserName',
    'blur #mobileNo': 'validateMobile'
  },
  mixins: [{
    validateAccount: function (opts) {
      this.$('.login-error-message').remove();
      var msg = '';
      var extMsg = '';
      if (!opts.userName || opts.userName.length > 5) {
        extMsg = '请输入正确姓名';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#userName').parent().after(msg);
        this.$('#userName').focus();
        return false;
      } else if (!this.select.value) {
        extMsg = '请选择城市';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#cityId').parent().after(msg);
        this.$('#cityId').focus();
        return false;
      } else if (opts.companyName && opts.companyName.length > 20) {
        extMsg = '经纪公司名称过长，请重新输入';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#companyName').parent().after(msg);
        this.$('#companyName').focus();
        return false;
      } else if (opts.storeName && opts.storeName.length > 20) {
        extMsg = '分店名称过长，请重新输入';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#storeName').parent().after(msg);
        this.$('#storeName').focus();
        return false;
      } else if (!opts.mobileNo.match(/^1(3[0-9]|4[57]|5[0-35-9]|7[0135678]|8[0-9]|9[0-9])\d{8}$/)) {
        extMsg = '请输入正确的手机号';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#mobileNo').parent().after(msg);
        this.$('#mobileNo').focus();
        return false;
      } else if (!opts.verifyCode) {
        extMsg = '请输入验证码';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#mobileNo').parent().after(msg);
        this.$('#verifyCode').focus();
        return false;
      } else if (!opts.alreadyRead) {
        extMsg = '注册新用户必须同意《楼讯经纪用户服务协议》！';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#alreadyRead').parent().after(msg);
        this.$('#alreadyRead').focus();
        return false;
      } else if (!opts.mobileNo.match(/^1(3[0-9]|4[57]|5[0-35-9]|7[0135678]|8[0-9]|9[0-9])\d{8}$/)) {
        extMsg = '请输入正确的手机号';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#mobileNo').parent().after(msg);
        this.$('#mobileNo').focus();
        return false;
      }

      return true;
    },
    validateAccount1: function (opts) {
      this.$('.login-error-message').remove();
      var msg = '';
      var extMsg = '';
      if (!opts.userName || opts.userName.length > 5) {
        extMsg = '请输入正确姓名';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#userName').parent().after(msg);
        this.$('#userName').focus();
        return false;
      } else if (!opts.cityId) {
        extMsg = '请选择城市';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#cityId').parent().after(msg);
        this.$('#cityId').focus();
        return false;
      } else if (!opts.mobileNo.match(/^1(3[0-9]|4[57]|5[0-35-9]|7[0135678]|8[0-9]|9[0-9])\d{8}$/)) {
        extMsg = '请输入正确的手机号';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#mobileNo').parent().after(msg);
        this.$('#mobileNo').focus();
        return false;
      } else if (!opts.verifyCode) {
        extMsg = '请输入验证码';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#mobileNo').parent().after(msg);
        this.$('#verifyCode').focus();
        return false;
      } else if (!opts.alreadyRead) {
        extMsg = '注册新用户必须同意《楼讯经纪用户服务协议》！';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#alreadyRead').parent().after(msg);
        this.$('#alreadyRead').focus();
        return false;
      }

      return true;
    },
    validateAccount2: function (opts) {
      this.$('.login-error-message').remove();
      var msg = '';
      var extMsg = '';
      if (
        !opts.password.match(/^\d{6,16}$|^[a-zA-Z]{6,16}$|^[a-zA-Z](?![a-zA-Z]+$)[0-9A-Za-z]{5,15}$/)
      ) {
        extMsg = '请按密码规则输入6~16位密码';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#password').parent().after(msg);
        this.$('#password').focus();
        return false;
      } else if (opts.passwordAgain && (opts.passwordAgain !== opts.password)) {
        extMsg = '两次密码不一致';
        msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#passwordAgain').parent().after(msg);
        this.$('#passwordAgain').focus();
        return false;
      }

      return true;
    }
  }],
  handle: {
    nextStep: function () {
      var _this = this;
      var userName = _this.$('#userName').val().trim();
      var mobileNo = _this.$('#mobileNo').val().trim();
      var verifyCode = _this.$('#verifyCode').val().trim();
      var alreadyRead = _this.$('#alreadyRead').is(':checked');


      _this.userInfo = {
        userName: userName,
        cityId: _this.select.value && _this.select.value.id,
        mobileNo: mobileNo,
        verifyCode: verifyCode,
        alreadyRead
      };


      var flag = _this.validateAccount1(_this.userInfo);


      // validate user infomation,if false,alert the message

      if (flag) {
        var storeParams = _this.refs.storeNumber.listen.getParams.call(_this.refs.storeNumber);

        _this.finalParams = {  // 后台 改了字段名字
          name: _this.userInfo.userName,
          areaId: _this.userInfo.cityId,
          mobile: _this.userInfo.mobileNo,
          verifyCode: _this.userInfo.verifyCode
        };
        if (!storeParams) {
          layer.confirm('分店码未绑定，确定要下一步吗？', function () {
            _this.trigger('checkRegisterParams', _this.finalParams);
          });
        } else {
          _this.trigger('checkRegisterParams', $.extend({}, _this.finalParams, storeParams));
        }
      }
    },

    registerAccount: function () {
      var _this = this;
      var password = this.$('#password').val().trim();
      var passwordAgain = this.$('#passwordAgain').val().trim();

      var flag = this.validateAccount2({ password, passwordAgain });

      if (flag) {
        var storeParams = _this.refs.storeNumber.listen.getParams.call(_this.refs.storeNumber);
        _this.finalParams.password = password;
        _this.finalParams.repeatPassword = passwordAgain;

        $.ajax({
          url: '/newhouse-web/info/account/register',
          type: 'post',
          data: $.extend(_this.finalParams, storeParams),
          success: function (data) {
            if (data.status === 'C0000') {
              _this.trigger('openSuccessTip');
            } else {
              layer.msg(data.message);
            }
          }
        });
      }
    },

    getCodeProcess: function () {
      this.$('.login-error-message').remove();
      var mobileNo = this.$('#mobileNo').val().trim();
      if (!mobileNo.match(/^1(3[0-9]|4[57]|5[0-35-9]|7[0135678]|8[0-9]|9[0-9])\d{8}$/)) {
        var extMsg = '请输入正确的手机号';
        var msg = domPrefixStr + extMsg + domSuffixStr;
        this.$('#mobileNo').parent().after(msg);
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
        d.type = 'register';

        // ready to sending code
        var _this = this;
        d.callback = function () {
          var t = '60';
          var i = setInterval(function () {
            _this.$('.get-code-btn').addClass('disable').text(t + 's之后再获取');
            --t;
            if (t === -1) {
              clearInterval(i);
              _this.$('.get-code-btn').removeClass('disable').text('获取验证码');
            }
          }, 1000);
        };
      });
    },

    validateUserName: function (e) {
      var $ele = this.$(e.target);
      $ele.parent().next('.login-error-message').remove();
      var userName = $ele.val().trim();
      if (!userName || userName.length > 5) {
        var extMsg = '请输入正确姓名';
        var msg = domPrefixStr + extMsg + domSuffixStr;
        $ele.parent().after(msg);
      }
    },

    validateMobile: function (e) {
      var $ele = this.$(e.target);
      $ele.parent().next('.login-error-message').remove();
      var mobile = $ele.val().trim();
      if (!mobile.match(/^1(3[0-9]|4[57]|5[0-35-9]|7[0135678]|8[0-9]|9[0-9])\d{8}$/)) {
        var extMsg = '请输入正确的手机号';
        var msg = domPrefixStr + extMsg + domSuffixStr;
        $ele.parent().after(msg);
      }
    }
  }
};
