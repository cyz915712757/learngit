var coala = require('coala');

var layer = require('components/layer');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
// var utils = require('../../../utils');

var accountDetail = require('./accountDetail');
var editAccount = require('./editAccount');
var pagination = require('components/pagination');
var tpl = require('./index.html');
require('../index.css');
module.exports = {
  tpl: tpl,
  refs: {
    pagination: {
      component: pagination,
      el: '#reportPage'
    }
  },
  listen: {
    init: function () {
      this.trigger('checkPermisson');
    },

    mount: function () {
      this.queryParams = {
        page: 1
      };
    },

    updated: function () {
      this.trigger('initEmployeeTb');
      // this.trigger('initStatus');
      if (this.data.station === '公司负责人') {
        this.trigger('initStoreSel');
      }
      this.trigger('initBrokerSel');
    },

    render: function (introObj) {
      this.data = introObj;
      this.data.station = amplify.store.sessionStorage('station');
      this.data.companyType = amplify.store.sessionStorage('stationCompanyType');
      this.update();
    },
    // 判断下员工管理访问权限
    checkPermisson: function () {
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
      if (!(
        (curPosName === '公司负责人' || curPosName === '店长')
      && (companyType === 'OUTREACH' || companyType === 'SALES')
      )) {
        location.replace('403.html');
      }
    },


    // 表单跳页
    jump: function (page, pageSize) {
      this.queryParams.page = page;
      this.employeeTb.load(this.queryParams);
    },

    // 初始化表单
    initEmployeeTb: function () {
      var _this = this;
      this.employeeTb = $('#employeeTb').table({
        cols: [{
          title: '员工名称',
          width: '100',
          renderer: function (val, item, rowIndex) {
            var status = item.employee && item.employee.status;
            return '<a class="op-a js-view" data-id="' + item.id + '" data-status="' + status + '" data-self="' + item.ifMySelf
            + '">' + item.name + '</a>';
          }
        },
        {
          title: '分店',
          name: 'txtStoreName',
          width: '200'
        },
        {
          title: '电话',
          name: 'userName',
          width: '150'
        },
        {
          title: '岗位',
          name: 'brokerPositionDesc',
          width: '150'
        },
        {
          title: '录入日期',
          width: '128',
          renderer: function (value, item, index) {
            return item.employee && item.employee.createTime && item.employee.createTime.substring(0, 10);
          }
        },
        {
          title: '状态',
          width: '100',
          renderer: function (value, item, index) {
            return item.employee && item.employee.statusDesc;
          }
        },
        {
          title: '操作',
          name: 'op',
          width: '130',
          renderer: function (val, item, rowIndex) {
            var status = item.employee && item.employee.status;
            var station = amplify.store.sessionStorage('station');
            var companyType = amplify.store.sessionStorage('stationCompanyType');
            var judgeRevise = '';
            var judgeResign = '';
            if (companyType === 'OUTREACH') {
              if (item.brokerPositionDesc === '公司负责人' && station === '店长') {
                judgeRevise = '<a class="op-disabled" data-item="' + rowIndex + '" data-status="' + status + '" data-self="' + item.ifMySelf
              + '">修改</a>';
                judgeResign = '<a class="op-disabled" data-id="' + item.id + '" data-status="' + status + '" data-self="' + item.ifMySelf
              + '">离职</a>';
              } else {
                judgeRevise = '<a class="op-a js-revise" data-item="' + rowIndex + '" data-status="' + status + '" data-self="' + item.ifMySelf
              + '">修改</a>';
                judgeResign = '<a class="op-a js-resign" data-id="' + item.id + '" data-status="' + status + '" data-self="' + item.ifMySelf
              + '">离职</a>';
              }
            }
            return judgeRevise + judgeResign;
          }
        }
        ],
        params: this.queryParams,
        url: '/newhouse-web/outreach/employee/getBrokerAndEmp',
        transform: function (data) {
          var pageParam = {
            currentPage: data.result.currentPage,
            pageCount: data.result.pageCount,
            pageSize: data.result.pageSize,
            totalCount: data.result.recordCount
          };
          _this.refs.pagination.trigger('refresh', pageParam);
          _this.data = data.result.items;
          return data.result;
        },
        showBackboard: false,
        height: 'auto'
        // fullWidthRows: true
      });
    },
    // 状态选择离职等
    initStatus: function () {
      var _this = this;
      this.employeeStatus = this.$('#status').select({
        url: '/newhouse-web/outreach/employee/getEmployeeStatus',
        dataFormater: function (data) {
          data.result.unshift({
            id: 'all',
            name: '全部'
          });
          return data.result;
        },
        width: 135,
        placeholder: '状态'
      });
      this.$('#status').on('bs.select.select', function (e, value, select) {
        if (value.id == 'all') {
          _this.queryParams.status = null;
          return;
        }
        _this.queryParams.status = value.id;
      });
    },
    // 分店选择
    initStoreSel: function () {
      var _this = this;
      this.storeSel = this.$('#storeSel').select({
        url: '/newhouse-web/outreach/employee/getStores',
        dataFormater: function (data) {
          data.result.unshift({
            id: 'all',
            name: '全部'
          });
          return data.result;
        },
        keyword: 'storeName',
        width: 135,
        placeholder: '分店'
      });
      this.$('#storeSel').on('bs.select.select', function (e, value, select) {
        if (value.id == 'all') {
          _this.queryParams.storeId = null;
          return;
        }
        _this.queryParams.storeId = value.id;
      });
    },
    // 初始化经纪人名
    initBrokerSel: function () {
      var _this = this;
      this.brokerSel = this.$('#brokerName').select({
        url: '/newhouse-web/outreach/employee/getBrokerList',
        keyword: 'nameAndUserNameLike',
        dataFormater: function (data) {
          return data.result;
        },
        itemFormater: function (item) {
          return '<a href="javascript:;" data-id="' + item.id + '">' + item.name + '&nbsp;(' + item.userName + ')</a>';
        },
        search: true,
        placeholder: '经纪人名称/手机号'
      });
      this.$('#brokerName').on('bs.select.select', function (e, value, select) {
        _this.queryParams.id = value.id;
        _this.queryParams.nameAndUserNameLike = null;
      });
      this.$('#brokerName').on('bs.select.clear', function (e, value, select) {
        _this.queryParams.id = null;
        _this.queryParams.nameAndUserNameLike = null;
      });
    },
    loadTb: function () {
      this.queryParams.page = 1;
      this.employeeTb.load(this.queryParams);
    }
  },
  events: {
    // 查询汇总数据和列表
    'click #queryBtn': 'queryFun',
    // 重置查询条件
    'click #resetBtn': 'resetFun',
    // 查看账户详情
    'click .js-view': 'viewDetail',
    // 添加账号
    'click #addAccount': 'addAccount',
    // 修改
    'click .js-revise': 'revise',
    // 离职
    'click .js-resign': 'resign'
  },

  handle: {

    // 查询列表
    queryFun: function () {
      // 不选择的时候
      var brokerVal = $.trim(this.$('#brokerName .form-control').val());
      if (!(this.queryParams.id) && brokerVal) {
        this.queryParams.nameAndUserNameLike = brokerVal;
      }
      this.trigger('loadTb');
    },

    // 重置查询条件
    resetFun: function () {
      this.queryParams = {
        page: 1,
        id: null,
        nameAndUserNameLike: null,
        status: null,
        storeId: null
      };
      // this.employeeStatus.render();
      this.storeSel.render();
      this.brokerSel.render();
      this.trigger('loadTb');
      /* 重置重新加载当前列表 */
    },
    // 查看账户详情
    viewDetail: function (e) {
      var $el = $(e.currentTarget);
      var index = layer.open({
        type: 1,
        shadeClose: true,
        area: ['580px', '470px'],
        title: '个人资料',
        content: '<div id="accountDetail"></div>'
      });
      var detail = coala.mount(accountDetail, '#accountDetail');
      detail.data = {
        brokerId: $el.data('id'),
        status: $el.data('status'),
        self: $el.data('self')
      };
      detail.parent = this;
      detail.trigger('render');
    },
    // 添加账号
    addAccount: function (e) {
      var $el = $(e.currentTarget);
      var curStation = amplify.store.sessionStorage('station');
      var defaultStore = amplify.store.sessionStorage('stationStoreName');
      var defaultStoreNum = amplify.store.sessionStorage('stationStoreNum');
      var defaultStoreId = amplify.store.sessionStorage('stationStoreId');
      var curStore;
      if (curStation === '店长') {
        curStore = {
          station: curStation,
          storeId: defaultStoreId,
          txtStoreName: defaultStore,
          storeNum: defaultStoreNum
        };
      }
      var index = layer.open({
        type: 1,
        shadeClose: true,
        area: ['580px', '470px'],
        title: '添加经纪人',
        content: '<div id="editAccount"></div>'
      });
      var edit = coala.mount(editAccount, '#editAccount');
      edit.parent = this;
      edit.index = index;
      var configObj = {
        type: 'add',
        getItem: curStore,
        ajaxUrl: 'saveBroker'
      };
      edit.trigger('render', configObj);
    },
    // 修改
    revise: function (e) {
      var $el = $(e.currentTarget);
      var curIndex = $el.data('item');
      var index = layer.open({
        type: 1,
        shadeClose: true,
        area: ['580px', '470px'],
        title: '修改资料',
        content: '<div id="editAccount"></div>'
      });
      var storeObj = {
        storeNumber: this.data[curIndex].store.storeNumber
      };
      var edit = coala.mount(editAccount, '#editAccount');
      var configObj = {
        type: 'modify',
        getItem: $.extend(this.data[curIndex], storeObj),
        ajaxUrl: 'updateBroker'
      };
      // 挂载父亲
      edit.parent = this;
      edit.index = index;
      edit.trigger('render', configObj);
    },

    // 离职
    resign: function (e) {
      var _this = this;
      var $el = $(e.currentTarget);
      var $countEl = $('#agentNumber');
      var $newAgent = $('#newPeople');
      var count = $countEl.html();
      var newPeople = $newAgent.html();
      var index = layer.open({
        skin: 'open-title',
        type: 1,
        shadeClose: true,
        area: ['375px', '160px'],
        title: '&nbsp',
        content: '<div class="tip-box warn-box pr"><i class="iconfont icon-gantanhao"></i>确认离职？</div>',
        btn: ['确定'],
        yes: function (index, layero) {
          // layer.close(index); //如果设定了yes回调，需进行手工关闭
          $.ajax({
            type: 'POST',
            url: '/newhouse-web/outreach/employee/left',
            data: {
              brokerId: $el.data('id')
            },
            dataType: 'json',
            success: function (data) {
              if (data.status == 'C0000') {
                layer.msg('离职成功!');
                count = +count - 1;
                newPeople = +newPeople - 1;
                if (newPeople === 0) {
                  _this.parent.trigger('getSummary');
                } else {
                  $countEl.html(count);
                  $newAgent.html(newPeople);
                  _this.trigger('loadTb');
                }
                setTimeout(function () {
                  layer.closeAll();
                }, 1500);
              } else {
                layer.msg(data.message);
              }
            }
          });
        }
      });
    }

  }

};
