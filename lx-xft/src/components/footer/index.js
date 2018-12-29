var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');
require('./index.css')
module.exports = {
  tpl: tpl,
  listen: {

    mount: function() {},

    updated: function() {}
  },
  events: {},

  handle: {}
};
