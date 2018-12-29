var coala = require('coala');
// 引入 ECharts 主模块
var echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/line');
require('echarts/lib/component/tooltip');
require('echarts/lib/component/title');

var config = require('config');
var layer = require('components/layer');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
var utils = require('../../../../utils');

var personStastis = require('./personStastis');
var tpl = require('./index.html');
require('./index.css');

// 产品要求点击查询按钮在当前菜单选项，重置切换到默认菜单选项
module.exports = {
  tpl: tpl,
  refs: {
    personStastis: {
      component: personStastis,
      el: '#comonTbBox'
    }
  },

  listen: {
    init: function () {
      this.trigger('renderType');
      this.queryParams = {
        page: 1,
        date: 7
      }
      this.tab = {
        chartTab: 'addPrivateCustomerCount',
        listTab: 'personStastis'
      };
    },

    mount: function () {
      var _this = this;
      this.comonTbBox = this.refs.personStastis;
      this.refs.personStastis.trigger('initPersonTb', this.queryParams);
      this.trigger('initChart');
      this.trigger('loadChart');
      this.trigger('initDept');
      this.trigger('initDatePicker');
      this.$('#brokerName').on('change', function () {
        _this.queryParams.brokerName = this.value
      });
    },

    unmount: function () {
      this.startPicker.datetimepicker('remove');
      this.endPicker.datetimepicker('remove');
    },

    renderType: function () {
      var curPosName = null;
      var position = amplify.store.sessionStorage('position');
      if (position) {
        curPosName = position[0].positionName;
      }
      switch (curPosName) {
        case '店长':
        case '营销经理':
        case '营销主管':
        case '网销经理':
          this.data.dept = 2;
          break;
        //总监等有部门列表
        default:
          this.data.dept = 1;
          break;
      }
    },

    loadChart: function () {
      var _this = this;
      $.ajax({
        type: 'GET',
        url: '/newhouse-web/customer/statistics/chart',
        dataType: 'json',
        data: _this.queryParams,
        success: function (data) {
          if (data.status != 'C0000') {
            return;
          }
          _this.chartData = data.result;
          var max = null;
          if (Math.max.apply(null, _this.chartData[_this.tab.chartTab]) < 5) {
            max = 5;
          }
          _this.myChart.setOption({
            xAxis: {
              data: data.result.timelimit
            },
            yAxis: {
              max: max
            },
            series: [{
              data: data.result[_this.tab.chartTab]
            }]
          });

          /*判断日月周显示*/
          if (data.result.dateRange) {
            return;
          }
          var xtype = '日';
          if (data.result.dateRange[0] > 30 && data.result.dateRange[0] <= 90) {
            xtype = '周';
          } else if (data.result.dateRange[0] > 90) {
            xtype = '月';
            _this.$('#xtype').text(xtype);
          }
        }
      });
    },

    initChart: function () {
      var option = {
        title: {
          show: false
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#fff',
          padding: 0,
          borderWidth: 1,
          borderColor: '#e4e4e4',
          axisPointer: {
            lineStyle: {
              color: '#00b4ed'
            }
          },
          textStyle: {
            color: '#666',
            fontSize: 12
          },
          extraCssText: 'border-radius:4px',
          formatter: function (params, ticket, callback) {
            return '<p class="chart-tiptop">' + params[0].name + '</p><p class="chart-tipbt">' + params[0].data + '</p>';
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            show: true,
          },
          axisLine: {
            lineStyle: {
              color: '#333'
            }
          },
          textStyle: {
            color: '#333',
            fontSize: '12',
          },
          data: []
        }],
        yAxis: [{
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#333'
            }
          },
          textStyle: {
            color: '#333',
            fontSize: '12',
          }
        }],
        series: [{
          type: 'line',
          symbolSize: 4,
          label: {
            normal: {
              position: 'top'
            }
          },
          areaStyle: {
            normal: {}
          },
          itemStyle: {
            normal: {
              color: '#00b4ed',
              lineStyle: {
                color: '#00b4ed',
                width: 1
              },
              areaStyle: {
                color: '#fff5ea'
              }
            }
          },
          data: []
        }]
      };
      this.myChart = echarts.init(document.getElementById('chart'));

      // 绘制图表
      this.myChart.setOption(option);
    },

    initDept: function () {
      var _this = this;
      this.deptSources = this.$('#deptSel').select({
        treeOption: {
          url: '/newhouse-web/customer/basic/deptTree',
          idField: 'id',
          nameField: 'name',
          multiple: false,
          dataFormater: function (data) {
            return data.result;
          }
        },
        width: 180,
        placeholder: '部门来源'
      });
      this.$('#deptSel').on('bs.select.select', function (e, value, select) {
        _this.queryParams.longNumber = value[0].longNumber;
        _this.queryParams.page = 1;
        if (!_this.checkTime) {
          return;
        }
        _this.comonTbBox.trigger('loadTb', _this.queryParams);
        _this.trigger('loadChart');
      });
      this.$('#deptSel').on('bs.select.clear', function (e, value, select) {
        _this.queryParams.longNumber = null;
        _this.queryParams.page = 1;
        if (!_this.checkTime) {
          return;
        }
        _this.comonTbBox.trigger('loadTb', _this.queryParams);
        _this.trigger('loadChart');
      });
    },

    initDatePicker: function () {
      var _this = this;
      var dateOpt = {
        format: 'yyyy-mm-dd',
        minView: 2,
        initialDate: utils.dateOp(new Date(), 2),
        endDate: utils.dateOp(new Date(), 2)
      };
      this.startPicker = this.$('#startDate').datetimepicker(dateOpt).on('hide', function (e) {
        this.blur();
      }).on('changeDate', function (ev) {
        _this.$('.js-dateitem').removeClass('cur');
        _this.endPicker.datetimepicker('setStartDate', ev.date);

        /*设置时间跨度不能大于1年*/
        if (new Date(utils.dateOp(new Date(), 2)).getTime() < new Date(utils.dateOp(ev.date, -364)).getTime()) {
          _this.endPicker.datetimepicker('setEndDate', utils.dateOp(new Date(), 2));
        } else {
          _this.endPicker.datetimepicker('setEndDate', utils.dateOp(ev.date, -364));
        }
        _this.queryParams.date = null;
        _this.queryParams.startDate = utils.dateOp(ev.date);
      });
      this.startPicker.next('.js-dicon').on('click', function () {
        _this.startPicker.datetimepicker('show');
      });
      this.endPicker = this.$('#endDate').datetimepicker(dateOpt).on('changeDate', function (ev) {
        _this.$('.js-dateitem').removeClass('cur');
        _this.startPicker.datetimepicker('setEndDate', ev.date);
        _this.startPicker.datetimepicker('setStartDate', utils.dateOp(ev.date, 366));
        _this.queryParams.date = null;
        _this.queryParams.endDate = utils.dateOp(ev.date);
      }).on('hide', function (e) {
        this.blur();
      });
      this.endPicker.next('.js-dicon').on('click', function () {
        _this.endPicker.datetimepicker('show');
      });
    }
  },

  mixins: [{
    requireDeptStastis: function () {
      var _this = this;
      require.ensure([], function () {
        _this.comonTbBox = coala.mount(require('./deptStastis'), '#comonTbBox');
        _this.comonTbBox.parent = _this;
        _this.comonTbBox.trigger('initDeptTb', _this.queryParams);
      });
    },

    requirePersonStastis: function () {
      this.comonTbBox = coala.mount(personStastis, '#comonTbBox');
      this.comonTbBox.parent = this;
      this.comonTbBox.trigger('initPersonTb', this.queryParams);
    },

    checkTime: function () {
      if (this.queryParams.endDate && (!this.queryParams.startDate)) {
        layer.msg('请选择开始时间！');
        return;
      }
      if (this.queryParams.startDate && (!this.queryParams.endDate)) {
        layer.msg('请选择结束时间！');
        return;
      }
      return true;
    }

  }],

  events: {
    'click #stastisHead.more a.item': 'stastisHeadFun',
    'click .js-dateitem': 'dateFun',
    'click #chartHead a': 'chartHeadFun',
    'click #queryBtn': 'queryFun',
    'click #resetBtn': 'resetFun'
  },

  handle: {

    // 部门列表和人员列表菜单点击切换
    stastisHeadFun: function (e) {
      var $tagEl = $(e.currentTarget);
      if (!$tagEl.hasClass('cur')) {
        $tagEl.addClass('cur').siblings('.cur').removeClass('cur');
      }
      if (this.comonTbBox) {
        this.comonTbBox.unmount();
      }
      this.queryParams.page = 1;
      switch ($tagEl.data('type')) {
        // 人员
        case 'personStastis':
          this.requirePersonStastis();
          break;
        // 部门
        case 'deptStastis':
          this.requireDeptStastis();
          break;
      }
    },

    // 时间item点击，最近7天和最近30天快速选择
    dateFun: function (e) {
      var $tagEl = $(e.currentTarget);
      var $startDate = this.$('#startDate');
      var $endDate = this.$('#endDate');
      this.queryParams.page = 1;
      if (!$tagEl.hasClass('cur')) {
        $tagEl.addClass('cur').siblings('.cur').removeClass('cur');
      }
      this.queryParams.date = $tagEl.data('date');
      this.queryParams.startDate = null;
      this.queryParams.endDate = null;
      this.comonTbBox.trigger('loadTb', this.queryParams);
      this.trigger('loadChart');
      $endDate.datetimepicker('setEndDate', new Date());
      $endDate.datetimepicker('setStartDate', null);
      $startDate.datetimepicker('setEndDate', new Date());
      $startDate.datetimepicker('setStartDate', null);
      $startDate.val('')
      $endDate.val('');
    },

    // 图表菜单点击
    chartHeadFun: function (e) {
      var _this = this;
      var $tagEl = $(e.currentTarget);
      var max = null;
      this.tab.chartTab = $tagEl.data('type');
      if (!$tagEl.hasClass('cur')) {
        $tagEl.addClass('cur').siblings('.cur').removeClass('cur');
      }
      if (Math.max.apply(null, _this.chartData[_this.tab.chartTab]) < 5) {
        max = 5;
      }
      this.myChart.setOption({
        xAxis: {
          data: _this.chartData.timelimit
        },
        yAxis: {
          max: max
        },
        series: [{
          data: _this.chartData[_this.tab.chartTab]
        }]
      });
    },

    // 查询按钮
    queryFun: function () {
      if (!this.checkTime) {
        return;
      }
      this.queryParams.page = 1;
      this.comonTbBox.trigger('loadTb', this.queryParams);
      this.trigger('loadChart');
    },

    // 重置按钮
    resetFun: function () {
      var $startDate = this.$('#startDate');
      var $endDate = this.$('#endDate');

      // 重置到默认菜单
      this.$('.js-dateitem').eq(0).addClass('cur').siblings().removeClass('cur');
      this.$('#chartHead a').eq(0).addClass('cur').siblings().removeClass('cur');
      this.$('#stastisHead.more a').eq(0).addClass('cur').siblings().removeClass('cur');

      // 重置默认条件值
      this.queryParams.date = this.$('.js-dateitem').eq(0).data('d');
      this.deptSources.render();
      this.$('#brokerName').val('');
      $startDate.val('');
      $endDate.val('');

      // 重新设置时间插件
      $startDate.datetimepicker('setEndDate', new Date());
      $startDate.datetimepicker('setStartDate', null);
      $endDate.datetimepicker('setEndDate', new Date());
      $endDate.datetimepicker('setStartDate', null);

      /*重置条件到加载最近7天数据，加载人员列表*/
      this.tab.chartTab = 'addPrivateCustomerCount';
      this.queryParams = {
        page: 1,
        startDate: null,
        endDate: null,
        orgErpId: null,
        borderName: null,
        date: 7
      };
      this.requirePersonStastis();
      this.trigger('loadChart');
    }
  }
};
