var coala = require('coala');
var config = require('config');
var layer = require('components/layer');
// var utils = require('../../../../utils');
require('vendors/ajaxupload');

var tpl = require('./index.html');
require('../editAccount/index.css');

module.exports = {
  tpl: tpl,
  listen: {
    render: function () {
      this.trigger('getStoreInfo');
    },
    mount: function () {

    },
    getStoreInfo: function () {
      var _this = this;
      $.ajax({
        type: 'GET',
        url: '/newhouse-web/outreach/store/detailStore',
        data: {
          storeId: _this.data.storeId
        },
        dataType: 'json',
        success: function (data) {
          if (data.status == 'C0000') {
            _this.data.initFlag = false;
            _this.data = data.result;
            _this.data.countyName = _this.data.county.name;
            _this.data.areaName = _this.data.area.name;
            _this.data.cityName = _this.data.city.name;
            _this.update();
          }
        }
      });
    }
  },
  events: {
    'click #edit': 'edit'
  },

  handle: {
    edit: function () {
      layer.close(this.index);
    }
  }

};
