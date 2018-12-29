var coala = require('coala');
var config = require('config');

var utils = require('../../../../utils');
var pagination = require('components/pagination');
var dealReport = require('../dealReport');
var tpl = require('./index.html');
// 成交列表
module.exports = {
  tpl: tpl,
  refs: {
    pagination: {
      component: pagination,
      el: '#pubPage'
    }
  },
  listen: {
    jump: function (page, pageSize) {
      this.parent.queryParams.page = page;
      this.dealTb.load(this.parent.queryParams);
    },
    initDealTb: function (queryParams) {
      var _this = this;
      this.dealTb = this.$('#dealTb').table({
        cols: [{
            title: '成交楼盘',
            name: 'dealGarden',
            width: 94
          },
          {
            title: '房号',
            name: 'roomNumber',
            width: 98,
            renderer: function (val, item, rowIndex) {
              return '<p class="ellips" style="margin:0" title="' + item.roomNumber + '">' + item.roomNumber + '</p>';
            }
          },
          {
            title: '成交价格',
            name: 'dealPrice',
            width: 94,
            renderer: function (val, item, rowIndex) {
              return item.dealPrice + '元';
            }
          },
          {
            title: '应结佣金',
            name: 'totalCommission',
            width: 94,
            renderer: function (val, item, rowIndex) {
              return item.totalCommission + '元';
            }
          },
          {
            title: '已结佣金',
            name: 'paidCommission',
            width: 94,
            renderer: function (val, item, rowIndex) {
              return item.paidCommission + '元';
            }
          },
          {
            title: '未结佣金',
            name: 'unPaidCommission',
            renderer: function (val, item, rowIndex) {
              return item.unPaidCommission + '元';
            }
          },
          {
            title: '成交经纪人',
            name: 'dealEmployee',
          },
          {
            title: '上数日期 ',
            name: 'bargainDate',
            width: 94,
            renderer: function (val, item, rowIndex) {
              return item.bargainDate && item.bargainDate.substring(0, 10);
            }
          },
          {
            title: '成交状态 ',
            width: 94,
            name: 'statusDesc',
          },
          {
            title: '操作 ',
            width: 96,
            renderer: function (val, item, rowIndex) {
              // 查看交易报告 传交易id过去即可
              return '<a class = "op-a js-view" data-deal-employee-id="' + item.dealEmployeeId + '" data-report-id="' + item.id + '">查看交易报告</a>';
            }
          }
        ],
        params: queryParams,
        method: 'get',
        url: '/newhouse-web/distribution/org/dealList',
        transform: function (data) {
          if (data.result) {
            return data.result;
          }
        },
        showBackboard: false,
        // fullWidthRows: true,
        height: 'auto'
      });
      this.dealTb.on('loadSuccess', function (e, data) {
        if (data.result) {
          var pageParam = {
            currentPage: data.result.currentPage,
            pageCount: data.result.pageCount,
            pageSize: data.result.pageSize,
            totalCount: data.result.recordCount
          };
          _this.refs.pagination.trigger('refresh', pageParam);
        }
      });
    },
    loadTb: function (queryParams) {
      this.dealTb.load(queryParams);
    }

  },
  events: {
    'click .js-view': 'viewReport',
    // 状态查询
    'click #statusQuery .status-item:not(.cur)': 'statusQuery'
  },
  handle: {
    viewReport: function (e) {
      //查看交易报告
      var $el = $(e.currentTarget);
      var index = layer.open({
        type: 1,
        title: '交易报告',
        area: ['580px', '490px'],
        move: false,
        scrollbar: false,
        content: '<div id="dealReport" class="deal-report"></div>',
        cancel: function () {
          layer.closeAll();
        }
      });
      var param = {
        id: $el.data('reportId'),
        url: '/newhouse-web/distribution/org/report',
        dealEmployeeId: $el.data('dealEmployeeId'),
      };
      var d = coala.mount(dealReport, '#dealReport');
      d.index = index;
      d.trigger('fetch', param);
    },
    // 状态查询
    statusQuery: function (e) {
      var $el = $(e.currentTarget);
      if (!this.parent.checkTime(this.parent.queryParams)) {
        return;
      }
      $el.addClass('cur').siblings('.cur').removeClass('cur');
      var status = $el.data('status') === 'ALL' ? null : $el.data('status');

      this.parent.queryParams.page = 1;
      this.parent.queryParams.dealStatus = status;
      this.trigger('loadTb', this.parent.queryParams);
    }
  }
};
