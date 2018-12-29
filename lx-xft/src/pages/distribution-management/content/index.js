var coala = require('coala');
var config = require('config');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
var tpl = require('./index.html');
require('./index.css');
module.exports = {
  tpl: tpl,
  refs: {},
  listen: {
    init: function () {
      this.trigger('renderModel');
    },
    mount: function () { },
    updated: function () {

    },
    renderModel: function () {
      var _this = this;
      var curPosName = null;
      var position = amplify.store.sessionStorage('position');
      if (position) {
        curPosName = position[0].positionName;
      }

      // 公司负责人需要判断外联内联
      var uid = amplify.store.sessionStorage('uid');
      var infoMenu = null;
      var companyType = null;
      uid && (infoMenu = amplify.store.sessionStorage('infoMenu_' + uid));
      infoMenu && (companyType = infoMenu.companyType);
      debugger;

      switch (curPosName) {
        case '店长':
        case '营销经理':
        case '营销主管':
        case '营销助理':
        case '网销经理':
        case '营销总监':
        case '网销总监':

          _this.data.positionType = 2;
          _this.requirePerson();

          break;
        case '公司负责人':

          // if (companyType == 'OUTREACH') {
          _this.data.positionType = 3;
          _this.requirePerson();
          // }

          break;
        // 所有人都有个人分销
        default:

          _this.data.positionType = 1;
          _this.requirePerson();

          break;
      }
    }
  },
  mixins: [{
    requirePerson: function () {
      var _this = this;
      require.ensure([], function () {
        _this.fxCon = coala.mount(require('./personal'), '#fxCon');
      });
    },
    requireOrg: function () {
      var _this = this;
      require.ensure([], function () {
        _this.fxCon = coala.mount(require('./org'), '#fxCon');
      });
    }

  }],
  events: {
    'click .js-tab a': 'tabSwitch'
  },

  handle: {
    tabSwitch: function (e) {
      var _this = this;
      var $el = this.$(e.currentTarget);
      var index = $el.index();
      var type = $el.data('type');
      if (!($el.hasClass('cur'))) {
        $el.addClass('cur').siblings().removeClass('cur');
        // 销毁日期
        if (_this.fxCon) {
          // _this.fxCon.trigger('unmount');
          _this.fxCon.unmount();
        }
        switch (type) {
          // 经纪人
          case 'personal':
            _this.requirePerson();
            break;
          case 'store':
            _this.requireOrg();
            break;
          /* 外联公司负责人 */
          case 'company':
            _this.requireOrg();
            break;
        }
      }
    }
  }

};
