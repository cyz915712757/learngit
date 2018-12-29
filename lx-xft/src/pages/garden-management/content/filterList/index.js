var coala = require('coala');

var amplify = require('vendors/amplify/amplify.store.min').amplify;
var config = require('config');

var tpl = require('./index.html');


module.exports = {
  tpl: tpl,
  listen: {
    mount: function () {
      var sessionArea = amplify.store.sessionStorage('area');
      var sendData = {}
      if (sessionArea) {
        sendData.cityId = sessionArea.id;
      }
      this.trigger('getSearch', sendData);
    },
    getSearch: function (sendData) {
      var _this = this;
      $.ajax({
        type: 'GET',
        data: sendData,
        url: '/newhouse-web/garden/gardenSearchCriteria',
        success: function (data) {
          if (data.status == 'C0000') {
            _this.data = data.result;
            _this.update();
          }
        }
      });
    },

  },
  events: {},

  handle: {}
};