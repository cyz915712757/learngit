var coala = require('coala');
var config = require('config');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
var tpl = require('./index.html');
/*var leadingGrid = require('components/leadingGrid');*/
var pagination = require('components/pagination');
var filterList = require('./filterList');
var filterArea = require('./filterArea')
var search = require('./search');

require('./index.css');
var filterHist = { keyword: null, cityId: null, countyId: null, areaId: null, propertyType: null, avgPrice: null, sellStatus: null };
var sendData = { keyword: null, cityId: null, countyId: null, areaId: null, propertyType: null, avgPrice: null, sellStatus: null };
var keyword = '';
var commonGrid = null;
var commonRow = null;
var pageCur = 0;
module.exports = {
  tpl: tpl,
  refs: {
    search: {
      component: search,
      el: '#search'
    },
    filterArea: {
      component: filterArea,
      el: '#filterArea'
    },
    filterList: {
      component: filterList,
      el: '#filterList'
    },
    /* leadingGrid: {
       component: leadingGrid,
       el: '#comList'
     },*/
    pagination: {
      component: pagination,
      el: '#pagination'
    }
  },
  data: {
    search: {
      propertyType: {}
    },
    areacount: {}
  },
  listen: {
    init: function() {
      this.trigger('renderList');
    },
    mount: function() {},
    jump: function(page, pageSize) {
      pageCur = page;
      this.refs.leadingGrid.trigger('getMain', this.getFilter(), page, pageSize);
      var headEl = this.$('.js-head');
      $('html,body').animate({ scrollTop: 0 }, 500);
    },
    updated: function() {
      keyword = this.getQuery('keyWord');
      this.$('#mKeyword').val(keyword);
      if (keyword) {
        filterHist.keyword = keyword;
        sendData.keyword = keyword;
        this.histFun(filterHist);
      }
      if (this.refs.leadingGrid) {
        this.refs.leadingGrid.trigger('getMain', this.getFilter())
      }
      var headEl = this.$('.js-head');
      if (headEl && headEl.offset()) {
        var OffTop = headEl.offset().top;
        setTimeout(function() {
          $(window).on('scroll.gm', function() {
            var sTop = $(this).scrollTop();
            if (sTop >= OffTop) {
              headEl.addClass('fixedly');
            } else {
              headEl.removeClass('fixedly');
            }
          });
        }, 500);
      }
    },
    renderList: function() {
      var _this = this;
      var isRow = amplify.store.sessionStorage('isrow');
      if (isRow) {
        _this.data.isrow = true;
        _this.requireRow(commonRow, pageCur);
      } else {
        _this.data.isrow = false;
        _this.requireGird(commonGrid, pageCur);

      }

    },
    switchTpl: function(e) {
      var leadBox = e.closest('.filter-result').find('.result-list');
      /*切换模板默认显示网格形式 如果session有数据的话*/
      var _this = this;
      leadBox.find('#comList').empty();
      if (e.hasClass('grid')) {
        e.find('i').addClass('icon-tupianliebiao').removeClass('icon-wenziliebiao');
        e.removeClass('grid');
        _this.requireRow(_this.commonRow, pageCur);
      } else {
        e.find('i').addClass('icon-wenziliebiao').removeClass('icon-tupianliebiao');
        e.addClass('grid');
        _this.requireGird(_this.commonGrid, pageCur);
      }
    }

  },
  mixins: [{
    requireGird: function(commonGrid, pageCur) {
      var _this = this;
      if (!commonGrid) {
        require.ensure([], function() {
          var leadingGrid = require('components/leadingGrid');
          commonGrid = coala.mount(leadingGrid, '#comList');
          commonGrid.parent = _this;
          _this.refs.leadingGrid = commonGrid;
          _this.commonGrid = commonGrid;
          amplify.store.sessionStorage('isrow', false);
          _this.refs.leadingGrid.trigger('getMain', _this.getFilter(), pageCur);
        });
      } else {
        _this.refs.leadingGrid = commonGrid;
        _this.commonGrid = commonGrid;
        commonGrid.parent = _this;
        amplify.store.sessionStorage('isrow', false);
        _this.refs.leadingGrid.trigger('getMain', _this.getFilter(), pageCur);
      }

    },
    requireRow: function(commonRow, pageCur) {
      var _this = this;
      if (!commonRow) {
        require.ensure([], function() {
          var leadingRow = require('components/leadingRow');
          commonRow = coala.mount(leadingRow, '#comList');
          commonRow.parent = _this;
          _this.refs.leadingGrid = commonRow;
          _this.commonRow = commonRow;
          amplify.store.sessionStorage('isrow', true);
          _this.refs.leadingGrid.trigger('getMain', _this.getFilter(), pageCur);
        });
      } else {
        _this.refs.leadingGrid = commonRow;
        commonRow.parent = _this;
        _this.commonRow = commonRow;
        amplify.store.sessionStorage('isrow', true);
        _this.refs.leadingGrid.trigger('getMain', _this.getFilter(), pageCur);
      }
    },
    getQuery: function(p) {
      var reg = new RegExp('(^|&)' + p + '=([^&]*)(&|$)', 'i');
      var r = window.location.search.substr(1).match(reg);
      return r ? decodeURI(r[2]) : null;
    },
    histFun: function(filterHist) {
      var htmls = '';
      var selLen = 0;
      this.$('#filterHist').find('.filter-sitem').remove();
      $.each(filterHist, function(key, val) {
        if (val) {
          htmls += '<a href="javascript:;" data-prop="' + key + '" class="filter-hist-item filter-sitem"><span>' + val + '</span><i class="iconfont icon-guanbi js-delHist"></i></a>';
          selLen++;
        }
      });
      $('#filterHist .filter-hist-title').after(htmls);
      if (selLen > 0) {
        this.$('.filter-hist').removeClass('dn');
      } else {
        if (!(this.$('.filter-hist').hasClass('dn'))) {
          this.$('.filter-hist').addClass('dn');
        }
      }
      if (selLen > 1) {
        this.$('#delAll').removeClass('dn');
      } else {
        if (!(this.$('#delAll').hasClass('dn'))) {
          this.$('#delAll').addClass('dn');
        }
      }
    },
    getFilter: function(cityChange) {
      var selectedData = {};
      var pageMark = this.parent.pageMark;
      if (pageMark) {
        selectedData.flag = pageMark();
      }
      var cid = this.parent.$('#citySelect').data('cid');
      var cname = this.parent.$('#citySelect .cityname').text();
      var sortEl = this.$('#sortBox a.cur');
      if (sortEl.data('prop')) {
        sendData.sort = sortEl.data('prop');
        if (sortEl.find('.icon-shang').length > 0) {
          sendData.orderBy = 'asc';
        } else {
          sendData.orderBy = 'desc';
        }
      } else {
        sendData.orderBy = null;
        sendData.sort = null;
      }
      sendData.cityId = cid;
      selectedData.sendData = sendData;
      selectedData.filterHist = filterHist;
      selectedData.cname = cname;
      selectedData.keyword = sendData.keyword;
      return selectedData;
    },
    getKeyWord: function() {
      var mkeyword = this.$('#mKeyword').val();
      filterHist.keyword = mkeyword;
      sendData.keyword = mkeyword;
      this.histFun(filterHist);
      this.refs.leadingGrid.trigger('getMain', this.getFilter());
    },
    delAll: function(cityflag) {
      pageCur = 1;
      cityflag && this.$('#sortBox a').eq(0).addClass('cur').siblings().removeClass('cur');
      filterHist = { keyword: null, cityId: null, countyId: null, areaId: null, propertyType: null, avgPrice: null, sellStatus: null };
      sendData = {};
      this.histFun(filterHist);
      this.$('.filter-list').find('li:eq(0)').addClass('cur').siblings('').removeClass('cur');
      this.$('.filter-sub-list').addClass('dn');
      this.refs.leadingGrid.trigger('getMain', this.getFilter());
    }
  }],
  events: {
    'click .js-switch': 'switchFun',
    'click .js-head .item': 'headFun',
    'click .js-delHist': 'delHistFun',
    'click #delAll': 'delAllFun',
    'click .js-filterSel li': 'filterFun',
    'click #searchBtn': 'searchFun',
    'keydown #mKeyword': 'enterSearch',
    'click .js-filterArea a': 'subAreaFun',
  },

  handle: {
    switchFun: function(e) {
      this.trigger('switchTpl', this.$(e.currentTarget));
    },
    searchFun: function() {
      pageCur = 1;
      this.getKeyWord();
    },
    enterSearch: function(e) {
      if (e.keyCode == 13) {
        pageCur = 1;
        this.getKeyWord();
      }
    },
    filterFun: function(e) {
      pageCur = 1;
      var targetEl = this.$(e.currentTarget);
      var taga = targetEl.find('a');
      targetEl.addClass('cur').siblings('li').removeClass('cur');
      var prop = targetEl.closest('ul').data('prop');
      if (taga.text() != '不限') {
        filterHist[prop] = taga.find('.section').text() || taga.text();
        sendData[prop] = taga.data('v');
      } else {
        filterHist[prop] = null;
        sendData[prop] = null;
      }
      this.histFun(filterHist);
      this.refs.leadingGrid.trigger('getMain', this.getFilter());
    },
    delHistFun: function(e) {
      var targetEl = this.$(e.currentTarget).closest('a');
      $.each(this.$('.js-filterSel li'), function(index, item) {
        if ($(item).closest('ul').data('prop') === targetEl.data('prop')) {
          $(item).removeClass('cur');
          $(item).closest('ul').find('li:eq(0)').addClass('cur');
        }
      });
      if (targetEl.data('prop') == 'keyword') {
        this.$('#mKeyword').val('');
      }
      if (targetEl.data('prop') == 'areaId') {
        this.$('.filter-sub-list').addClass('dn');
      }
      if (targetEl.data('prop') == 'countyId') {
        this.$('.filter-sub-list').addClass('dn').removeClass('cur').find('li:eq(0)').addClass('cur');
        filterHist.areaId = null;
        sendData.areaId = null;
      }
      filterHist[targetEl.data('prop')] = null;
      sendData[targetEl.data('prop')] = null;
      this.histFun(filterHist);
      this.refs.leadingGrid.trigger('getMain', this.getFilter());
    },
    delAllFun: function(e) {
      this.delAll();
    },
    /*区域接口更换为单次请求*/
    subAreaFun: function(e) {
      var tag = this.$(e.currentTarget);
      pageCur = 1;
      filterHist.areaId = null;
      sendData.areaId = null;
      //this.$('.filter-sub-list').addClass('dn');
      if (tag.text() != '不限') {
        this.refs.filterArea.refs.subArea.trigger('getAreaCount', { areaId: tag.data('v') });
      } else {
        this.$('.filter-sub-list').addClass('dn');
      }
    },
    headFun: function(e) {
      var headEl = this.$(e.currentTarget);
      pageCur = 1;
      if (headEl.hasClass('cur') && (headEl.index() > 0)) {
        if (headEl.find('i').hasClass('icon-xia')) {
          headEl.find('i').addClass('icon-shang').removeClass('icon-xia');
        } else {
          headEl.find('i').addClass('icon-xia').removeClass('icon-shang');
        }
      } else {
        headEl.addClass('cur').siblings().removeClass('cur');
        if (headEl.index() > 0) {
          headEl.find('i').addClass('icon-shang').removeClass('icon-xia');
        }
      }
      this.refs.leadingGrid.trigger('getMain', this.getFilter());
    }

  }

};
