var tpl = require('./index.html');
var layer = require('components/layer');
require('./index.css');

module.exports = {
  tpl: tpl,
  events: {
    'click .close-btn': 'closeTip'
  },
  handle: {
    closeTip: function() {
      $.isFunction(this.callback) && this.callback();
      location.href = 'login.html';
    }
  }
};
