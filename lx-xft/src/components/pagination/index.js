var coala = require('coala');
var tpl = require('./index.html');
var laypage = require('components/laypage');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function () {

    },
    updated: function () {
      if (this.data.currentPage) {
        var _this = this;
        laypage({
          cont: _this.$('#paginationButtonGroup'),
          pages: _this.data.pageCount,
          curr: _this.data.currentPage,
          skin: '#00b4ed',
          groups: 5,
          last: '尾页',
          jump: function (e, first) {
            if (!first) {
              _this.parent.trigger('jump', e.curr, _this.data.pageSize);
            }
          }
        });
      }
    },

    refresh: function (data, desc) {
      var currentPage = data.currentPage;
      var pageSize = data.pageSize;
      var totalCount = data.totalCount;
      var pageCount = data.pageCount;
      if (totalCount <= pageSize) {
        this.el.hide();
        return;
      } else {
        this.el.show();
      }
      var start;
      var end;

      if (totalCount === 0) {
        start = 0, end = 0, data.currentPage = 0;
      } else {
        start = pageSize * (currentPage - 1) + 1;
        end = currentPage < pageCount ? currentPage * pageSize : totalCount;
      }

      this.data = data;
      this.data.start = start;
      this.data.desc = desc;
      this.data.end = end;
      this.update();
    }
  },

  refs: {

  }
};