var coala = require('coala');
var layer = require('components/layer');
var config = require('config');
var pagination = require('components/pagination');
var dealReport = require('../dealReport');
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
      this.settleTb.load(this.parent.queryParams);
    },
    initSettleTb: function (queryParams) {
      var _this = this;
      this.settleTb = this.$('#settleTb').table({
        cols: [{
          title: '流水号',
          name: 'serialNumber',
          width: 108
        }, {
          title: '楼盘',
          name: 'dealGarden',
          width: 118
        }, {
          title: '房号',
          name: 'roomNumber',
          width: 112,
          renderer: function (val, item, rowIndex) {
            var settlementBillItems = item.settlementBillItems;
            if (settlementBillItems.length) {
              var roomNumberHtml = '';
              for (var i = 0; i < settlementBillItems.length; i++) {
                roomNumberHtml += '<a class="op-a js-report ellips" style="width: 100%;display: block;" title="' + settlementBillItems[i].roomNumber + '" data-deal-employee-id="' + settlementBillItems[i].dealEmployeeId + '" data-report-id="' + settlementBillItems[i].reportId + '">' + settlementBillItems[i].roomNumber + '</a>'
              }
              return roomNumberHtml
            } else {
              return null;
            }
          }
        }, {
          title: '结算金额',
          name: 'amount',
          width: 108,
          renderer: function (val, item, rowIndex) {
            var settlementBillItems = item.settlementBillItems;
            if (settlementBillItems.length) {
              var amountHtml = '';
              for (var i = 0; i < settlementBillItems.length; i++) {
                amountHtml += '<p style="margin:0">' + settlementBillItems[i].amount + '</p>'
              }
              return amountHtml
            } else {
              return null;
            }
          }
        }, {
          title: '合计金额',
          name: 'totalAmount',
          width: 108
        }, {
          title: '申请人',
          name: 'applyPersonName',
          width: 98
        }, {
          title: '申请日期',
          name: 'applyDate',
          width: 108,
          renderer: function (val, item, rowIndex) {
            return item.applyDate && item.applyDate.substring(0, 10);
          }
        }, {
          title: '申请状态',
          name: 'applyStatus',
          width: 108,
          renderer: function (val, item, rowIndex) {
            if (item.applyStatus == 'PREPARE') {
              return item.applyStatusDesc.substring(0, 5) + '&nbsp;<span style="color:#00b4ed">(邮寄资料)</span>';
            }
            return item.applyStatusDesc;
          }
        }, {
          title: '操作',
          name: 'op',
          width: 108,
          renderer: function (val, item, rowIndex) {
            var result = '<a class="op-a js-view" data-type="view" data-status="' + item.applyStatusDesc + '" data-id="' + item.billId + '"  data-name="' + item.applyPersonName + '" href="javascript:;">查看</a> ';
            if (item.applyStatus == 'PREPARE') {
              result += ' <a class="op-a js-view" data-status="' + item.applyStatusDesc + '" data-type="modify" data-id="' + item.billId + '" href="javascript:;">修改</a> <a class="op-a js-cancel" data-status="' + item.applyStatusDesc + '" data-type="cancel" data-id="' + item.billId + '" href="javascript:;">撤销</a>';
            }
            return result;
          }
        }],
        params: queryParams,
        method: 'get',
        url: '/newhouse-web/distribution/org/paidList',
        transform: function (data) {
          if (data.result) {
            return data.result;
          }
        },
        showBackboard: false,
        height: 'auto',
        fullWidthRows: true
      });
      this.settleTb.on('loadSuccess', function (e, data) {
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
      this.settleTb.load(queryParams);
    }
  },
  events: {
    // 状态查询
    'click #statusQuery .status-item:not(.cur)': 'statusQuery',
    'click .js-view': 'viewDetail',
    // 撤单
    'click .js-cancel': 'cancelApply',
    // 查看交易报告
    'click .js-report': 'viewReport'
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
      this.parent.queryParams.paidStatus = status;
      this.trigger('loadTb', this.parent.queryParams);
    },
    viewDetail: function (e) {
      var _this = this;
      var $el = this.$(e.currentTarget);
      var id = $el.data('id');
      var type = $el.data('type');
      var url = '//' + this.parent.data.domainName + '/louxun-trade/xftSettlementBill/';
      if (type === 'modify') {
        url += 'informationEdit?billId=' + id;
      } else if (type == 'view') {
        // + '&&applyPersonName=' + $el.data('name') + '&&applyPersonId=' + this.parent.data.applyPersonId 重新申请的
        url += 'viewXftSettlementBill?billId=' + id;
      }
      var title = '结算明细';
      var status = $el.data('status');
      title += ' - ' + status;
      if (status === '资料审核不通过') {
        title += '<span style="color:#fe0000"> (请重新申请结佣)</span>';
      }
      var index = layer.open({
        type: 2,
        title: title,
        area: [
          '800px', '580px'
        ],
        move: false,
        scrollbar: false,
        resize: false,
        content: url,
        end: function () {
          _this.parent.trigger('getPaid');
          _this.trigger('loadTb', _this.parent.queryParams);
        }
      });
    },
    cancelApply: function (e) {
      var _this = this;
      var id = this.$(e.currentTarget).data('id');
      var url = '//' + this.parent.data.domainName + '/louxun-trade/xftSettlementBill/';
      var index = layer.open({
        skin: 'open-title',
        type: 1,
        shadeClose: true,
        area: ['375px', '160px'],
        title: '&nbsp',
        content: '<div class="tip-box warn-box pr"><i class="iconfont icon-gantanhao"></i>如需撤销结佣申请请点击确定，暂不撤销请点击取消！</div>',
        btn: ['确定', '取消'],
        yes: function (index, layero) {
          // layer.close(index); //如果设定了yes回调，需进行手工关闭
          $.ajax({
            url: url + 'cancelApply',
            type: 'get',
            data: {
              settlementBillId: id
            },
            success: function (data) {
              if (data.error) {
                layer.msg(data.message);
                layer.close(index);
              } else {
                layer.msg('撤销成功！');
                layer.close(index);
                _this.parent.trigger('getPaid');
                _this.trigger('loadTb', _this.parent.queryParams);
              }
            },
            error: function () {
              layer.msg('请求失败！');
              layer.close(index);
            }
          });
        }
      });


    },
    viewReport: function (e) {
      //查看交易报告
      var $el = $(e.currentTarget);
      var index = layer.open({
        type: 1,
        title: '交易报告',
        area: ['580px', '480px'],
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
    }
  }
};
