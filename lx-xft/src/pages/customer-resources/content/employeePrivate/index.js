var coala = require('coala');
var config = require('config');
var pagination = require('components/extPagination');
var tpl = require('./index.html');
var utils = require('../../../../utils');
var viewCustomer = require('../viewCustomer');
var changeCustomer = require('../changeCustomer');
require('./index.css');
var mixin = require('../privateMixin.js');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
var position = amplify.store.sessionStorage('position')[0];
require('../../../../numeral.js');
module.exports = {
  tpl: tpl,
  refs: {
    pagination: {
      component: pagination,
      el: '#employeePage'
    }
  },
  listen: {
    mount: function () {
      var _this = this;
      this.params = {};
      this.trigger('initDeptSources');
      this.trigger('initWayRources');
      this.trigger('initName');
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
      this.$('#intentionMinPrice').numeral();
      this.$('#intentionMaxPrice').numeral();
      this.$('#intentionMinArea').numeral();
      this.$('#intentionMaxArea').numeral();
      this.trigger('initEmployeeTb', this.params);
      this.$('#keyword').on('change', function () {
        _this.params.keyword = this.value
      });
    },

    jump: function (page, pageSize) {
      this.params.page = page;
      this.employeeTb.load(this.params);
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
        placeholder: '客户分组',
      });
      this.$('#customerGroup').on('bs.select.select', function (e, value, select) {
        _this.params.customerGroupId = value.id;
        _this.params.page = 1;
        _this.employeeTb.load(_this.params);
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
        _this.employeeTb.load(_this.params);
      });

      $('#waySources').on('bs.select.clear', function (e, value, select) {
        _this.params.waySource = '';
      });
    },

    initName: function () {
      var _this = this;
      this.name = this.$('#name').select({
        url: '/newhouse-web/customer/private/staff/getBroker',
        placeholder: '经纪人',
        keyword: 'keyword',
        params: {
          longNumber: _this.params.longNumber
        },
        dataFormater: function (data) {
          return data.result;
        },
        idField: 'erpId'
      });

      $('#name').on('bs.select.select', function (e, value, select) {
        _this.params.employeeErpId = value.id;
        _this.employeeTb.load(_this.params);
      });

      $('#name').on('bs.select.clear', function (e, value, select) {
        _this.params.employeeErpId = '';
      });
    },

    initDeptSources: function () {
      var _this = this;
      this.deptSources = this.$('#deptSources').select({
        treeOption: {
          url: '/newhouse-web/customer/basic/deptTree',
          idField: 'id',
          nameField: 'name',
          multiple: false,
          dataFormater: function (data) {
            var _this = this;
            return data.result;
          }
        },
        width: 230,
        placeholder: '部门来源'
      })

      this.deptSources.setValue({
        id: position.orgId,
        name: position.orgName
      });
      _this.params.longNumber = position.orgLongNumber;
      this.$('#deptSources').on('bs.select.select', function (e, value, select) {
        _this.params.longNumber = value[0].longNumber;
        _this.name.setParams({
          longNumber: value[0].longNumber
        });
        _this.params.page = 1;
        _this.employeeTb.load(_this.params);
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
        _this.employeeTb.load(_this.params);
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
        // _this.employeeTb.load(_this.params);
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
        // _this.employeeTb.load(_this.params);
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
        // _this.employeeTb.load(_this.params);
      });

      $('#regionSelect').on('bs.select.clear', function (e, value, select) {
        _this.params.intentionCountyId = '';
        _this.params.intentionAreaId = '';
        _this.areaSelect.clearValue();
        _this.areaSelect.disable();
        // _this.params.page = 1;
        // _this.employeeTb.load(_this.params);
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
        // _this.employeeTb.load(_this.params);
      });

      $('#areaSelect').on('bs.select.clear', function (e, value, select) {
        _this.params.intentionAreaId = '';
        // _this.params.page = 1;
        // _this.employeeTb.load(_this.params);
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
        // _this.employeeTb.load(_this.params);
      });

      $('#gardenSelect').on('bs.select.clear', function (e, value, select) {
        _this.params.intentionGardenId = '';
        // _this.params.page = 1;
        // _this.employeeTb.load(_this.params);
      });
    },
    initEmployeeTb: function (opts) {
      var _this = this;
      opts.longNumber = opts.longNumber || _this.params.longNumber;
      this.employeeTb = this.$('#employeeTb').table({
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
            width: 100
          }, {
            title: '客户分组',
            name: 'customerGroupName',
            width: 90,
            alig: 'left'
          },
          // {
          //   title: '手机号码',
          //   name: 'phone',
          //   width: 88
          // },
          {
            title: '所有人',
            name: 'owner',
            width: 80
          }, {
            title: '部门',
            name: 'orgName',
            width: 78,
          }, {
            title: '来源',
            name: 'source',
            width: 70
          }, {
            title: '客户意向',
            name: 'intentionCityName',
            align: 'left',
            renderer: function (val, item, rowIndex) {
              var intention = mixin.privateIntention(item);
              return '<div class="ellips" style="text-align:left" title="' + intention + '">' + intention + '</div';
            },
            width: 260
          }, {
            title: '未跟进天数<div class="sort-container" data-type="lastFollowDate"><a class="pr js-sort-up"><span class="up-arrow"></span></a><a class="pr js-sort-down"><span class="down-arrow"></span></a></div>',
            name: 'notFollowNum',
            width: 90
          }, {
            title: '登记日期<div class="sort-container" data-type="createTime"><a class="pr js-sort-up"><span class="up-arrow"></span></a><a class="pr js-sort-down"><span class="down-arrow"></span></a></div>',
            name: 'registerDate',
            align: 'left',
            renderer: function (val, item, rowIndex) {
              return utils.formatDate(item.registerDate);
            },
            width: 90
          }, {
            title: '操作',
            name: 'oprate',
            width: 100,
            renderer: function (val, item, rowIndex) {
              return '<a class="op-a js-view" data-batch="' + item.batch + '" data-id="' + item.id + '" data-phone="' + item.phone + '" data-customer-id="' + item.customerId + '">查看</a>'
            }
          }
        ],
        params: opts,
        method: 'get',
        url: '/newhouse-web/customer/private/staff/list',
        transform: function (data) {
          if (data && data.result) {
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
        height: 'auto'
        // fullWidthRows: true
      });
      this.employeeTb.on('loadSuccess',function(e, data){
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
    }

  },
  events: {
    'click .js-view': 'viewCustomer',
    'click .js-query': 'queryRecord',
    'click .js-clear': 'clearQuery',
    'click .js-change-customer': 'changeCustomer',
    'mouseenter .customer-title': 'showTitle',
    'click .advance-search': 'advanceSearch',
    'click .js-sort-up,.js-sort-down': 'sortProcess'
  },

  handle: {
    viewCustomer: function (e) {
      this.parent.trigger('openViewCustomer', {
        type: 'private',
        el: this.$(e.target),
        idArr: this.idArr,
        typeDetail: 'employee'
      });
    },

    queryRecord: function (e) {
      var keyword = $.trim(this.$('#keyword').val());
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
      this.employeeTb.load(this.params);
    },

    clearQuery: function (e) {
      this.params = {};
      this.params.longNumber = position.orgLongNumber;
      this.waySel.render();
      this.customerGroup.render();
      this.layoutSelect.render();
      this.customerGroup.render();
      this.townSelect.render();
      this.regionSelect.clearValue();
      this.areaSelect.clearValue();
      this.regionSelect.disable();
      this.areaSelect.disable();
      this.gardenSelect.render();
      this.$('#keyword').val('');
      this.$('#intentionMinArea').val('');
      this.$('#intentionMaxArea').val('');
      this.$('#intentionMinPrice').val('');
      this.$('#intentionMaxPrice').val('');
      this.deptSources.render();
      this.deptSources.setValue({
        id: position.orgId,
        name: position.orgName
      });
      this.name.render();
      this.name.setParams({
        longNumber: position.orgLongNumber
      });
      this.params.page = 1;
      this.employeeTb.load(this.params);
    },

    changeCustomer: function (e) {
      var _this = this;
      var index = layer.open({
        type: 1,
        shadeClose: true,
        area: ['800px', '600px'],
        title: '转客',
        content: '<div id="changeCustomer"></div>'
      });

      var d = coala.mount(changeCustomer, '#changeCustomer');
      d.index = index;
      d.trigger('render', {
        longNumber: _this.params.longNumber
      });
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
      this.employeeTb.load(this.params);
    }
  }
};
