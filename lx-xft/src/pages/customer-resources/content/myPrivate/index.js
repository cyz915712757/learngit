var coala = require('coala');
var config = require('config');
var pagination = require('components/extPagination');
var tpl = require('./index.html');
var utils = require('../../../../utils');
var amplify = require('vendors/amplify/amplify.store.min').amplify;

var editInfo = require('../editInfo');
var changePublic = require('../changePublic');
var reportDialog = require('components/reportDialog');
var mixin = require('../privateMixin.js');
var dialMixin = require('../dialMixin.js');
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
      el: '#privatePage'
    }
  },
  listen: {
    mount: function () {
      var _this = this;
      this.params = {};
      this.trigger('initPrivateTb');
      this.trigger('initWayRources');
      this.trigger('initCustomerGroup');
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
      this.trigger('setPos');
      this.$('#keyword').on('change', function () {
        _this.params.keyword = this.value
      });
      this.$('#notFollowDays').on('change', function () {
        _this.params.notFollowDays = this.value
      });

      if (dialFlag && dialFlag === 'Y') {
        // 电话初始化
        Dial.init();
        Dial.getConnectStatus();
      }

    },
    setPos: function () {
      var _this = this;
      var curPosName = null;
      var userConfig = amplify.store.sessionStorage('userConfig');
      var position = amplify.store.sessionStorage('position');
      if (position) {
        curPosName = position[0].positionName;
      }
      var pos = 1;

      // 公司负责人需要判断外联内联
      var uid = amplify.store.sessionStorage('uid');
      var infoMenu = null;
      var companyType = null;
      uid && (infoMenu = amplify.store.sessionStorage('infoMenu_' + uid));
      infoMenu && (companyType = infoMenu.companyType);

      switch (curPosName) {
        case '公司负责人':
          {
            _this.pos = 2;
            if (companyType == 'OUTREACH') {
              if (userConfig && userConfig.companyReport && (userConfig.companyReport.open === 'Y')) {
                _this.pos = 1;
              }
            }
          }
          break;
        case '营销总监':
        case '城市副总经理':
        case '城市总经理':
          _this.pos = 2;
          break;
        case '店长':
        case '营销经理':
        case '营销主管':
        case '网销经理':
          {
            _this.pos = 1;
            if (userConfig && userConfig.storeReport && (userConfig.storeReport.open === 'N')) {
              _this.pos = 2;
            }
          }
          break;
        default:
          _this.pos = 1;
          break;
      }
    },

    refresh: function () {
      this.privateTb.load(this.params);
    },

    jump: function (page, pageSize) {
      this.params.page = page;
      this.privateTb.load(this.params);
    },
    initCustomerGroup: function () {
      var _this = this;
      this.customerGroup = this.$('#customerGroup').select({
        url: '/newhouse-web/customer/basic/customerGroups',
        idField: 'id',
        dataFormater: function (data) {
          data.result.unshift({
            id: 'WU',
            name: '无'
          });
          return data.result;
        },
        placeholder: '客户分组'
      });
      this.$('#customerGroup').on('bs.select.select', function (e, value, select) {
        _this.params.customerGroupId = value.id;
        _this.params.page = 1;
        _this.privateTb.load(_this.params);
      });
      $('#customerGroup').on('bs.select.clear', function (e, value, select) {
        _this.params.customerGroupId = '';
      });
    },
    initWayRources: function () {
      var _this = this;
      this.waySel = this.$('#waySources').select({
        url: '/newhouse-web/customer/basic/waySources',
        placeholder: '客户来源',
        dataFormater: function (data) {
          return data.result;
        }
      });

      $('#waySources').on('bs.select.select', function (e, value, select) {
        _this.params.waySource = value.id;
        _this.params.page = 1;
        _this.privateTb.load(_this.params);
      });

      $('#waySources').on('bs.select.clear', function (e, value, select) {
        _this.params.waySource = '';
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
        _this.params.intentionLayout = value.name;
        _this.params.page = 1;
        _this.privateTb.load(_this.params);
      });

      $('#layoutSelect').on('bs.select.clear', function (e, value, select) {
        _this.params.intentionLayout = '';
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
        _this.params.intentionCityId = value.id;
        _this.regionSelect.enable();
        _this.regionSelect.setParams({
          internalCityId: value.id
        });
        // _this.params.page = 1;
        // _this.privateTb.load(_this.params);
      });

      $('#townSelect').on('bs.select.clear', function (e, value, select) {
        _this.params.intentionCityId = '';
        _this.params.intentionCountyId = '';
        _this.params.intentionAreaId = '';
        _this.regionSelect.clearValue();
        _this.areaSelect.clearValue();
        _this.regionSelect.disable();
        _this.areaSelect.disable();
        // _this.params.page = 1;
        // _this.privateTb.load(_this.params);
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
        _this.params.intentionCountyId = value.id;
        // _this.params.page = 1;
        // _this.privateTb.load(_this.params);
      });

      $('#regionSelect').on('bs.select.clear', function (e, value, select) {
        _this.params.intentionCountyId = '';
        _this.params.intentionAreaId = '';
        _this.areaSelect.clearValue();
        _this.areaSelect.disable();
        // _this.params.page = 1;
        // _this.privateTb.load(_this.params);
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
        _this.params.intentionAreaId = value.id;
        // _this.params.page = 1;
        // _this.privateTb.load(_this.params);
      });

      $('#areaSelect').on('bs.select.clear', function (e, value, select) {
        _this.params.intentionAreaId = '';
        // _this.params.page = 1;
        // _this.privateTb.load(_this.params);
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
        _this.params.intentionGardenId = value.id;
        // _this.params.page = 1;
        // _this.privateTb.load(_this.params);
      });

      $('#gardenSelect').on('bs.select.clear', function (e, value, select) {
        _this.params.intentionGardenId = '';
        // _this.params.page = 1;
        // _this.privateTb.load(_this.params);
      });
    },

    initDate: function () {
      var _this = this;

      $('#privateStartDate').datetimepicker({
        format: 'yyyy-mm-dd',
        minView: 2,
        endDate: new Date()
      }).on('hide', function (e) {
        this.blur()
      }).on('changeDate', function (ev) {
        $('#privateEndDate').datetimepicker('setStartDate', ev.date);
        _this.params.startTime = utils.dateOp(ev.date);
      });

      $('#privateEndDate').datetimepicker({
        format: 'yyyy-mm-dd',
        minView: 2,
        endDate: new Date()
      }).on('hide', function (e) {
        this.blur()
      }).on('changeDate', function (ev) {
        _this.params.endTime = utils.dateOp(ev.date);
      });

      this.$('#privateStartDate').next('.icon-riqi').on('click', function () {
        _this.$('#privateStartDate').datetimepicker('show');
      });
      this.$('#privateEndDate').next('.icon-riqi').on('click', function () {
        _this.$('#privateEndDate').datetimepicker('show');
      });
    },
    initPrivateTb: function () {
      var _this = this;
      var opts = this.params;
      this.privateTb = this.$('#privateTb').table({
        cols: [
          // {
          //     title: '客户编号',
          //     name: 'customerNo',
          //     width: 100,
          //     renderer: function (val, row, index) {
          //       return row.customerNo.length > 10 ? '<span class="customer-title" data-title="' + row.customerNo + '">' + row.customerNo.substring(0, 8) + '...</span>' : row.customerNo;
          //     }
          //   },
          {
            title: '姓名',
            name: 'customerName',
            width: 100,
            alig: 'left'
          },
          {
            title: '来自',
            name: 'privateSourceStr',
            width: 90,
            alig: 'left'
          },
          {
            title: '客户分组',
            name: 'customerGroupName',
            width: 80,
            alig: 'left'
          }, {
            title: '来源',
            name: 'source',
            width: 120
          }, {
            title: '客户意向',
            name: 'intentionCityName',
            width: 250,
            align: 'left',
            renderer: function (val, item, rowIndex) {
              var intention = mixin.privateIntention(item);
              return '<div class="ellips" style="text-align:left" title="' + intention + '">' + intention + '</div>';
            }
          }, {
            title: '未跟进天数<div class="sort-container" data-type="lastFollowDate"><a class="pr js-sort-up"><span class="up-arrow"></span></a><a class="pr js-sort-down"><span class="down-arrow"></span></a></div>',
            name: 'notFollowNum',
            width: 90,
            renderer: function (val, item, rowIndex) {
              return item.notFollowNum + '天';
            }
          },
          {
            title: '登记日期<div class="sort-container" data-type="createTime"><a class="pr js-sort-up"><span class="up-arrow"></span></a><a class="pr js-sort-down"><span class="down-arrow"></span></a></div>',
            name: 'registerDate',
            width: 85,
            align: 'left',
            renderer: function (val, item, rowIndex) {
              return utils.formatDate(item.registerDate);
            }
          }, {
            title: '操作',
            name: 'oprate',
            width: 142,
            renderer: function (val, item, rowIndex) {
              _this.pos = 1;
              var str = _this.pos && _this.pos === 1 ? '<a class="op-a js-report" data-cname="' + item.customerName + '" data-phone="' + item.phone + '" data-track="报备">报备</a>' : '';
              var dial = dialFlag && dialFlag === 'Y' ? '<a class="op-a js-dial" data-id="' + item.id + '" data-customer-name="' + item.customerName + '"  data-phone="' + item.phone + '">拨号</a>' : '';
              return '<div class="js-opbox"><a class="op-a js-view" data-id="' + item.id + '" data-phone="' + item.phone + '" data-customer-id="' + item.customerId + '" data-batch="' + item.batch + '">查看</a>' + str + '<a class="op-a change-public" data-id="' + item.id + '" data-batch="' + item.batch + '"  data-customer-name="' + item.customerName + '"  data-phone="' + item.phone + '">转公</a>' + dial + '</div>';
            }
          }
        ],
        params: opts,
        freezable: true,
        method: 'get',
        url: '/newhouse-web/customer/private/list',
        transform: function (data) {
          if (data.result.items.length > 0) {
            var idArr = [];
            $.each(data.result.items, function (index, el) {
              idArr.push(el.id);
            });
            _this.idArr = idArr;
            return data.result.items;
          } else {
            return [];
          }
        },
        showBackboard: false,
        height: 'auto',
        /*fullWidthRows: true*/
      });
      this.privateTb.on('loadSuccess', function (e, data) {
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
    'click .js-view': 'viewCustomer',
    'click .change-public': 'changePublic',
    'click .js-query': 'queryRecord',
    'click .js-clear': 'clearQuery',
    'click .js-report': 'reportFun',
    'click .js-add': 'addPrivate',
    'mouseenter .customer-title': 'showTitle',
    'click .advance-search': 'advanceSearch',
    'click .js-sort-up,.js-sort-down': 'sortProcess',
    'click .js-dial': 'dialHandle'
  },

  handle: {
    viewCustomer: function (e) {
      this.parent.trigger('openViewCustomer', {
        type: 'private',
        el: this.$(e.target),
        idArr: this.idArr
      });
    },

    changePublic: function (e) {
      var _this = this;
      var $el = this.$(e.target);
      var index = layer.open({
        type: 1,
        title: '客户转公',
        area: ['440px', '205px'],
        move: false,
        scrollbar: false,
        yes: function () {

        },
        content: '<div id="changePublic" class="change-public"></div>'
      });

      var d = coala.mount(changePublic, '#changePublic');
      d.index = index;
      d.parent = this;
      d.params = this.params;
      d.type = 'inline';
      var id = $el.data('id');
      var customerName = $el.data('customerName');
      var phone = $el.data('phone');
      var batch = $el.data('batch');

      d.trigger('render', {
        id: id,
        batch: batch,
        customerName: customerName,
        phone: phone
      });
    },

    queryRecord: function (e) {
      var notFollowDays = $.trim(this.$('#notFollowDays').val());
      var keyword = $.trim(this.$('#keyword').val());
      this.params.notFollowDays = notFollowDays;
      this.params.keyword = keyword;
      var strMinPrice = $.trim(this.$('#intentionMinPrice').val());
      var strMaxPrice = $.trim(this.$('#intentionMaxPrice').val());
      var minPrice = strMinPrice && parseInt(strMinPrice, 10) * 10000;
      var maxPrice = strMaxPrice && parseInt(strMaxPrice, 10) * 10000;
      if (minPrice > maxPrice) {
        layer.msg('价格最小值不能大于最大值，请重新输入');
        this.$('#intentionMaxPrice').focus();
        return;
      }
      this.params.intentionMinPrice = minPrice;
      this.params.intentionMaxPrice = maxPrice;
      var strMinArea = $.trim(this.$('#intentionMinArea').val());
      var strMaxArea = $.trim(this.$('#intentionMaxArea').val());
      var minArea = strMinArea && parseInt(strMinArea, 10);
      var maxArea = strMaxArea && parseInt(strMaxArea, 10);
      if (minArea > maxArea) {
        layer.msg('面积最小值不能大于最大值，请重新输入');
        this.$('#intentionMaxArea').focus();
        return;
      }
      this.params.intentionMinArea = minArea;
      this.params.intentionMaxArea = maxArea;
      //清除排序
      delete this.params.orderByField;
      delete this.params.orderByType;
      this.$('.sort-container').find('span.highlight').removeClass('highlight');
      this.params.page = 1;
      this.privateTb.load(this.params);
    },

    clearQuery: function (e) {
      this.params = {};
      this.waySel.render();
      this.layoutSelect.render();
      this.customerGroup.render();
      this.townSelect.render();
      this.regionSelect.clearValue();
      this.areaSelect.clearValue();
      this.regionSelect.disable();
      this.areaSelect.disable();
      this.gardenSelect.render();
      this.$('#notFollowDays').val('');
      this.$('#keyword').val('');
      this.$('#intentionMinArea').val('');
      this.$('#intentionMaxArea').val('');
      this.$('#intentionMinPrice').val('');
      this.$('#intentionMaxPrice').val('');
      this.trigger('refresh');
    },
    reportFun: function (e) {
      var tagEl = this.$(e.currentTarget);
      var index = layer.open({
        type: 1,
        shadeClose: true,
        area: ['415px', '404px'],
        title: '报备',
        content: '<div id="reportDialogbox"></div>',
        scrollbar: false
      });
      var d = coala.mount(reportDialog, '#reportDialogbox');
      d.index = index;
      d.data.phone = $.trim(tagEl.data('phone'));
      d.data.cname = $.trim(tagEl.data('cname'));
      d.trigger('render');
    },

    addPrivate: function (e) {
      var _this = this;
      var configObj = {
        type: 'add',
        getitem: null,
        sendUrl: 'private/save',
        tb: _this.privateTb
      };
      _this.parent.editFun('添加私客', configObj);
    },
    showTitle: function (e) {
      var customerNo = this.$(e.currentTarget).data('title');
      layer.tips(customerNo, this.$(e.currentTarget).parent().parent(), {
        tips: [2, '#00b4ed']
      });
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
    sortProcess: function (e) {
      this.$('.sort-container').find('span.highlight').removeClass('highlight');
      var $ele = this.$(e.currentTarget);
      $ele.find('span').toggleClass('highlight');
      var orderByField = $ele.parent().data('type');
      var orderByType = $ele.find('span.highlight').hasClass('up-arrow') ? 'asc' : 'desc';
      this.params.orderByField = orderByField;
      this.params.orderByType = orderByType;
      this.params.page = 1;
      this.privateTb.load(this.params);
    },
    dialHandle: function (e) {
      var phone = this.$(e.currentTarget).data('phone')
      // phone = '18607130542';
      //获取今天已拨打次数
      dialMixin.getDialCount(phone);
      //拨打电话
      dialMixin.openDial(phone, this, dialType, Dial);
    }
  }
};
