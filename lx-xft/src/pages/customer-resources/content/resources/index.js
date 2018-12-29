var coala = require('coala');
var config = require('config');
var utils = require('../../../../utils');
var pagination = require('components/extPagination');
var layer = require('components/layer');
var reportDialog = require('components/reportDialog');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
var mixin = require('../publicMixin.js');
var dialMixin = require('../dialMixin.js');
var viewCustomer = require('../viewCustomer');
var repeatCustomer = require('../repeatCustomer');
var tpl = require('./index.html');
require('./index.css');
require('../../../../numeral.js');
var Dial = require('../../../../dial.js');
//获取开通拨号权限
var dialFlag = amplify.store.sessionStorage('userConfig').dial_status.open;
var dialType = amplify.store.sessionStorage('userConfig').dial_type.value;

module.exports = {
  tpl: tpl,
  refs: {
    pagination: {
      component: pagination,
      el: '#resPage'
    }
  },
  listen: {
    init: function() {
      this.queryParams = { page: 1 };
    },
    jump: function(page, pageSize) {
      this.queryParams.page = page;
      this.resourcesTb.load(this.queryParams);
    },
    mount: function() {
      var _this = this;
      this.trigger('initResourcesTb');
      this.trigger('initdatePicker');
      this.trigger('initWaySources');
      //初始化户型下拉框
      this.trigger('layoutSelect');
      //初始化城市下拉框
      this.trigger('townSelect');
      //初始化区域下拉框
      this.trigger('regionSelect');
      //初始化片区下拉框
      this.trigger('areaSelect');
      //初始化楼盘下拉框
      this.trigger('gardenSelect');
      this.$('#notFollowDays').numeral();
      this.$('#intentionMinPrice').numeral();
      this.$('#intentionMaxPrice').numeral();
      this.$('#intentionMinArea').numeral();
      this.$('#intentionMaxArea').numeral();
      this.$('#importBatch').on('change', function() { _this.queryParams.importBatch = this.value });
      this.$('#cusKw').on('change', function() { _this.queryParams.keyword = this.value });
      this.$('#notFollowDays').on('change', function() {
        _this.queryParams.notFollowDays = this.value
      });
      if(dialFlag && dialFlag === 'Y'){
        // 电话初始化
        Dial.init();
        Dial.getConnectStatus();
      }
    },
    unmount: function() {
      this.startPicker.datetimepicker('remove');
      this.endPicker.datetimepicker('remove');
    },

    initWaySources: function() {
      var _this = this;
      this.waySources = this.$('#waySources').select({
        url: '/newhouse-web/customer/basic/waySources',
        dataFormater: function(data) {
          var _this = this;
          return data.result;
        },
        width: 100,
        placeholder: '客户来源',
      });
      this.$('#waySources').on('bs.select.select', function(e, value, select) {
        _this.queryParams.waySource = value.id;
        _this.queryParams.page = 1;
        _this.resourcesTb.load(_this.queryParams);
      });
    },
    layoutSelect: function () {
      var _this = this;
      this.layoutSelect = this.$('#layoutSelect').select({
        placeholder: '户型',
        data: ['一房', '二房', '三房', '四房', '五房及以上', '别墅', '写字楼', '商铺', '其他'],
        rows: 5
      });

      $('#layoutSelect').on('bs.select.select', function (e, value, select) {
        _this.queryParams.intentionLayout = value.name;
        _this.queryParams.page = 1;
        _this.resourcesTb.load(_this.queryParams);
      });

      $('#layoutSelect').on('bs.select.clear', function (e, value, select) {
        _this.queryParams.intentionLayout = '';
      });
    },
    townSelect: function () {
      var _this = this;
      this.townSelect = this.$('#townSelect').select({
        placeholder: '城市',
        search: true,
        keyword: 'keyword',
        url: '/newhouse-web/customer/basic/queryCity',
        notFoundFormater: function () {
          return '<div class="no-data-find">暂无数据</div>';
        },
        idField: 'internalId',
        dataFormater: function (result) {
          return result.result;
        },
        width: 120,
        highlight: true,
        rows: 5
      });
      $('#townSelect').on('bs.select.select', function (e, value, select) {
        _this.queryParams.intentionCityId = value.id;
        _this.regionSelect.enable();
        _this.regionSelect.setParams({
          internalCityId: value.id
        });
        // _this.queryParams.page = 1;
        // _this.resourcesTb.load(_this.queryParams);
      });

      $('#townSelect').on('bs.select.clear', function (e, value, select) {
        _this.queryParams.intentionCityId = '';
        _this.queryParams.intentionCountyId = '';
        _this.queryParams.intentionAreaId = '';
        _this.regionSelect.clearValue();
        _this.areaSelect.clearValue();
        _this.regionSelect.disable();
        _this.areaSelect.disable();
        // _this.queryParams.page = 1;
        // _this.resourcesTb.load(_this.queryParams);
      });
    },
    regionSelect: function () {
      var _this = this;
      this.regionSelect = this.$('#regionSelect').select({
        placeholder: '区域',
        keyword: 'keyword',
        search: true,
        idField: 'internalId',
        url: '/newhouse-web/customer/basic/queryCounty',
        notFoundFormater: function () {
          return '<div class="no-data-find">暂无数据</div>';
        },
        dataFormater: function (item) {
          return item.result;
        },
        width: 120,
        highlight: true,
        rows: 5
      });
      $('#regionSelect').on('bs.select.select', function (e, value, select) {
        _this.areaSelect.enable();
        _this.areaSelect.setParams({
          internalCountyId: value.id
        });
        _this.queryParams.intentionCountyId = value.id;
        // _this.queryParams.page = 1;
        // _this.resourcesTb.load(_this.queryParams);
      });

      $('#regionSelect').on('bs.select.clear', function (e, value, select) {
        _this.queryParams.intentionCountyId = '';
        _this.queryParams.intentionAreaId = '';
        _this.areaSelect.clearValue();
        _this.areaSelect.disable();
        // _this.queryParams.page = 1;
        // _this.resourcesTb.load(_this.queryParams);
      });
      this.regionSelect.disable();
    },
    areaSelect: function () {
      var _this = this;
      this.areaSelect = this.$('#areaSelect').select({
        placeholder: '片区',
        keyword: 'keyword',
        search: true,
        idField: 'internalId',
        url: '/newhouse-web/customer/basic/queryArea',
        notFoundFormater: function () {
          return '<div class="no-data-find">暂无数据</div>';
        },
        dataFormater: function (item) {
          return item.result;
        },
        width: 120,
        highlight: true,
        rows: 5
      });
      $('#areaSelect').on('bs.select.select', function (e, value, select) {
        _this.queryParams.intentionAreaId = value.id;
        // _this.queryParams.page = 1;
        // _this.resourcesTb.load(_this.queryParams);
      });

      $('#areaSelect').on('bs.select.clear', function (e, value, select) {
        _this.queryParams.intentionAreaId = '';
        // _this.queryParams.page = 1;
        // _this.resourcesTb.load(_this.queryParams);
      });
      this.areaSelect.disable();
    },
    gardenSelect: function () {
      var _this = this;
      this.gardenSelect = this.$('#gardenSelect').select({
        placeholder: '楼盘',
        keyword: 'keyword',
        search: true,
        idField: 'gardenErpId',
        url: '/newhouse-web/customer/basic/queryGarden',
        notFoundFormater: function (data) {
          return '<div class="no-data-find">暂无数据</div>';
        },
        dataFormater: function (item) {
          return item.result;
        },
        width: 120,
        highlight: true,
        rows: 5
      });

      $('#gardenSelect').on('bs.select.select', function (e, value, select) {
        _this.queryParams.intentionGardenId = value.id;
        // _this.queryParams.page = 1;
        // _this.resourcesTb.load(_this.queryParams);
      });

      $('#gardenSelect').on('bs.select.clear', function (e, value, select) {
        _this.queryParams.intentionGardenId = '';
        // _this.queryParams.page = 1;
        // _this.resourcesTb.load(_this.queryParams);
      });
    },
    initResourcesTb: function() {
      var _this = this;
      this.resourcesTb = this.$('#resourcesTb').table({
        cols: [
        //   {
        //   title: '客户编号',
        //   name: 'customerNo',
        //   width: 120,
        //   renderer: function(val, row, index) {
        //     return row.customerNo.length > 14 ? '<span class="customer-title" data-title="' + row.customerNo + '">' + row.customerNo.substring(0, 14) + '...</span>' : row.customerNo;
        //   }
        // },
        {
          title: '客户姓名',
          name: 'customerName',
          width: 100
        }, {
          title: '来源',
          name: 'source',
          width: 80
        }, {
          title: '客户意向',
          name: 'intentionCityName',
          width: 340,
          align: 'left',
          renderer: function(val, item, rowIndex) {
            var intention = mixin.publicIntention(item);
            return '<div class="ellips" style="text-align:left" title="' + intention + '">' + intention + '</div';
          }
        },
        {
            title: '未跟进天数<div class="sort-container" data-type="lastFollowDate"><a class="pr js-sort-up"><span class="up-arrow"></span></a><a class="pr js-sort-down"><span class="down-arrow"></span></a></div>',
            name: 'notFollowNum',
            width: 90,
            renderer: function(val, item, rowIndex) {
              return item.notFollowNum + '天';
            }
          },{
          title: '导入日期<div class="sort-container" data-type="importDateTime"><a class="pr js-sort-up"><span class="up-arrow"></span></a><a class="pr js-sort-down"><span class="down-arrow"></span></a></div>',
          name: 'importDate',
          width: 80,
          align: 'left',
          renderer: function(val, item, rowIndex) {
            return utils.formatDate(item.importDate);
          }
        }, {
          title: '导入批次',
          name: 'importBatch',
          width: 140
        }, {
          title: '操作',
          name: 'op',
          width: 125,
          renderer: function(val, item, rowIndex) {
            var dial = dialFlag && dialFlag === 'Y' ? '<a class="op-a js-dial" data-id="' + item.id + '" data-customer-name="' + item.customerName + '"  data-phone="' + item.phone + '">拨号</a>' : '';
            return '<div class="js-opbox"><a class="op-a js-view" data-batch="' + item.importBatch + '" data-id="' + item.id + '" data-customer-id="' + item.customerId + '" data-phone="' + item.phone + '">查看</a><a class="op-a js-private" data-batch="' + item.importBatch + '" data-id="' + item.id + '">转私</a>' + dial +'</div>'
          }
        }],
        params: {},
        method: 'get',
        url: '/newhouse-web/customer/resources/list',
        transform: function(data) {
          if (data.result.items.length>0) {
            var idArr = [];
            $.each(data.result.items, function(index, el) {
              idArr.push(el.id);
            });
            _this.idArr = idArr;
            return data.result.items;
          } else {
            return [];
          }
        },
        showBackboard: false,
        height: 'auto'
        /*fullWidthRows: true*/
      });
      this.resourcesTb.on('loadSuccess',function(e, data){
        if(data.result) {
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
    initdatePicker: function() {
      var _this = this;
      var dateOpt = {
        format: 'yyyy-mm-dd',
        minView: 2,
        endDate: new Date()
      };
      this.startPicker = this.$('#startDate').datetimepicker(dateOpt).on('hide', function(e) {
        this.blur();
      }).on('changeDate', function(ev) {
        _this.endPicker.datetimepicker('setStartDate', ev.date);
        _this.queryParams.startDate = utils.dateOp(ev.date);
      });
      this.startPicker.next('.js-dicon').on('click', function() {
        _this.startPicker.datetimepicker('show');
      });
      this.endPicker = this.$('#endDate').datetimepicker(dateOpt).on('changeDate', function(ev) {
        _this.startPicker.datetimepicker('setEndDate', ev.date);
        _this.queryParams.endDate = utils.dateOp(ev.date);
      }).on('hide', function(e) {
        this.blur();
      });
      this.endPicker.next('.js-dicon').on('click', function() {
        _this.endPicker.datetimepicker('show');
      });
    },

  },
  events: {
    'click #queryBtn': 'queryFun',
    'click #resetBtn': 'resetFun',
    'click .js-private': 'turnPrivate',
    'click .js-view': 'viewCustomer',
    'mouseenter .customer-title': 'showTitle',
    'click .advance-search': 'advanceSearch',
    'click .js-sort-up,.js-sort-down': 'sortProcess',
    'click #repeatBtn' : 'repeatHandle', //客户去重
    'click .js-dial': 'dialHandle'
  },

  handle: {
    viewCustomer: function(e) {
      mixin.viewCommonCustomer({ self: this, e: e, type: 'resources' });
    },
    queryFun: function() {
      this.queryParams.page = 1;
      var cusKw = $.trim(this.$('#cusKw').val());
      var notFollowDays = $.trim(this.$('#notFollowDays').val());
      this.queryParams.keyword = cusKw;
      this.queryParams.notFollowDays = notFollowDays;
      var strMinPrice = $.trim(this.$('#intentionMinPrice').val());
      var strMaxPrice = $.trim(this.$('#intentionMaxPrice').val());
      var minPrice = strMinPrice && parseInt(strMinPrice, 10) * 10000;
      var maxPrice = strMaxPrice && parseInt(strMaxPrice, 10) * 10000;
      if (minPrice > maxPrice) {
        layer.msg('价格最小值不能大于最大值，请重新输入');
        this.$('#intentionMaxPrice').focus();
        return;
      }
      this.queryParams.intentionMinPrice = minPrice;
      this.queryParams.intentionMaxPrice = maxPrice;
      var strMinArea = $.trim(this.$('#intentionMinArea').val());
      var strMaxArea = $.trim(this.$('#intentionMaxArea').val());
      var minArea = strMinArea && parseInt(strMinArea, 10);
      var maxArea = strMaxArea && parseInt(strMaxArea, 10);
      if (minArea > maxArea) {
        layer.msg('面积最小值不能大于最大值，请重新输入');
        this.$('#intentionMaxArea').focus();
        return;
      }
      this.queryParams.intentionMinArea = minArea;
      this.queryParams.intentionMaxArea = maxArea;
      this.queryParams.importBatch = $.trim(this.$('#importBatch').val());
      this.resourcesTb.load(this.queryParams);
    },
    advanceSearch: function (e) {
      var $ele = $(e.currentTarget);
      var $icon = $ele.find('span');
      if ($icon.hasClass('down-arrow')) {
        //显示高级搜索
        $icon.removeClass('down-arrow').addClass('up-arrow');
        $('.js-adv-query').show(400);
      } else {
        //隐藏高级搜索
        $icon.removeClass('up-arrow').addClass('down-arrow');
        $('.js-adv-query').hide(400);
      }
    },
    resetFun: function() {
      this.queryParams = {};
      this.waySources.render();
      this.$('#cusKw').val('');
      this.$('#importBatch').val('');
      this.$('#startDate').val('');
      this.$('#endDate').val('');
      this.layoutSelect.render();
      this.townSelect.render();
      this.regionSelect.clearValue();
      this.areaSelect.clearValue();
      this.regionSelect.disable();
      this.areaSelect.disable();
      this.gardenSelect.render();
      this.$('#intentionMinArea').val('');
      this.$('#intentionMaxArea').val('');
      this.$('#intentionMinPrice').val('');
      this.$('#intentionMaxPrice').val('');
      this.$('#notFollowDays').val('');
      /*重新设置时间插件*/
      this.$('#startDate').datetimepicker('setEndDate', new Date());
      this.$('#startDate').datetimepicker('setStartDate', null);
      this.$('#endDate').datetimepicker('setEndDate', new Date());
      this.$('#endDate').datetimepicker('setStartDate', null);
      //清除排序
      delete this.queryParams.orderByField;
      delete this.queryParams.orderByType;
      this.$('.sort-container').find('span.highlight').removeClass('highlight');
      this.resourcesTb.load(this.queryParams);
    },
    turnPrivate: function(e) {
      mixin.turnCommonPrivate({ self: this, e: e, type: 'resources' });
    },
    showTitle: function(e) {
      var customerNo = this.$(e.currentTarget).data('title');
      layer.tips(customerNo, this.$(e.currentTarget).parent().parent(), { tips: [2, '#00b4ed'] });
    },
    sortProcess: function(e){
      this.$('.sort-container').find('span.highlight').removeClass('highlight');
      var $ele = this.$(e.currentTarget);
      $ele.find('span').toggleClass('highlight');
      var orderByField = $ele.parent().data('type');
      var orderByType = $ele.find('span.highlight').hasClass('up-arrow') ? 'asc':'desc';
      this.queryParams.orderByField = orderByField;
      this.queryParams.orderByType = orderByType;
      this.queryParams.page = 1;
      this.resourcesTb.load(this.queryParams);
    },
    repeatHandle: function(e){
      var _this = this;
      var index = layer.open({
        type: 1,
        shadeClose: true,
        area: ['880px', '700px'],
        title: '客户去重',
        content: '<div id="repeatCustomer"></div>',
        end: function(){
          _this.resourcesTb.load(_this.queryParams);
        }
      });

      var d = coala.mount(repeatCustomer, '#repeatCustomer');
      d.index = index;
      d.trigger('render');
    },
    dialHandle: function(e) {
      var phone = this.$(e.currentTarget).data('phone')
      //获取今天已拨打次数
      dialMixin.getDialCount(phone);
      //拨打电话
      dialMixin.openDial(phone, this, dialType, Dial);
    }

  }
};
