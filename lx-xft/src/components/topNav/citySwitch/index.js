var coala = require('coala');
var config = require('config');
var layer = require('components/layer');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
var tpl = require('./index.html');
require('./index.css');
var opencity = null;

module.exports = {
  tpl: tpl,
  refs: {

  },
  data: {
    city: {
      cities: {

      }
    }
  },
  listen: {
    init: function() {
      opencity = amplify.store.sessionStorage('opencity');
      opencity && (this.data.city = opencity);
       var sessionArea = amplify.store.sessionStorage('area');
      if (sessionArea) {
        this.data.area = sessionArea;
      } else if (this.parent.data.area) {
        this.data.area = this.parent.data.area;
      }

    },
    updated: function() {
      var _this = this;

      $('body').on('click.citySelect', function() {
        _this.hideCity();
      })
    },
    mount: function() {

      //this.update();
      if (!opencity) {
        this.trigger('getCity');
      }
    },
    getCity: function() {
      var _this = this;
      $.ajax({
        type: 'GET',
        url: '/newhouse-web/pub/service/getOpenCity',
        success: function(data) {
          if (data.status == 'C0000') {
            _this.data.city = data.result;
            amplify.store.sessionStorage('opencity', data.result);
            _this.update();
          }
        }
      });
    },

  },
  mixins: [{
    hideCity: function() {
      this.$('#cityLayer:visible').hide().css({
        'top': 73,
        'opacity': 0
      });
    }

  }],
  events: {
    'click #citySelect': 'citySelectOpen',
    'click #cityLayer': 'cityLayerFun',
    'click .js-close': 'closeFun',
    'click .js-citySel a': 'citySelFun'
  },

  handle: {
    citySelFun: function(e) {
      var _this = this;
      var tagEl = this.$(e.currentTarget);
      var cityname = tagEl.text();
      var cityId = tagEl.data('cid');
      this.$('#citySelect .cityname').text(cityname);
      this.$('#citySelect').data('cid', cityId);
      this.hideCity();
      /*切换城市请求后台*/
      $.ajax({
        type: 'GET',
        url: '/newhouse-web/pub/service/changeCity',
        data: { cityId: cityId },
        success: function(data) {
          if (data.status == 'C0000') {
            amplify.store.sessionStorage('area', { id: cityId, name: cityname });
            var pageMark = _this.parent.parent.pageMark;
            var content = _this.parent.parent.refs.content;
            if (pageMark && pageMark()) {
              switch (pageMark()) {
                case 'index':
                  {
                    content.refs.banner.trigger('getBanner');
                    content.refs.buildingNew.trigger('getSide');
                    content.refs.buildingIntro.trigger('getSide');
                  }
                  break;
                case 'gm':
                  {
                    content.refs.filterArea.trigger('getAreaCount', { areaId: tagEl.data('cid') });
                    content.refs.filterList.trigger('getSearch',{ areaId: tagEl.data('cid') })
                    /*清空选择条件*/
                    content.delAll(true);
                  }
                  break;
                default:
                  break;
              }
            }
          } else {
            layer.msg(data.message);
          }
        }
      });

    },
    citySelectOpen: function(e) {
      e.stopPropagation();
      var cityLayer = this.$('#cityLayer');
      if (cityLayer.is(":hidden")) {
        cityLayer.show().stop().animate({
          'top': 53,
          'opacity': 1
        });
      } else {
        this.hideCity();
      }
    },
    cityLayerFun: function(e) {
      e.stopPropagation();
    },
    closeFun: function(e) {
      this.hideCity();
    }

  }


};
