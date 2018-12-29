var coala = require('coala');
var config = require('config');
var utils = require('../../../../utils');
var pagination = require('components/pagination');
var layer = require('components/layer');
var reportDialog = require('components/reportDialog');
var mixin = require('../publicMixin.js');
var viewCustomer = require('../viewCustomer');
var importInfo = require('./importInfo');
var tpl = require('./index.html');
require('./index.css');

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
      this.resourcesTbm.load(this.queryParams);
    },
    mount: function() {
      var _this = this;
      this.trigger('initResourcesTb');
      this.trigger('initdatePicker');
      this.trigger('initDeptSources');
      this.$('#importBatch').on('change',function(){_this.params.batch = this.value});
    },
    unmount: function() {
      this.startPicker.datetimepicker('remove');
      this.endPicker.datetimepicker('remove');
    },
    initDeptSources: function() {
      var _this = this;
      this.deptSources = this.$('#deptSources').select({
        treeOption: {
          url: '/newhouse-web/customer/basic/deptTree',
          idField: 'id',
          nameField: 'name',
          multiple: false,
          dataFormater: function(data) {
            var _this = this;
            return data.result;
          }
        },
        width: 200,
        placeholder: '部门来源'
      });
      this.$('#deptSources').on('bs.select.select', function(e, value, select) {
        _this.queryParams.longNumber = value[0].longNumber;
        _this.queryParams.page = 1;
        _this.resourcesTbm.load(_this.queryParams);
      });
    },
    initResourcesTb: function() {
      var _this = this;
      this.resourcesTbm = this.$('#resourcesTb').table({
        cols: [{
          title: '导入日期',
          name: 'createTime',
          width: 80,
          renderer: function(val, item, rowIndex) {
            return utils.formatDate(item.createTime);
          }
        }, {
          title: '导入批次',
          name: 'batch',
          width: 96
        }, {
          title: '客户来源',
          name: 'waySourceStr',
          width: 85
        }, {
          title: '导入人',
          name: 'createUserName',
          width: 80,
          align: 'left'
        }, {
          title: '归属部门',
          name: 'orgName',
          width: 145
        }, {
          title: '导入成功数',
          name: 'importSuccessCount',
          width: 98
        }, {
          title: '同步数',
          name: 'syncCount',
          width: 98
        }, {
          title: '转私数',
          name: 'privateCount',
          width: 98
        }, {
          title: '报备数',
          name: 'reservationCount',
          width: 98
        }, {
          title: '操作',
          name: 'op',
          width: 80,
          renderer: function(val, item, rowIndex) {

            var synchAuth = '';

            if (item.importSuccessCount > item.syncCount) {
              synchAuth = '<a class="op-a js-synch" data-item="' + $.param(item) + '">同步</a>';
            }

            if (item.syncCount > 0) {
              return '<div class="js-opbox">' + synchAuth + '</div>'
            } else {
              return '<div class="js-opbox">' + synchAuth + '<a class="op-a js-delete" data-item="' + $.param(item) + '">删除</a></div>'
            }
          }
        }],
        params: {},
        method: 'get',
        url: '/newhouse-web/customer/batch/list',
        transform: function(data) {
          if (data.result.items.length>0) {
            var idArr = [];
            $.each(data.result.items, function(index, el) {
              idArr.push(el.id);
            });
            _this.$('#importCounts').text(data.result.extendContent.importSuccessCounts);
            _this.$('#reservationCounts').text(data.result.extendContent.reservationCounts);
            _this.$('#privateCounts').text(data.result.extendContent.privateCounts);
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
      this.resourcesTbm.on('loadSuccess',function(e, data){
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
    'click .js-delete': 'deleteFun',
    'click .js-synch': 'synchFun',
    'click #importBtn': 'importFun'
  },

  handle: {
    queryFun: function() {
      this.queryParams.page = 1;
      this.queryParams.batch = $.trim(this.$('#importBatch').val());
      this.resourcesTbm.load(this.queryParams);
    },
    deleteFun: function(e) {
      var _this = this;
      var item = mixin.unparam(this.$(e.currentTarget).data('item'));
      var date = utils.formatDate(item.createTime);
      layer.confirm('确定要删除 ' + date + ' 导入，归属“ ' + item.orgName + ' ”的 ' + item.importSuccessCount + ' 条资源客吗', {
        btn: ['确定', '取消'],
        closeBtn: 0
      }, function(index) {

        $.ajax({
          url: '/newhouse-web/customer/batch/delete',
          type: 'post',
          data: {
            batch: item.batch
          },
          success: function(data) {
            if (data.status === 'C0000') {
              layer.msg(data.message);
              setTimeout(function() {
                layer.close(index);
                _this.resourcesTbm.load(_this.queryParams);
              }, 2000);
            } else {
              layer.msg(data.message);
            }

          }
        });
      }, function(index) {
        layer.close(index);
      });
    },

    synchFun: function(e) {
      var _this = this;
      var item = mixin.unparam(this.$(e.currentTarget).data('item'));
      var date = utils.formatDate(item.createTime);

      var result = '<div class="sync-resource-wrapper">' +
        '<p>导入批次：<span> ' + item.batch + ' </span></p>' +
        '<p>客户来源：<span> ' + item.waySourceStr + ' </span></p>' +
        '<p>归属部门：<span> ' + item.orgName + ' </span></p>' +
        '<p>导入人员：<span> ' + item.createUserName + ' </span></p>' +
        '<p>导入时间：<span> ' + date + ' </span></p>' +
        '<p>资源总数：<span> ' + item.importSuccessCount + ' </span></p>' +
        '<p>未同步数：<span> ' + (parseInt(item.importSuccessCount, 10) - parseInt(item.syncCount, 10)) + ' </span></p>' +
        // '<p class="sync-msg">同步完成：成功<span id="successCount">0</span></p>' +
        '</div>';
      layer.confirm(result, {
        btn: ['同步'],
        area: ['490px', '400px']
      }, function(index) {

        var $el = $('.layui-layer-btn a:contains("同步")')
        if (!$el.hasClass('sync-reset-btn')) {

          function syncBatch() {
            var deferred = $.Deferred();
            $.ajax({
              url: '/newhouse-web/customer/sync/syncBatch',
              type: 'post',
              data: {
                batch: item.batch
              },
              beforeSend: function() {
                $el.removeClass('layui-layer-btn0').addClass('sync-reset-btn');
              },
              success: function(data) {
                if (data.status === 'C0000') {
                  deferred.resolve();
                } else if (data.status === 'C0001') {
                  deferred.resolve(); //标示后台已有此进程进行同步
                } else {
                  deferred.reject();
                }
              }
            });
            return deferred;
          }

          var d1 = syncBatch();
          $.when(d1).done(function() {
            setTimeout(function(){
              layer.closeAll();
            },1500);
            var i = setInterval(function() {
              (function longPolling() {
                $.ajax({
                  url: "/newhouse-web/customer/sync/syncBatchProgreee",
                  data: { batch: item.batch },
                  timeout: 5000,
                  success: function(result, textStatus) {
                    if (result.status === 1) {
                      clearInterval(i);
                      setTimeout(function() {
                        layer.closeAll();
                        _this.resourcesTbm.load(_this.queryParams);
                      }, 3000);
                    } else {
                      layer.msg('正在同步中，请耐心等候...', {
                        icon: 16,
                        shade: 0.01
                      });
                    }
                  }
                });

              })();

            }, 3000);
          });
        }
      }, function(index) {
        layer.close(index);
      });
    },

    importFun: function(e) {
      var _this = this;
      var index = layer.open({
        type: 1,
        shadeClose: false,
        area: ['490px', '400px'],
        title: '资源导入',
        content: '<div id="importWrapper"></div>',
        cancel: function(index, layero) {
          _this.resourcesTbm.load(_this.queryParams);
        }
      });
      var importInfoCom = coala.mount(importInfo, '#importWrapper');
      importInfoCom.index = index;
      importInfoCom.parent = _this;
      importInfoCom.trigger('render');
    },

    resetFun: function() {
      this.queryParams = {};
      this.deptSources.render();
      this.$('#importBatch').val('');
      this.$('#startDate').val('');
      this.$('#endDate').val('');
      /*重新设置时间插件*/
      this.$('#startDate').datetimepicker('setEndDate', new Date());
      this.$('#startDate').datetimepicker('setStartDate', null);
      this.$('#endDate').datetimepicker('setEndDate', new Date());
      this.$('#endDate').datetimepicker('setStartDate', null);
      this.resourcesTbm.load(this.queryParams);
    }
  }
};
