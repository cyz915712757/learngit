var tpl = require('./index.html');
var layer = require('components/layer');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function() {
      var t = '3';
      var _this = this;
      var i = setInterval(function() {
        _this.$('#waitTime').text(t);
        --t;
        if (t === -1) {
          clearInterval(i);
          location.href = 'login.html';
        }
      }, 1000);
    }
  },
  events: {
    'click .close-btn': 'closeTip'
  },
  handle: {
    closeTip: function() {
      layer.close(this.index);
      location.href = 'login.html';
    }
  }
};
