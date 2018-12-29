var tpl = require('./index.html');
require('./index.css');
var mixin = require('../privateMixin.js');
var utils = require('utils');

module.exports = {
  tpl: tpl,
  listen: {

    render: function(opts) {
      this.trigger('initCustomerSelect',opts);
      this.params = {
        left: '离职',
        storeManager: 'manager',
        employeeErpId: '1'
      };
      //初始化表格数据
      var _this = this;
      this.changeTb = this.$('#changeTb').table({
        cols: [
          { title: '姓名', name: 'customerName', width: 90 },
          { title: '手机', name: 'phone', width: 90 },
          { title: '来源', name: 'source', width: 100 }, {
            title: '客户意向',
            name: 'intentionCityName',
            renderer: function(val, item, rowIndex) {
              var intention = mixin.privateIntention(item);
              return '<div class="ellips" title="' + intention + '">' + intention + '</div';
            },
            width: 210
          }, {
            title: '未跟进天数',
            name: 'notFollowNum',
            width: 100,
            renderer: function(val, item, rowIndex) {
              return item.notFollowNum ? '<strong sytle="color:#333">' + item.notFollowNum + '天</strong>' : '';
            }
          }, {
            title: '登记时间',
            name: 'registerDate',
            width: 120,
            renderer: function(val, item, rowIndex) {
              return utils.formatDate(item.registerDate);
            }
          }
        ],
        params: this.params,
        multiSelect: true,
        checkCol: true,
        method: 'get',
        url: '/newhouse-web/customer/private/staff/change/list',
        root: 'result',
        transform: function(data) {
          return data.result.items;
        },
        showBackboard: false,
        height: 'auto'
          // fullWidthRows: true
      });
    },
    initCustomerSelect: function(opts) {
      var _this = this;
      this.outterCustomer = $('#outterCustomer').select({
        url: '/newhouse-web/customer/private/staff/getLeftBroker',
        search: true,
        notFoundFormater: function() {
          return '<div style="color: red;">暂无离职经纪人</div>';
        },
        keyword: 'keyword',
        params: { longNumber: opts.longNumber },
        dataFormater: function(data) {
          if (data.result) {
            $.each(data.result, function(index, ele) {
              ele.name = ele.name + ' (离职)';
            });
          }
          return data.result;
        },
        idField: 'erpId',
        width: 155,
        highlight: true
      });

      $('#outterCustomer').on('bs.select.select', function(e, value, select) {
        _this.params.employeeErpId = value.erpId;
        _this.changeTb.load(_this.params);
      });

      $('#outterCustomer').on('bs.select.clear', function(e, value, select) {
        _this.params.employeeErpId = '';
      });

      $('#innerCustomer').on('bs.select.select', function(e, value, select) {
        _this.params.innerCustomer = value.id;
      });

      $('#innerCustomer').on('bs.select.clear', function(e, value, select) {
        _this.params.innerCustomer = '';
      });
      this.innerCustomer = $('#innerCustomer').select({
        url: '/newhouse-web/customer/private/staff/getBroker',
        search: true,
        keyword: 'keyword',
        params: { longNumber: opts.longNumber },
        notFoundFormater: function() {
          return '<div style="color: red;">找不到数据哦</div>';
        },
        noDataFormater: '<div style="color: green;">没有数据哦</div>',
        dataFormater: function(data) {
          return data.result;
        },
        idField: 'erpId',
        width: 155,
        highlight: true
      });
    }
  },

  events: {
    'click .js-ensure': 'changeCustomer'
  },

  handle: {
    changeCustomer: function(e) {
      var rows = this.changeTb.selectedRows();
      var outterCustomer = this.params.employeeErpId;
      var innerCustomer = this.params.innerCustomer;
      if (outterCustomer && innerCustomer) {
        if (rows.length) {
          var ids = [];
          var _this = this;
          for (var i = 0, j = rows.length; i < j; i++) {
            ids.push(rows[i].id);
          }
          var params = {
            ids: ids.join(','),
            sourceUserId: outterCustomer,
            targetUserId: innerCustomer
          };

          $.ajax({
            url: '/newhouse-web/customer/private/staff/batchTransferCustomer',
            data: params,
            success: function(data) {
              if (data.status === 'C0000') {
                layer.msg(data.message);
                _this.changeTb.load(_this.params);
              }
            }
          });

        } else {
          layer.msg('请选择私客！');
        }
      } else {
        layer.msg('请选择经纪人');
      }


    }
  }
}
