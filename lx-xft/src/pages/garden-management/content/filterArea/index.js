var coala = require('coala');
var config = require('config');
var subArea = require('./subArea');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
var tpl = require('./index.html');


module.exports = {
  tpl: tpl,
  refs: {
    subArea: {
      component: subArea,
      el: '#subArea'
    }
  },
  listen: {
    mount: function() {
      var sessionArea = amplify.store.sessionStorage('area');
      var areaData = {}
      if (sessionArea) {
        areaData.areaId = sessionArea.id;
      }
      this.trigger('getAreaCount', areaData);
    },
    getAreaCount: function(areaData) {
      var _this = this;
      $.ajax({
        type: 'GET',
        url: '/newhouse-web/garden/statisGarden',
        data: areaData,
        dataType: 'json',
        success: function(data) {
          if (data.status == 'C0000') {
            _this.data = data.result;
            _this.update();
          }
        }
      });
    },

  },
  events: {

  },

  handle: {

  }
};
