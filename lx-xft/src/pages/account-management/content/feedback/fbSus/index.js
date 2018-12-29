var coala = require('coala');
var config = require('config');
var layer = require('components/layer');
var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function() {

    },
    render: function() {
      var _this = this;
      _this.update();
    },
    updated: function() {

    },

  },
  events: {
    'click #fbSused': 'closeFb'

  },

  handle: {
    closeFb: function() {
      layer.closeAll();
    }

  }

};
