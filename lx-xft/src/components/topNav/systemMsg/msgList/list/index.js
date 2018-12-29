var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');

module.exports = {
  tpl: tpl,
  data: {
    initFlag: true
  },
  listen: {
    mount: function () {
      this.trigger('getList')
    },
    getList: function (page, pageSize) {
      var _this = this;
      // 请求数据
      $.ajax({
        type: 'GET',
        data: {
          pageSize: 8 || pageSize,
          page: page || 1
        },
        url: '/newhouse-web/index/notify/query',
        success: function (data) {
          if (data.status == 'C0000') {
            // 删除如果在最后一页把最后一页的数据删除完了，自动计算到新数据的最后一页
            if (_this.parent.pageCur && data.result.pageCount < _this.parent.pageCur) {
              _this.parent.pageCur--;
              _this.trigger('getList', _this.parent.pageCur, _this.parent.pageSize);
              return;
            }
            _this.data = data.result;
            _this.data.initFlag = false;
            _this.update();
            if (data.result.recordCount) {
              var pageParam = {
                currentPage: _this.page || data.result.currentPage,
                pageCount: data.result.pageCount,
                pageSize: data.result.pageSize,
                totalCount: data.result.recordCount
              };
              _this.parent.refs.pagination.trigger('refresh', pageParam);
            }
          }
        }
      });
    },
  },
  events: {
    'click .js-del': 'delMsg'
  },

  handle: {
    delMsg: function (e) {
      var _this = this;
      var $elLi = $(e.currentTarget).closest('li');
      $.ajax({
        type: 'GET',
        data: {
          notifyId: $elLi.data('id'),
        },
        url: '/newhouse-web/index/notify/delete',
        success: function (data) {
          if (data.status == 'C0000') {
            layer.msg('删除成功!',{time:800});
            // console.log(_this.parent.pageCur, _this.parent.pageSize, '删除');
            _this.trigger('getList', _this.parent.pageCur, _this.parent.pageSize);
          }
        }
      });
    }

  }


};
