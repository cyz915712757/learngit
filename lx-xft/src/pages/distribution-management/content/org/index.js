var coala = require('coala');

var amplify = require('vendors/amplify/amplify.store.min').amplify;
var layer = require('components/layer');
var config = require('config');
var utils = require('../../../../utils');

var summary = require('../summary');
var applyPaid = require('../applyPaid');
var dealList = require('../dealList');
var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  refs: {
    // 汇总模块
    summary: {
      component: summary,
      el: '#summary'
    },

    // 成交，结算，分店业绩列表，默认挂载成交列表
    comList: {
      component: dealList,
      el: '#comList'
    },

    // 申请结佣
    applyPaid: {
      component: applyPaid,
      el: '#applyPaid'
    }
  },
  listen: {
    init: function () {
      this.trigger('renderModel');
      // 初始化列表查询参数，汇总查询参数和请求地址，新需求去掉默认7天30天这些
      this.queryParams = {
        page: 1,
        pageSize: 15,
        gardenName: null
      };
      this.summaryOpts = {
        sendData: this.queryParams,
        type: 'company',
        url: '/newhouse-web/distribution/org/statistics'
      };
      this.status = 'deal';
    },
    renderModel: function () {
      var _this = this;
      var curPosName = null;
      var position = amplify.store.sessionStorage('position');
      if (position) {
        curPosName = position[0].positionName;
      }

      // 公司负责人需要判断外联内联
      var uid = amplify.store.sessionStorage('uid');
      var infoMenu = null;
      var companyType = null;
      uid && (infoMenu = amplify.store.sessionStorage('infoMenu_' + uid));
      infoMenu && (companyType = infoMenu.companyType);

      switch (curPosName) {
        case '店长':
        case '营销经理':
        case '营销主管':
        case '网销经理':
          _this.data.positionFlag = 1;
          break;
        case '营销总监':
        case '营销助理':
        case '网销总监':
          _this.data.positionFlag = 2;
          break;
        case '公司负责人':
          {
            if (companyType == 'OUTREACH') {
              _this.data.positionFlag = 3;
            }
          }
          break;
      }
    },
    unmount: function () {
      // 卸载时手动卸载挂载body元素下的日期组件dom
      this.startPicker.datetimepicker('remove');
      this.endPicker.datetimepicker('remove');
    },
    mount: function () {
      var _this = this;
      // 初始化日期
      this.trigger('initDatePicker');
      // 初始化经纪人模糊下拉搜索
      this.trigger('initBrokerSel');
      this.refs.comList.trigger('initDealTb', this.queryParams);
      this.refs.summary.trigger('render', this.summaryOpts);
      this.$('#gardenName').on('change', function () {
        _this.queryParams.gardenName = this.value;
        _this.summaryOpts.sendData = _this.queryParams;
      });
      this.trigger('getPaid');
    },
    getPaid: function () {
      var _this = this;
      $.ajax({
        type: 'GET',
        dataType: 'json',
        url: '/newhouse-web/distribution/org/applyCommission',
        success: function (data) {
          if (data.status == 'C0000') {
            _this.data = data.result;
            _this.refs.applyPaid.trigger('render', _this.data);
          }
        }
      });
    },
    // 初始化日期
    initDatePicker: function () {
      var _this = this;
      var dateOpt = {
        format: 'yyyy-mm-dd',
        minView: 2,
        endDate: new Date()
      };
      $('#dealStartDate').datetimepicker({
        format: 'yyyy-mm-dd',
        minView: 2,
        endDate: new Date()
      }).on('hide', function (e) {
        this.blur() //为了解决日期控件bug，不要删除
      }).on('changeDate', function (ev) {
        $('#dealEndDate').datetimepicker('setStartDate', ev.date);
        _this.params.startTime = utils.dateOp(ev.date);
      });

      $('#dealEndDate').datetimepicker({
        format: 'yyyy-mm-dd',
        minView: 2,
        endDate: new Date()
      }).on('hide', function (e) {
        this.blur() //for fixing bug ,do not remove it
      }).on('changeDate', function (ev) {
        $('#dealStartDate').datetimepicker('setEndDate', ev.date);
        _this.params.endTime = utils.dateOp(ev.date);
      });

      this.$('#dealStartDate').next('.icon-riqi').on('click', function () {
        _this.$('#dealStartDate').datetimepicker('show');
      });
      this.$('#dealEndDate').next('.icon-riqi').on('click', function () {
        _this.$('#dealEndDate').datetimepicker('show');
      });
      var $startDate = this.$('#startDate');
      var $endDate = this.$('#endDate');
      this.startPicker = $startDate.datetimepicker(dateOpt).on('hide', function (e) {
        this.blur();
      }).on('changeDate', function (ev) {
        $endDate.datetimepicker('setStartDate', ev.date);
        _this.queryParams.startDate = utils.dateOp(ev.date);
      });
      this.startPicker.next('.js-dicon').on('click', function () {
        _this.startPicker.datetimepicker('show');
      });
      this.endPicker = $endDate.datetimepicker(dateOpt).on('changeDate', function (ev) {
        $startDate.datetimepicker('setEndDate', ev.date);
        _this.queryParams.endDate = utils.dateOp(ev.date);
      }).on('hide', function (e) {
        this.blur();
      });
      this.endPicker.next('.js-dicon').on('click', function () {
        _this.endPicker.datetimepicker('show');
      });
    },

    // 初始化经纪人名
    initBrokerSel: function () {
      var _this = this;
      this.brokerSel = this.$('#brokerName').select({
        url: '/newhouse-web/distribution/org/getBrokerList',
        rows: 5,
        keyword: 'brokerName',
        params: {
          storeId: _this.queryParams.storeId
        },
        dataFormater: function (data) {
          return data.result;
        },
        search: true,
        placeholder: '经纪人名称',
      });
      this.$('#brokerName').on('bs.select.select', function (e, value, select) {
        _this.queryParams.employeeId = value.id;
      });
      this.$('#brokerName').on('bs.select.clear', function (e, value, select) {
        _this.queryParams.employeeId = null;
      });
    },
  },
  mixins: [{
    // 重置时间插件
    resetDate: function (startDateBox, endDateBox) {
      /*重新设置时间插件*/
      startDateBox.datetimepicker('setEndDate', new Date());
      startDateBox.datetimepicker('setStartDate', null);
      endDateBox.datetimepicker('setEndDate', new Date());
      endDateBox.datetimepicker('setStartDate', null);
    },
    checkTime: function (queryParams) {
      if (queryParams.endDate && (!queryParams.startDate)) {
        layer.msg('请选择开始时间！');
        return;
      }
      if (queryParams.startDate && (!queryParams.endDate)) {
        layer.msg('请选择结束时间！');
        return;
      }
      return true;
    },
    requireSettleList: function () {
      var _this = this;
      require.ensure([], function () {
        _this.refs.comList = coala.mount(require('../settleList'), '#comList');
        _this.refs.comList.parent = _this;
        _this.status = 'settle';
        _this.queryParams.dealStatus = null;
        _this.queryParams.status = null;
        _this.queryParams.orderByField = null;
        _this.queryParams.orderByType = null;
        _this.refs.comList.trigger('initSettleTb', _this.queryParams);
      });
    },
    requireStoreList: function () {
      var _this = this;
      require.ensure([], function () {
        _this.refs.comList = coala.mount(require('../storeList'), '#comList');
        _this.refs.comList.parent = _this;
        _this.status = 'store';
        _this.queryParams.paidStatus = null;
        _this.queryParams.status = null;
        _this.queryParams.dealStatus = null;
        _this.queryParams.orderByField = null;
        _this.queryParams.orderByType = null;
        _this.refs.comList.trigger('initStoreTb', _this.queryParams);
      });
    },
    requireDealList: function () {
      this.refs.comList = coala.mount(dealList, '#comList');
      this.refs.comList.parent = this;
      this.status = 'deal';
      this.queryParams.paidStatus = null;
      this.queryParams.status = null;
      this.queryParams.orderByField = null;
      this.queryParams.orderByType = null;
      this.refs.comList.trigger('initDealTb', this.queryParams);
    },
    requireReportList: function () {
      var _this = this;
      require.ensure([], function () {
        _this.refs.comList = coala.mount(require('../reportList'), '#comList');
        _this.refs.comList.parent = _this;
        _this.status = 'report';
        _this.queryParams.paidStatus = null;
        _this.queryParams.dealStatus = null;
        _this.refs.comList.trigger('initReportTb', _this.queryParams);
      });
    }
  }],
  events: {
    // 成交，结算，分店列表切换加载
    'click #sumHead a': 'sumHeadFun',
    // 查询汇总数据和列表
    'click #queryBtn': 'queryFun',
    // 重置查询条件
    'click #resetBtn': 'resetFun'
  },

  handle: {
    // 成交，结算，分店列表切换加载
    sumHeadFun: function (e) {
      var $el = $(e.currentTarget);
      if (!$el.hasClass('cur')) {
        $el.addClass('cur').siblings('.cur').removeClass('cur');
      }
      if (this.comList) {
        this.comList.unmount();
      }
      this.queryParams.page = 1;
      this.refs.summary.trigger('render', this.summaryOpts);
      switch ($el.data('type')) {
        //成交
        case 'deal':
          this.requireDealList();
          break;
          //结算
        case 'settle':
          this.requireSettleList();
          break;
          //分店业绩
        case 'store':
          this.requireStoreList();
          break;
        case 'report':
          this.requireReportList();
          break;
      }
    },

    // 查询汇总数据和列表
    queryFun: function () {
      if (!this.checkTime(this.queryParams)) {
        return;
      }
      this.queryParams.page = 1;
      this.refs.comList.trigger('loadTb', this.queryParams);
      /*汇总数据*/
      this.summaryOpts.sendData = this.queryParams;
      this.refs.summary.trigger('render', this.summaryOpts);
    },

    // 重置查询条件
    resetFun: function () {
      // this.$('#dateSel .js-date').eq(0).addClass('cur').siblings().removeClass('cur');
      //this.$('#sumHead a').eq(0).addClass('cur').siblings().removeClass('cur');
      this.queryParams = {
        page: 1,
        pageSize: 15,
        startDate: null,
        endDate: null,
        employeeId: null,
        gardenName: null,
        dealStatus: null,
        storeId: null
      };
      this.brokerSel.render();
      this.$('#gardenName').val('');
      this.$('#startDate').val('');
      this.$('#endDate').val('');
      this.resetDate(this.$('#startDate'), this.$('#endDate'));
      /*重置重新加载当前列表*/
      switch (this.status) {
        //成交
        case 'deal':
          this.requireDealList();
          break;
          //结算
        case 'settle':
          this.requireSettleList();
          break;
          //分店业绩
        case 'store':
          this.requireStoreList();
          break;
        case 'report':
          this.requireReportList();
          break;
      }
      this.summaryOpts.sendData = this.queryParams;
      this.refs.summary.trigger('render', this.summaryOpts);
    }
  }
};
