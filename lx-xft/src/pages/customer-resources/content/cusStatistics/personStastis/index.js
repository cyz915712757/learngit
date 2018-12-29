var coala = require('coala');
var config = require('config');
var pagination = require('components/pagination');
var tpl = require('./index.html');

module.exports = {
  tpl: tpl,
  refs: {
    pagination: {
      component: pagination,
      el: '#pubPage'
    }
  },
  listen: {
    jump: function (page, pageSize) {
      this.parent.queryParams.page = page;
      this.params = this.parent.queryParams
      this.personTb.load(this.parent.queryParams);
    },
    initPersonTb: function (queryParams) {
      var _this = this;
      this.personTb = this.$('#personTb').table({
        cols: [{
            title: '姓名',
            name: 'brokerName',
            width: 85
          },
          {
            title: '手机',
            name: 'mobileNo',
            width: 102
          },
          {
            title: '组织',
            name: 'orgName',
            width: 240
          },
          {
            title: '私客',
            name: 'privateCustomerSum',
            width: 75
          },
          {
            title: '录入客户',
            name: 'addPrivateCustomerCount',
            width: 75
          },
          {
            title: '资源客转私',
            name: 'resourcesToPrivateCount',
            width: 75
          },
          {
            title: '公客转私',
            name: 'publicToPrivateCount',
            width: 75
          },
          {
            title: '私客转公',
            name: 'privateToPublicCount',
            width: 75
          },
          {
            title: '跟进客户',
            name: 'followCustomerCount',
            width: 75
          },
          {
            title: '拨打次数',
            name: 'dialCount',
            width: 60
          }
        ],
        params: queryParams,
        method: 'get',
        url: '/newhouse-web/customer/statistics/listByBroker',
        //url: '/data/s/list',
        transform: function (data) {
          if (data.result) {
            return data.result.items;
          }
        },
        showBackboard: false,
        height: 'auto',
        //fullWidthRows: true
      });
      this.personTb.on('loadSuccess',function(e, data){
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
    loadTb: function (queryParams) {
      this.personTb.load(queryParams);
    }
  }
};
