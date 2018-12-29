var coala = require('coala');
var config = require('config');

var utils = require('../../../../utils');
var pagination = require('components/pagination');
var dealReport = require('../dealReport');
var reportDetail = require('../reportDetail');
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
      this.reportTb.load(this.parent.queryParams);
    },
    initReportTb: function (queryParams) {
      var _this = this;
      this.reportTb = this.$('#reportTb').table({
        cols: [{
            title: '经纪人',
            name: 'employeeName',
            width: 140
          },
          {
            title: '报备客户',
            name: 'customerName',
            width: 140,
          },
          {
            title: '报备楼盘',
            name: 'gardenName',
            width: 200,
          },
          {
            title: '状态',
            name: 'status',
            width: 100,
            // renderer: function (value, item) {
            //   var statusObj = {
            //     BACKLOG: '报备待确认',
            //     SUCCESSFUL: '报备成功',
            //     REPETITIVE: '报备重复',
            //     OVERDUE: '报备过期',
            //     YES: '带看成功',
            //     GUIDE_OVERDUE: '带看过期',
            //     WILLOVERDUE: '带看即将过期'
            //   };
            //   return statusObj[item.status];
            // }
          },
          {
            title: '报备时间<div class="sort-container" data-type="reservationTime"><a class="pr js-sort-up"><span class="up-arrow"></span></a><a class="pr js-sort-down"><span class="down-arrow"></span></a></div>',
            name: 'paidCommission',
            width: 200,
            renderer: function (val, item, rowIndex) {
              return item.submitTime && item.submitTime.substring(0, 10);
            }
          },
          {
          title: '操作',
          width: 178,
          renderer: function(a, item) {
            return '<a href="javascript:;" class="js-view" data-id="' + item.reservationId + '">查看详情</a>';
          }
        }
        ],
        params: queryParams,
        method: 'get',
        url: '/newhouse-web/distribution/org/orgReservations',
        transform: function (data) {
          if (data.result) {
            return data.result;
          }
        },
        showBackboard: false,
        // fullWidthRows: true,
        height: 'auto'
      });
      this.reportTb.on('loadSuccess', function (e, data) {
        if (data.result) {
          var pageParam = {
            currentPage: data.result.currentPage,
            pageCount: data.result.pageCount,
            pageSize: data.result.pageSize,
            totalCount: data.result.recordCount
          };
          if (data.result.recordCount > data.result.pageSize) {
            _this.$('#count').html(data.result.recordCount)
            _this.$('#count').parent().removeClass('dn');
          } else {
            _this.$('#count').parent().addClass('dn');
          }
          _this.refs.pagination.trigger('refresh', pageParam);
        }
      });
    },
    loadTb: function (queryParams) {
      this.reportTb.load(queryParams);
    }

  },
  events: {
    // 状态查询
    'click #statusQuery .status-item:not(.cur)': 'statusQuery',
    'click .js-sort-up,.js-sort-down': 'sortProcess',
    'click .js-view': 'viewDetail'
  },
  handle: {
    // 状态查询
    statusQuery: function (e) {
      var $el = $(e.currentTarget);
      if (!this.parent.checkTime(this.parent.queryParams)) {
        return;
      }
      $el.addClass('cur').siblings('.cur').removeClass('cur');
      var status = $el.data('status') === 'ALL' ? null : $el.data('status');
      this.parent.queryParams.page = 1;
      this.parent.queryParams.status = status;
      this.trigger('loadTb', this.parent.queryParams);
    },
    sortProcess: function (e) {
      this.$('.sort-container').find('span.highlight').removeClass('highlight');
      var $ele = this.$(e.currentTarget);
      $ele.find('span').toggleClass('highlight');
      var orderByField = $ele.parent().data('type');
      var orderByType = $ele.find('span.highlight').hasClass('up-arrow') ? 'asc' : 'desc';
      this.parent.queryParams.orderByField = orderByField;
      this.parent.queryParams.orderByType = orderByType;
      this.parent.queryParams.page = 1;
      this.trigger('loadTb', this.parent.queryParams);
    },
    viewDetail: function(e) {

      var $el = this.$(e.target);
      var index = layer.open({
        type: 1,
        title: '报备详情',
        area: ['520px', '300px'],
        scrollbar: false,
        content: '<div id="reportDetail" class="report-wrapper"></div>',
        cancel: function() {
          layer.closeAll();
        }
      });

      var d = coala.mount(reportDetail, '#reportDetail');
      d.index = index;
      d.trigger('fetch', { reservationId: $el.data('id'), url: '/newhouse-web/distribution/personal/reservationDetail' });

    }
  }
};
