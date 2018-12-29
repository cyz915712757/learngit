var coala = require('coala');

var layer = require('components/layer');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
// var utils = require('../../../utils');

var storeDetail = require('./storeDetail');
var editAccount = require('./editAccount');
var pagination = require('components/pagination');
var tpl = require('./index.html');
require('../index.css');
module.exports = {
  tpl: tpl,
  refs: {
    paginationStore: {
      component: pagination,
      el: '#reportPag'
    }
  },
  listen: {
    init: function () {
      this.trigger('checkPermisson');
    },
    // 判断下员工管理访问权限
    checkPermisson: function () {
      var _this = this;
      var curPosName = null;
      this.data.station = amplify.store.sessionStorage('station');
      this.data.companyType = amplify.store.sessionStorage('stationCompanyType');
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
    mount: function () {
      this.queryParams = {
        page: 1
      };
      this.trigger('initEmployeeTb');
      this.trigger('initStatus');
      if (this.data.station === '公司负责人') {
        this.trigger('initStoreSel');
      }
      // this.trigger('initBrokerSel');
    },

    // 表单跳页
    jump: function (page, pageSize) {
      this.queryParams.page = page;
      this.employeeTb.load(this.queryParams);
    },

    // 初始化表单
    initEmployeeTb: function () {
      var _this = this;
      this.employeeTb = $('#storeEmployeeTb').table({
        cols: [{
          title: '分店名称',
          width: '130',
          renderer: function (val, item, rowIndex) {
            return '<a class="op-a js-view" data-id="' + item.id + '" data-status="' + status + '" data-self="' + item.ifMySelf
              + '">' + item.name + '</a>';
          }
        },
        {
          title: '分店码',
          name: 'storeNumber',
          width: '200'
        },
        {
          title: '分店地址',
          name: 'address',
          width: '220'
        },
        {
          title: '状态',
          name: 'statusDesc',
          width: '150'
        },
        {
          title: '添加日期',
          width: '128',
          renderer: function (value, item, index) {
            return item.createTime.substring(0, 10);
          }
        },
        {
          title: '操作',
          name: 'op',
          width: '130',
          renderer: function (val, item, rowIndex) {
            var status = item.statusDesc;
            var companyType = amplify.store.sessionStorage('stationCompanyType');
            var judge = '';
            var judgeRevise = '';
            if (companyType === 'OUTREACH') {
              if (status === '已停用') {
                judge = '<a class="op-a js-start" data-id="' + item.id + '" data-status="' + status + '" data-self="' + item.ifMySelf
              + '">启用</a>';
              } else {
                judge = '<a class="op-a js-close" data-id="' + item.id + '" data-status="' + status + '" data-self="' + item.ifMySelf
              + '">关闭</a>';
              }
              judgeRevise = '<a class="op-a js-revise" data-item="' + rowIndex + '" data-status="' + status + '" data-self="' + item.ifMySelf
              + '">修改</a>';
            }
            return judge + judgeRevise;
          }
        }
        ],
        params: this.queryParams,
        url: '/newhouse-web/outreach/store/getPagination',
        transform: function (data) {
          var pageParam = {
            currentPage: data.result.currentPage,
            pageCount: data.result.pageCount,
            pageSize: data.result.pageSize,
            totalCount: data.result.recordCount
          };
          _this.refs.paginationStore.trigger('refresh', pageParam);
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
        url: '/newhouse-web/outreach/store/getStoreStatus',
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
        url: '/newhouse-web/outreach/store/getStores',
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
    // 查看分店详情
    'click .js-view': 'viewDetail',
    // 添加账号
    'click #addAccount': 'addAccount',
    // 修改
    'click .js-revise': 'revise',
    // 关闭
    'click .js-close': 'switch',
    // 启用
    'click .js-start': 'switch'
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
      this.employeeStatus.render();
      this.storeSel.render();
      // this.brokerSel.render();
      this.trigger('loadTb');
      /* 重置重新加载当前列表 */
    },
    // 查看分店详情
    viewDetail: function (e) {
      var $el = $(e.currentTarget);
      var index = layer.open({
        type: 1,
        shadeClose: true,
        area: ['580px', '470px'],
        title: '分店资料',
        content: '<div id="storeDetail"></div>'
      });
      var detail = coala.mount(storeDetail, '#storeDetail');
      detail.data = {
        storeId: $el.data('id')
        // status: $el.data('status'),
        // self: $el.data('self')
      };
      detail.parent = this;
      detail.index = index;
      detail.trigger('render');
    },
    // 添加账号
    addAccount: function (e) {
      var $el = $(e.currentTarget);
      var index = layer.open({
        type: 1,
        shadeClose: true,
        area: ['580px', '470px'],
        title: '添加分店',
        content: '<div id="editAccount"></div>'
      });
      var edit = coala.mount(editAccount, '#editAccount');
      edit.parent = this;
      edit.index = index;
      var configObj = {
        type: 'add',
        getIitem: {},
        ajaxUrl: 'saveStore'
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
      var edit = coala.mount(editAccount, '#editAccount');
      var configObj = {
        type: 'modify',
        getItem: this.data[curIndex],
        ajaxUrl: 'updateStore'
      };
      // 挂载父亲
      edit.parent = this;
      edit.index = index;
      edit.trigger('render', configObj);
    },

    // 关闭
    close: function (e) {
      var _this = this;
      var $el = $(e.currentTarget);
      var $countEl = $('#storeNumber');
      var count = $countEl.html();
      var index = layer.open({
        skin: 'open-title',
        type: 1,
        shadeClose: true,
        area: ['375px', '160px'],
        title: '&nbsp',
        content: '<div class="tip-box warn-box pr"><i class="iconfont icon-gantanhao"></i>确定要关闭该分店么？</div>',
        btn: ['确定'],
        yes: function (index, layero) {
          layer.close(index); // 如果设定了yes回调，需进行手工关闭/
          $.ajax({
            type: 'get',
            url: '/newhouse-web/outreach/store/turnOffStore/' + $el.data('id'),
            dataType: 'json',
            success: function (data) {
              if (data.status == 'C0000') {
                count = +count - 1;
                $countEl.html(count);
                _this.trigger('loadTb');
                console.log(count, 999999);
                console.log($countEl, 11111);
                console.log(666666666);
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
    },
    // 关闭
    switch: function (e) {
      var _this = this;
      var $el = $(e.currentTarget);
      var cur = $el.html();
      var $countEl = $('#storeNumber');
      var count = $countEl.html();
      var curContent;
      var curUrl;
      if (cur === '关闭') {
        curContent = '<div class="tip-box warn-box pr"><i class="iconfont icon-gantanhao"></i>确定要关闭该分店么？</div>';
        curUrl = '/newhouse-web/outreach/store/turnOffStore/' + $el.data('id');
      } else {
        curContent = '<div class="tip-box warn-box pr"><i class="iconfont icon-gantanhao"></i>确定要启用该分店么？</div>';
        curUrl = '/newhouse-web/outreach/store/turnOnStore/' + $el.data('id');
      }
      var index = layer.open({
        skin: 'open-title',
        type: 1,
        shadeClose: true,
        area: ['375px', '160px'],
        title: '&nbsp',
        content: curContent,
        btn: ['确定'],
        yes: function (index, layero) {
          layer.close(index); // 如果设定了yes回调，需进行手工关闭/
          $.ajax({
            type: 'get',
            url: curUrl,
            dataType: 'json',
            success: function (data) {
              if (data.status == 'C0000') {
                if (cur === '关闭') {
                  count = +count - 1;
                } else {
                  count = +count + 1;
                }
                $countEl.html(count);
                _this.trigger('loadTb');
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
