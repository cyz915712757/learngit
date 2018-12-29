var coala = require('coala');
var tpl = require('./index.html');
var pagination = require('components/pagination');
var reportDetail = require('../../reportDetail');
var utils = require('utils');
require('./index.css');
module.exports = {
  tpl: tpl,
  refs: {
    pagination: {
      component: pagination,
      el: '#reportPage'
    }
  },
  listen: {
    mount: function() {
      var _this = this;
      this.params = { page: 1, pageSize: 15 };
      $(document).on('click', '.my-report .status-item', function(e) {
        var $ele = _this.$(e.currentTarget);
        _this.params.status = $ele.data('status');
        if ($ele.hasClass('current')) {
          return;
        } else {
          $ele.addClass('current').siblings('.current').removeClass('current');
          _this.params.page = 1;
          var params = $.extend({}, _this.params, _this.parent.params)
          _this.reportTable.load(params);
        }
      })
    },
    jump: function(page, pageSize) {
      this.params.page = page;
      var params = $.extend({}, this.params, this.parent.params)
      this.reportTable.load(params);
    },

    initTable: function(opts) {
      var _this = this;
      this.reportTable = $('#reportStoreTb').table({
        cols: [{
          title: '报备时间',
          name: 'submitTime',
          renderer: function(value, item) {
            return utils.formatDate(item.submitTime);
          }
        }, {
          title: '报备客户',
          name: 'customerName'
        }, {
          title: '客户电话',
          name: 'customerPhone'
        }, {
          title: '报备楼盘',
          name: 'gardenName',
          renderer: function(value, item, index) {
            return '<span class="js-view-peron" data-expand="' + item.expandId + '">' + item.gardenName + '</span>'
          }
        }, {
          title: '状态',
          name: 'status'
        }, {
          title: '操作',
          renderer: function(a, item) {
            return '<a href="javascript:;" class="js-view" data-id="' + item.reservationId + '">查看详情</a>';
          }
        }],
        params: opts,
        url: '/newhouse-web/distribution/personal/myReservations',
        transform: function(data) {
          return data.result.items;
        },
        showBackboard: false,
        height: 'auto',
        fullWidthRows: true
      });

      this.reportTable.on('loadSuccess', function(e, data) {
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
    }
  },
  events: {
    'click #reportSearchBtn': 'queryData',
    'click .js-report-reset': 'clearData',
    'click .js-view': 'viewDetail',
    'mouseenter .js-view-peron': 'viewPerson'
  },

  handle: {
    viewPerson: function(e) {
      var $ele = $(e.currentTarget);
      var gardenName = $ele.text();
      var expandId = $ele.data('expand');
      $.ajax({
        url: '/newhouse-web/garden/queryContacters',
        data: {
          expandId: expandId
        },
        success: function(data) {
          if (data.status === 'C0000') {
            var str = '<p class="view-garden-name">' + gardenName + ' - 案场人员</p>';
            $.each(data.result, function(index, val) {
              var person = val.split(',');
              str += '<p class="view-content"><span class="view-key">' + person[0] + '：</span><span class="view-value">' + person[1] + '</span></p>';
            });
            layer.tips(str, $ele, {
              tips: [3, '#fff'],
              id: 'acPerson'
            });
          }
        }
      });
    },

    queryData: function(e) {
      this.params.keyword = this.$('#reportKeyword').val();
      this.params.page = 1;
      var params = $.extend({}, this.params, this.parent.params)
      this.reportTable.load(params);
    },

    clearData: function(e) {
      if (this.params.status) {
        $('.my-report .status-item.current').removeClass('current');
        $('.my-report .status-wrapper li').eq(1).addClass('current');
      }
      this.params = {};
      this.$('#reportKeyword').val('');
      var params = $.extend({}, this.params, this.parent.params)
      this.reportTable.load(params);
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
