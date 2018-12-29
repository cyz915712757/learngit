var tpl = require('./index.html');
require('./index.css');
var pagination = require('components/pagination');

module.exports = {
  tpl: tpl,
  refs: {
    pagination: {
      component: pagination,
      el: '#reservationsPage'
    }
  },
  listen: {
    getReservationsInfo: function(opts) {
      //获取报备记录接口
      var _this = this;
      this.phone = opts.phone;

      this.reservationsTb = this.$('#reservationsTable').table({
        cols: [
          { title: '报备楼盘', name: 'gardenName' },
          { title: '经纪人', name: 'employeeName', },
          {
            title: '报备时间',
            name: 'reservationTime',
            renderer: function(val, item, rowIndex) {
              return item.reservationTime.substring(0, 10);
            }
          }
        ],
        params: {
          phone: opts.phone,
          page: opts.page || 1
        },
        method: 'get',
        url: '/newhouse-web/customer/basic/reservations',
        transform: function(data) {
          if (data.result) {
            return data.result.items;
          } else {
            data.result = [];
          }
        },
        showBackboard: false,
        height: 'auto',
        fullWidthRows: true
      });
      this.reservationsTb.on('loadSuccess',function(e, data){
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
    jump: function(page, pageSize) {
      this.reservationsTb.load({ phone: this.phone, page: page });
    }
  }
}
