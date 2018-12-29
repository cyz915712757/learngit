var coala = require('coala');
var layer = require('components/layer');
var tpl = require('./index.html');
require('./index.css');

var amplify = require('vendors/amplify/amplify.store.min').amplify;
var detailMixin = require('../../privateMixin.js');

var dialMixin = require('../../dialMixin.js');
var changePublic = require('../../changePublic');

var Dial = require('../../../../../dial.js');
//获取开通拨号权限
var dialFlag = amplify.store.sessionStorage('userConfig').dial_status.open;
var dialType = amplify.store.sessionStorage('userConfig').dial_type.value;

module.exports = {
  tpl: tpl,
  listen: {
    getPrivateDetail: function(opts) {
      var _this = this;
      _this.id = opts.id;
      _this.type = opts.type;
      _this.typeDetail = opts.typeDetail;
      _this.customerId = opts.customerId;
      _this.batch = opts.batch;
      //获取私客详情接口
      $.ajax({
        type: 'get',
        url: '/newhouse-web/customer/' + _this.type + '/getItem',
        data: {
          id: opts.id,
        },
        success: function(data) {
          if (data.status === 'C0000') {
            _this.data = data.result;
            if (_this.typeDetail) {
              _this.data.phone = _this.data.phone.replace(/([\s\S]{3})([\s\S]{4})/, '$1****');
            }
            _this.data.privateIntation = detailMixin.privateIntention(_this.data);
            _this.data.type = _this.type;
            _this.data.typeDetail = _this.typeDetail;
            _this.data.dialFlag = dialFlag;
            _this.update();
            if (!_this.typeDetail) {
              _this.$('.search-baidu').css('display', 'inline-block');
            }
          }
        }
      });
    },
    getItemDetail: function() {
      this.trigger('getPrivateDetail', { id: this.id, type: this.type, typeDetail: this.typeDetail });
    }
  },
  events: {
    'click .js-change-public': 'changePublic',
    'click .js-change-private': 'changePrivate',
    'click .js-edit': 'editInfo',
    'click .js-dial': 'dialHandle',
  },
  handle: {
    changePublic: function(e) {
      var $el = this.$(e.target);
      var index = layer.open({
        type: 1,
        title: '客户转公',
        area: ['440px', '205px'],
        move: false,
        scrollbar: false,
        content: '<div id="changePublic" class="change-public"></div>'
      });

      var d = coala.mount(changePublic, '#changePublic');
      d.index = index;
      d.parent = this;
      d.trigger('render', { id: this.id, customerName: this.data.customerName, phone: this.data.phone });
    },

    changePrivate: function(e) {
      var _this = this;
      $.ajax({
        type: 'GET',
        data: { id: this.id },
        url: '/newhouse-web/customer/' + _this.type + '/getItem',
        success: function(data) {
          if (data.status == 'C0000') {
            var configObj = {
              id: _this.id,
              type: _this.type,
              getitem: data.result,
              sendUrl: _this.type + '/toPrivate',
              batch: _this.batch
            };
            _this.parent.parent.editFun(_this.type === 'public' ? '公客转私' : '资源客转私', configObj);
          } else if (data.status == 'CUSTOMER0023') {
            /*已经转私*/
            layer.msg('对不起!此客户已被他人转私');
            _this.parent.parent.changeStatus(_this.id, '已被他人转私');
          } else {
            layer.msg(data.message);
          }
        }
      });

    },

    editInfo: function(e) {
      var _this = this;
      $.ajax({
        type: 'GET',
        data: { id: this.id },
        url: '/newhouse-web/customer/private/getItem',
        success: function(data) {
          if (data.status == 'C0000') {
            var configObj = { id: _this.id, customerId: _this.customerId, type: 'edit', getitem: data.result, sendUrl: 'private/save', tb: _this.privateTb };
            _this.parent.parent.editFun('编辑客户资料', configObj);
          } else {
            /*已经转私*/
            layer.msg(data.message);
          }
        }
      });
    },
    dialHandle: function(e) {
      var phone = this.data.phone;
      //获取今天已拨打次数
      dialMixin.getDialCount(phone);
      //拨打电话
      dialMixin.openDial(phone, this, dialType, Dial);
    }
  }
}
