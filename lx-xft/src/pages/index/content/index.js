var coala = require('coala');
var config = require('config');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
var tpl = require('./index.html');
/*var leadingGrid = require('components/leadingGrid');*/
var banner = require('./banner');
var sideList = require('./sideList');
var layer = require('components/layer');
var utils = require('utils');
require('./index.css');
var commonGrid = null;
var commonRow = null;
module.exports = {
  tpl: tpl,
  refs: {
    /*    leadingGrid: {
          component: leadingGrid,
          el: '#leadingGrid',
        },*/
    banner: {
      component: banner,
      el: '#banner'
    },
    buildingNew: {
      component: sideList,
      el: '#buildingNew',
      hType: 'new',
      hTname: '新上楼盘'
    },
    buildingIntro: {
      component: sideList,
      el: '#buildingIntro',
      hType: 'intro',
      hTname: '推荐楼盘'
    }
  },
  listen: {
    init: function () {
      this.trigger('renderList');
    },
    mount: function () {
      //commonGrid = this.refs.leadingGrid;
      //  this.refs.leadingGrid.trigger('getMain');
      var isShouCang = amplify.store.localStorage('isShouCang');
      if (!isShouCang) {
        layer.msg('欢迎来到楼讯，Ctrl+D收藏此页，方便您下次更快查询信息', {
          id: 'shoucangLayer',
          offset: 't',
          area: '500px',
          closeBtn: 1,
          anim: 6,
          time: 0,
          offset: '60px'
        });
        amplify.store.localStorage('isShouCang', true);
      }

    },
    renderList: function () {
      var _this = this;
      var isRow = amplify.store.sessionStorage('isrowindex');
      if (isRow) {
        _this.data.isrow = true;
        /*文字列表形式*/
        _this.requireRow(commonRow);
      } else {
        _this.data.isrow = false;
        _this.requireGird(commonGrid);

      }

    },
    switchTpl: function (e) {
      var leadBox = e.closest('.leading-box');
      var _this = this;
      /*切换模板*/
      if (e.hasClass('grid')) {
        e.find('i').addClass('icon-tupianliebiao').removeClass('icon-wenziliebiao');
        leadBox.find('#leadingGrid').hide();
        _this.requireRow(_this.commonRow, leadBox);
        e.removeClass('grid');
      } else {
        e.find('i').addClass('icon-wenziliebiao').removeClass('icon-tupianliebiao');
        leadBox.find('#leadingRow').hide();
        _this.requireGird(_this.commonGrid, leadBox);
        e.addClass('grid');
      }
    }
  },
  mixins: [{
    requireGird: function (commonGrid, leadBox) {
      var _this = this;
      if (!commonGrid) {
        leadBox && leadBox.append('<div id="leadingGrid"></div>');
        require.ensure([], function () {
          var leadingGrid = require('components/leadingGrid');
          commonGrid = coala.mount(leadingGrid, '#leadingGrid');
          commonGrid.trigger('getMain');
          _this.refs.leadingGrid = commonGrid;
          _this.commonGrid = commonGrid;
          amplify.store.sessionStorage('isrowindex', false);
        });
      } else {
        leadBox && leadBox.find('#leadingGrid').show();
        amplify.store.sessionStorage('isrowindex', false);
      }
      this.refs.leadingGrid = commonGrid;
      _this.commonGrid = commonGrid;
    },
    requireRow: function (commonRow, leadBox) {
      var _this = this;
      if (!commonRow) {
        leadBox && leadBox.append('<div id="leadingRow"></div>');
        require.ensure([], function () {
          var leadingRow = require('components/leadingRow');
          commonRow = coala.mount(leadingRow, '#leadingRow');
          commonRow.trigger('getMain');
          _this.refs.leadingGrid = commonRow;
          _this.commonRow = commonRow;
          amplify.store.sessionStorage('isrowindex', true);
        });
      } else {
        leadBox && leadBox.find('#leadingRow').show();
        amplify.store.sessionStorage('isrowindex', true);
      }
      _this.refs.leadingGrid = commonRow;
      _this.commonRow = commonRow;
    },
  }],
  events: {
    'click .js-switch': 'switchFun'
  },

  handle: {
    switchFun: function (e) {
      this.trigger('switchTpl', this.$(e.currentTarget));
    }
  }

};
