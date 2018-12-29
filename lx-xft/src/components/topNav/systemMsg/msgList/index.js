var coala = require('coala');
var config = require('config');
var pagination = require('../../../../components/pagination');
var list = require('./list');
var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  refs: {
    pagination: {
      component: pagination,
      el: '#pagination'
    },
    list: {
      component: list,
      el: '#list'
    },
  },
  data: {
    initFlag: true
  },
  listen: {
    jump: function (page, pageSize) {
      this.pageCur = page;
      this.pageSize = pageSize;
      this.refs.list.trigger('getList', page, pageSize);
    }
  },
};
