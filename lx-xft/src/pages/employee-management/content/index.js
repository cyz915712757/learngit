var coala = require('coala');

var layer = require('components/layer');
var tpl = require('./index.html');
var cgAgent = require('./agentContent');// 经纪人管理模块
module.exports = {
  tpl: tpl,
  // refs: {
  //   cgAgent: {
  //     component: cgAgent,
  //     el: '#cgAgent'
  //   }
  // },
  listen: {
    mount: function () {
      this.trigger('getSummary');
    },
    // 汇总数据
    getSummary: function () {
      var _this = this;
      $.ajax({
        type: 'GET',
        url: '/newhouse-web/outreach/employee/staticsStoreAndBroker',
        dataType: 'json',
        success: function (data) {
          if (data.status === 'C0000') {
            _this.data = data.result[0];
            _this.update();
            _this.requireAgent();
          }
        }
      });
    },

    updated: function () {
      var _this = this;
      $('.js-change a').on('click', function (e) {
        var curEl = _this.$(e.currentTarget);
        var type = curEl.data('type');
        if (!curEl.hasClass('cur')) {
          curEl.addClass('cur').siblings().removeClass('cur');
          switch (type) {
            case 'store':
              $('#cgAgent').hide();
              if (!_this.storeComponentFlag) {
                _this.requireStore();
                _this.storeComponentFlag = true;
              }
              $('#cgStore').show();
              break;
            case 'agent':
              $('#cgAgent').show();
              $('#cgStore').hide();
              break;
            default:
              return;
          }
        }
      });
      // this.trigger('getSummary');
    }

  },


  mixins: [{
    requireStore: function () {
      var _this = this;
      require.ensure([], function () {
        _this.cgStore = coala.mount(require('./storeContent'), '#cgStore');
        _this.cgStore.parent = _this;
      });
    },
    requireAgent: function () {
      var _this = this;
      require.ensure([], function () {
        _this.cgAgent = coala.mount(require('./agentContent'), '#cgAgent');
        _this.cgAgent.parent = _this;
        _this.cgAgent.trigger('render', _this.data);
      });
    }
  }],

  events: {
    // 'click .js-change a': 'tabFun'
  },

  handle: {
    tabFun: function (e) {
      var _this = this;
      var curEl = this.$(e.currentTarget);
      var type = curEl.data('type');
      if (!curEl.hasClass('cur')) {
        curEl.addClass('cur').siblings().removeClass('cur');
        switch (type) {
          case 'store':
            $('#cgAgent').hide();
            if (!_this.storeComponentFlag) {
              _this.requireStore();
              _this.storeComponentFlag = true;
            }
            $('#cgStore').show();
            break;
          case 'agent':
            $('#cgAgent').show();
            $('#cgStore').hide();
            break;
          default:
            return;
        }
      }
    }
  }

};

