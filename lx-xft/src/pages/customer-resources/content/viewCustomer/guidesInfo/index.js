var tpl = require('./index.html');
require('./index.css');
var pagination = require('components/pagination');

module.exports = {
  tpl: tpl,
  refs: {
    pagination: {
      component: pagination,
      el: '#guidesPage'
    }
  },
  listen: {
    getGuidesInfo: function(opts) {
      var _this = this;
      this.phone = opts.phone;
      //获取带看记录接口
      this.guidesTb = this.$('#guidesTable').table({
        cols: [{
            title: '带看时间',
            name: 'guideTime',
            renderer: function(val, item, rowIndex) {
              return item.guideTime.substring(0, 10);
            }
          },
          // { title: '类型', name: 'type' },
          { title: '带看楼盘', name: 'gardenName' },
          { title: '经纪人', name: 'employeeName', }
        ],
        params: {
          phone: opts.phone,
          page: opts.page || 1
        },
        method: 'get',
        url: '/newhouse-web/customer/basic/guides',
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
      this.guidesTb.on('loadSuccess',function(e, data){
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
      this.guidesTb.load({ phone: this.phone, page: page });
    }
  }

}
