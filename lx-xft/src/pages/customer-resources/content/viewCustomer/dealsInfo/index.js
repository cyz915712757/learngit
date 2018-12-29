var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    getDealsInfo: function(opts) {
      //获取成交记录接口
      var _this = this;
      this.phone = opts.phone;

      this.dealsTb = this.$('#dealsTable').table({
        cols: [{
            title: '成交时间',
            name: 'dealTime',
            renderer: function(val, item, rowIndex) {
              return item.dealTime.substring(0, 10);
            }
          },
          // { title: '类型', name: 'type' },
          { title: '成交楼盘', name: 'gardenName' },
          { title: '户型', name: 'doorModel' },
          { title: '面积', name: 'area' }, {
            title: '成交价格',
            name: 'price',
            renderer: function(val, item, rowIndex) {
              return (item.price / 10000) + '万';
            }
          },
          { title: '经纪人', name: 'employee' }
        ],
        params: {
          phone: opts.phone,
          page: opts.page || 1
        },
        method: 'get',
        url: '/newhouse-web/customer/basic/deals',
        transform: function(data) {
          return data.result;
        },
        showBackboard: false,
        height: 'auto',
        fullWidthRows: true
      });
    }
  }

}
