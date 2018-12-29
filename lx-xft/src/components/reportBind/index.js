var coala = require('coala');
// var config = require('config');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
var tpl = require('./index.html');
var header = require('components/header');
var layer = require('components/layer');
var storeNumber = require('components/storeNumber');
var successTip = require('./successTip');
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
      el: '#storeNumber',
      isRequired: true
    }
  },
  listen: {
    init: function () {
      var uid = amplify.store.sessionStorage('uid');
      var infoMenu = null;
      if (uid) {
        infoMenu = amplify.store.sessionStorage('infoMenu_' + uid);
        infoMenu && (this.data = { name: infoMenu.name, phone: infoMenu.userName });
        this.brokerId = infoMenu.id;
      }
    },
    // 提交成功后
    openSuccessTip: function () {
      var index = layer.open({
        type: 1,
        area: ['420px', '290px'],
        title: '&nbsp;',
        content: '<div id="success-tip-content"></div>',
        cancel: function () {
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
        }
      });
      // var $title = $('#layui-layer' + index + ' .layui-layer-title');
      var d = coala.mount(successTip, '#success-tip-content');
      d.index = index;
      // 传分店过去
      d.data.storeName = this.storeName;
      d.data.companyName = this.companyName;
      d.data.storeId = this.storeId;
      d.trigger('render');
    },

    twiceConfirm: function (subInfo, storeParams) {
      var _this = this;

      var confirmIndex = layer.confirm(
        `<p style="color:#00b4ed;text-align:center;font-size:14px;">${storeParams.companyName}&nbsp;&nbsp;&nbsp;&nbsp; ${storeParams.storeName} ?</p>`,
        { title: '确认要绑定到' },
        function () {
          $.ajax({
            url: '/newhouse-web/outreach/employee/bind',
            type: 'post',
            data: subInfo,
            success: function (data) {
              if (data.status === 'C0000') {
                _this.storeName = storeParams.storeName;
                _this.companyName = storeParams.companyName;
                _this.storeId = storeParams.storeId;
                var uid = amplify.store.sessionStorage('uid');
                var infoMenu = null;
                if (uid) {
                  infoMenu = amplify.store.sessionStorage('infoMenu_' + uid);
                  infoMenu.storeId = storeParams.storeId;
                  amplify.store.sessionStorage('infoMenu_' + uid, infoMenu);
                }
                _this.trigger('openSuccessTip');
              } else {
                layer.msg(data.message);
              }
            }
          });
          layer.close(confirmIndex);
        });
    }
  },
  events: {
    'click .login-btn': 'reportBind'
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
      }

      return true;
    }
  }],
  handle: {
    reportBind: function () {
      var _this = this;
      // 提交 名字 手机号  绑定的分店等信息
      var storeParams = _this.refs.storeNumber.listen.getParams.call(_this.refs.storeNumber);
      // console.log(storeParams);
      var subInfo = {
        brokerId: this.brokerId,
        storeId: storeParams.storeId,
        companyId: storeParams.companyId
      };
      // console.log(subInfo);
      if (!storeParams) {
        layer.msg('请绑定分店');
        return;
      }

      _this.trigger('twiceConfirm', subInfo, storeParams);
    }
  }
};
