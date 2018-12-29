var tpl = require('./index.html');
require('./index.css');
var mixin = require('../publicMixin.js');
var pagination = require('components/extPagination');
var utils = require('utils');

module.exports = {
  tpl: tpl,
  refs: {
    pagination: {
      component: pagination,
      el: '#repeatPage'
    }
  },
  listen: {

    jump: function(page, pageSize) {
      this.repeatTb.load({ page: page });
    },

    render: function(opts) {
      //初始化表格数据
      var _this = this;
      this.repeatTb = this.$('#repeatTb').table({
        cols: [
          { title: '客户姓名', name: 'customerName', width: 120 },
          { title: '手机', name: 'phone', width: 80 },
          { title: '来源', name: 'source', width: 120 }, {
            title: '客户意向',
            name: 'intentionCityName',
            renderer: function(val, item, rowIndex) {
              var intention = mixin.publicIntention(item);
              return '<div class="ellips" title="' + intention + '">' + intention + '</div';
            },
            width: 220
          }, {
            title: '导入日期<div class="sort-container" data-type="importDateTime"><a class="pr js-sort-up"><span class="up-arrow"></span></a><a class="pr js-sort-down"><span class="down-arrow"></span></a></div>',
            name: 'importDate',
            width: 100,
            align: 'left',
            renderer: function(val, item, rowIndex) {
              return utils.formatDate(item.importDate);
            }
          }, {
            title: '导入批次',
            name: 'importBatch',
            width: 168
          }
        ],
        multiSelect: true,
        checkCol: true,
        method: 'get',
        url: '/newhouse-web/customer/resources/repeatItems',
        root: 'result',
        transform: function(data) {
          return data.result.items;
        },
        showBackboard: false,
        height: 'auto'
        // fullWidthRows: true
      });

      this.repeatTb.on('loadSuccess', function(e, data) {
        if (data.result) {
          var pageParam = {
            currentPage: data.result.currentPage,
            pageCount: data.result.pageCount,
            pageSize: data.result.pageSize,
            totalCount: data.result.recordCount
          };

          _this.page = pageParam.currentPage;
          _this.pageLength = data.result.items.length;
          _this.refs.pagination.trigger('refresh', pageParam);

          var itemsArr = data.result.items;
          if (itemsArr.length > 0) {
            var t = {};
            $.each(itemsArr, function(index, el) {
              t[el.phone] = { phone: el.phone, index: index };
            });
            _this.repeatTb.data('mmGrid').select(function(item, index) {
              var temp = t[item.phone].index;
              if (temp != index) {
                return true
              }
            });
          }
        }
      });


    }
  },

  events: {
    'click .js-repeat': 'repeatCustomer',
    'click .js-clear-repeat': 'clearRepeat'
  },

  handle: {
    repeatCustomer: function(e) {
      var rows = this.repeatTb.selectedRows();
      if (rows.length) {
        var ids = [];
        var _this = this;
        for (var i = 0, j = rows.length; i < j; i++) {
          ids.push(rows[i].id);
        }
        var params = {
          ids: ids.join(',')
        };
        $.ajax({
          url: '/newhouse-web/customer/resources/deleteByIds',
          data: params,
          success: function(data) {
            if (data.status === 'C0000') {
              layer.msg(data.message);

              if (_this.pageLength < 15 && _this.page !== 1) {
                _this.repeatTb.load({ page: _this.page - 1 });
              } else {
                _this.repeatTb.load({ page: _this.page });
              }

            }
          }
        });
      } else {
        layer.msg('请选择需要删除的资料客！');
      }
    },

    clearRepeat: function(e) {
      var _this = this;
      layer.confirm('确认一键删除所有重复资料客吗？', function() {
        $.ajax({
          url: '/newhouse-web/customer/resources/deleteRepeatOneKey',
          success: function(data) {
            if (data.status === 'C0000') {
              layer.msg(data.message);
              _this.repeatTb.load();
            }
          }
        });
      });
    }
  }
}
