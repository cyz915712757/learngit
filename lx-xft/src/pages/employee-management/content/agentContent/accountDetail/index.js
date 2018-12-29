var coala = require('coala');
var config = require('config');
var layer = require('components/layer');
// var utils = require('../../../../utils');

var editAccount = require('../editAccount');
var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  data: {
    initFlag: true
  },
  listen: {
    render: function () {
      this.trigger('getDetail');
      this.trigger('getRecord');
    },
    mount: function () {

    },
    getRecord: function () {
      var _this = this;
      $.ajax({
        type: 'GET',
        url: '/newhouse-web/outreach/employee/detailEmp',
        data: {
          brokerId: _this.data.brokerId
        },
        dataType: 'json',
        success: function (data) {
          if (data.status == 'C0000') {
            _this.data.initFlag = false;
            _this.data.record = data.result && data.result.items;
            _this.update();
          }
        }
      });
    },
    getDetail: function () {
      var _this = this;
      $.ajax({
        type: 'GET',
        url: '/newhouse-web/outreach/employee/detailBroker',
        data: {
          brokerId: _this.data.brokerId
        },
        dataType: 'json',
        success: function (data) {
          if (data.status == 'C0000') {
            if (data.result && data.result.showPhotoUrl && data.result.showPhotoUrl.indexOf('{size}') > -1) {
              data.result.showPhotoUrl = data.result.showPhotoUrl.replace('{size}', '130x130');
            }
            _this.detail = data.result;
            _this.data = $.extend(_this.data, data.result);
            _this.data.storeNumber = data.result.store.storeNumber;
            _this.update();
          }
        }
      });
    }
  },
  events: {
    // 恢复
    'click #recovery': 'recovery',
    // 离职
    'click .js-resign': 'resign',
    // 暂停
    'click #stop': 'stop',
    // 修改
    'click #modify': 'modify'
  },

  handle: {
    // 恢复
    recovery: function (e) {
      var $el = $(e.currentTarget);
      var _this = this;
      var index = layer.open({
        skin: 'open-title',
        type: 1,
        shadeClose: true,
        area: ['375px', '160px'],
        title: '&nbsp',
        content: '<div class="tip-box querist-box pr"><i class="iconfont icon-wenhao1"></i>请确认是否恢复该账号使用</div>',
        btn: ['确定'],
        yes: function (index, layero) {
          $.ajax({
            type: 'POST',
            url: '/newhouse-web/outreach/employee/resume',
            data: {
              brokerId: _this.data.brokerId
            },
            dataType: 'json',
            success: function (data) {
              if (data.status == 'C0000') {
                _this.data.status = 'OCCUPIED';
                setTimeout(function () {
                  layer.close(index);
                }, 1500);
                _this.update();
                // 列表刷新
                _this.parent.trigger('loadTb');
                _this.parent.refs.summary.trigger('getSummary');
              } else {
                layer.msg(data.message);
              }
            }
          });
        }
      });
    },
    // 离职
    resign: function (e) {
      var _this = this;
      var $el = $(e.currentTarget);
      var index = layer.open({
        skin: 'open-title',
        type: 1,
        shadeClose: true,
        area: ['375px', '160px'],
        title: '&nbsp',
        content: '<div class="tip-box warn-box pr"><i class="iconfont icon-gantanhao"></i>离职后经纪人将不能登录新房通</div>',
        btn: ['确定'],
        yes: function (index, layero) {
          // layer.close(index); //如果设定了yes回调，需进行手工关闭
          $.ajax({
            type: 'POST',
            url: '/newhouse-web/outreach/employee/left',
            data: {
              brokerId: _this.data.brokerId
            },
            dataType: 'json',
            success: function (data) {
              if (data.status == 'C0000') {
                setTimeout(function () {
                  layer.closeAll();
                }, 1500);
                _this.parent.refs.summary.trigger('getSummary');
                _this.parent.trigger('loadTb');
              } else {
                layer.msg(data.message);
              }
            }
          });
        }
      });
    },
    // 暂停
    stop: function (e) {
      var _this = this;
      var $el = $(e.currentTarget);
      var index = layer.open({
        skin: 'open-title',
        type: 1,
        shadeClose: true,
        area: ['375px', '160px'],
        title: '&nbsp',
        content: '<div class="tip-box warn-box pr"><i class="iconfont icon-gantanhao"></i>暂停后经纪人将不能登录新房通</div>',
        btn: ['确定'],
        yes: function (index, layero) {
          $.ajax({
            type: 'POST',
            url: '/newhouse-web/outreach/employee/pause',
            data: {
              brokerId: _this.data.brokerId
            },
            dataType: 'json',
            success: function (data) {
              if (data.status == 'C0000') {
                _this.data.status = 'PAUSED';
                _this.update();
                setTimeout(function () {
                  layer.close(index);
                }, 1500);
                _this.parent.refs.summary.trigger('getSummary');
                _this.parent.trigger('loadTb');
              } else {
                layer.msg(data.message);
              }
            }
          });
        }
      });
    },
    // 修改
    modify: function (e) {
      var $el = $(e.currentTarget);
      var index = layer.open({
        type: 1,
        shadeClose: true,
        area: ['580px', '470px'],
        title: '修改资料',
        content: '<div id="editAccount"></div>'
      });
      var edit = coala.mount(editAccount, '#editAccount');
      var configObj = {
        type: 'modify',
        getItem: this.data,
        ajaxUrl: 'updateBroker'
      };
      // 挂载父亲
      edit.parent = this;
      edit.index = index;
      edit.trigger('render', configObj);
    }

  }

};
