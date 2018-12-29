var coala = require('coala');
var layer = require('components/layer');
var tpl = require('./index.html');
var gardenDynamicDetail = require('./gardenDynamicDetail');
var pagination = require('components/pagination');
require('./index.css');

function getParam(p) {
  var reg = new RegExp('(^|&)' + p + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  return r ? decodeURI(r[2]) : null;
}



module.exports = {
  tpl: tpl,
  refs: {
    pagination: {
      component: pagination,
      el: '#pagination'
    }
  },
  listen: {
    mount: function() {
      this.trigger('getGardenDynamic');
      var did = getParam('did');
      did && this.trigger('openCommonDynamicDetail', did);
    },

    jump: function(page, pageSize) {
      pageCur = page;
      this.trigger('getGardenDynamic', page, pageSize);
    },

    getGardenDynamic: function(page, pageSize) {
      var _this = this;
      $.ajax({
        url: '/newhouse-web/garden/dynamic',
        data: {
          expandId: _this.refOpts.gardenId,
          page: page
        },
        success: function(data) {
          if (data.status === 'C0000' && data.result.items.length>0) {
            $.each(data.result.items, function(index, el) {
              el.title = el.title.length > 48 ? el.title.substring(0, 48) + '...' : el.title;
            });

            _this.data.dynamic = data.result.items;
            var pageParam = {
              currentPage: data.result.currentPage,
              pageCount: data.result.pageCount,
              pageSize: data.result.pageSize,
              totalCount: data.result.recordCount
            };
            _this.update();
            _this.refs.pagination.trigger('refresh', pageParam);
          }
        }
      });
    },
    openCommonDynamicDetail: function(id){
      var index = layer.open({
        type: 1,
        title: false,
        area: ['835px', '650px'],
        content: '<div id="dynamicDetail"></div>'
      });

      gardenDynamicDetail.data = { gardenId: id };
      var d = coala.mount(gardenDynamicDetail, '#dynamicDetail');
      d.index = index;
    }
  },
  events: {
    'click .dynamic-title': 'openDynamicDetail'
  },
  handle: {
    openDynamicDetail: function(e) {
      var $ele = this.$(e.currentTarget);
      this.trigger('openCommonDynamicDetail', $ele.data('id'));
    }
  }

};
