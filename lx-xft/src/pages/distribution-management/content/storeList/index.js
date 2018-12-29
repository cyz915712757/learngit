var coala = require('coala');

var config = require('config');
var layer = require('components/layer');

var pagination = require('components/pagination');

var tpl = require('./index.html');

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
      this.storeTb.load(this.parent.queryParams);
    },
    initStoreTb: function (queryParams) {
      var _this = this;
      this.storeTb = this.$('#storeTb').table({
        cols: [{
            title: '分店',
            name: 'storeName',
            width: 198
          },
          {
            title: '成交价格',
            name: 'dealPrice',
            width: 190,
            renderer: function (val, item, rowIndex) {
              return item.dealPrice + '元';
            }
          },
          {
            title: '应结佣金',
            name: 'totalCommission',
            width: 190,
            renderer: function (val, item, rowIndex) {
              return item.totalCommission + '元';
            }
          },
          {
            title: '已结佣金',
            name: 'paidCommission',
            width: 190,
            renderer: function (val, item, rowIndex) {
              return item.paidCommission + '元';
            }
          }, {
            title: '未结佣金',
            name: 'unPaidCommission',
            width: 190,
            renderer: function (val, item, rowIndex) {
              return item.unPaidCommission + '元';
            }
          }
        ],
        params: queryParams,
        method: 'get',
        url: '/newhouse-web/distribution/org/storeResultsList',
        transform: function (data) {
          if (data.result) {
            /* var pageParam = {
               currentPage: data.result.currentPage,
               pageCount: data.result.pageCount,
               pageSize: 1,
               totalCount: data.result.recordCount
             };
             _this.refs.pagination.trigger('refresh', pageParam);*/
            return data.result;
          }
        },
        showBackboard: false,
        height: 'auto'
      });
    },
    loadTb: function (queryParams) {
      this.storeTb.load(queryParams);
    }
  },
  events: {
    'click .js-view': 'viewDetail',
  },

  handle: {
    viewDetail: function (e) {
      var $el = $(e.currentTarget);
      if (!this.parent.checkTime()) {
        return;
      }
      var index = layer.open({
        type: 1,
        shadeClose: true,
        area: ['800px', '440px'],
        title: $el.data('name'),
        content: '<div id="detailDialogbox"></div>'
      });
      var detail = coala.mount(detailDialog, '#detailDialogbox');
      detail.data.storeId = $el.data('id');
      detail.data.pram = {
        startDate: $('#startDate').val() || null,
        endDate: $('#endDate').val() || null,
        storeId: $el.data('id')
      };
      detail.trigger('render');
    }
  }
};
