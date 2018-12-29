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
    mount: function () {
      // this.trigger('initDeptTb');
    },
    jump: function (page, pageSize) {
      this.parent.queryParams.page = page;
      this.deptTb.load(this.parent.queryParams);
    },
    updated: function () {

    },
    initDeptTb: function (queryParams) {
      var _this = this;
      this.deptTb = this.$('#deptTb').table({
        cols: [{
            title: '组织',
            name: 'orgName',
            width: 238
          },
          {
            title: '经纪人数',
            name: 'brokerCount',
            width: 88
          },
          {
            title: '私客',
            name: 'privateCustomerSum',
            width: 88
          },
          {
            title: '录入客户',
            name: 'addPrivateCustomerCount',
            width: 88
          },
          {
            title: '资源客转私',
            name: 'resourcesToPrivateCount',
            width: 88
          },
          {
            title: '公客转私',
            name: 'publicToPrivateCount',
            width: 88
          },
          {
            title: '私客转公',
            name: 'privateToPublicCount',
            width: 88
          },
          {
            title: '跟进客户',
            name: 'followCustomerCount',
            width: 88
          },
          {
            title: '拨打次数',
            name: 'dialCount',
            width: 82
          }
        ],
        params: queryParams,
        method: 'get',
        url: '/newhouse-web/customer/statistics/listByOrg',
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
      this.deptTb.on('loadSuccess',function(e, data){
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
      this.deptTb.load(queryParams);
    }

  }
};
