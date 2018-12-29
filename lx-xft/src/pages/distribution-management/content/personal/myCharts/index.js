var tpl = require('./index.html');
require('./index.css');
// 引入 ECharts 主模块
var echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/pie');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function () {
      this.trigger('generatePie');
    },

    generatePie: function () {
      var _this = this;
      // 基于准备好的dom，初始化echarts实例
      $.ajax({
        url: '/newhouse-web/distribution/personal/statistics',
        success: function (data) {
          if (data.status === 'C0000') {
            var result = data.result;
            //获取最大值
            var arr = [];
            arr.push(result.RESERVATION_SUCCESSFUL);
            arr.push(result.GUIDE_SUCCESSFUL);
            arr.push(result.BARGAIN);
            arr.sort(function (a, b) {
              if (a > b) {
                return 1
              }else if (a < b) {
                return -1
              }else {
                return 0
              };
            });

            _this.data = result;
            _this.data.maxValue = arr[2];
            _this.update();

            var myChart = echarts.init($('#statisticsPie')[0]);
            myChart.setOption({
              color: ['#66cd2e', '#00afec', '#7460ee'],
              series: [{
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                label: {
                  normal: {
                    show: true,
                    position: 'center',
                    formatter: '已成交\n' + result.BARGAIN,
                    textStyle: {
                      color: '#999',
                      fontSize: '20',
                      fontWeight: 'bold'
                    }
                  }
                },
                data: [{
                    value: result.PAIED,
                    name: '已结算'
                  },
                  {
                    value: result.NON_PAIED,
                    name: '待结算'
                  },
                  {
                    value: result.PART_PAIED,
                    name: '部分结算'
                  }
                ]
              }]
            });

            myChart.on('mouseover', function (params) {
              var index = 2 - (+params.dataIndex);
              _this.$('.desc-statis-wrapper li:eq("' + index + '")').addClass('current').siblings().removeClass('current');
            });
          }

        }
      });

    }
  }
};