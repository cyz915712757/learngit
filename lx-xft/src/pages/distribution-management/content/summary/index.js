var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');
require('./index.css');
module.exports = {
  tpl: tpl,
  listen: {
    mount: function () {
      //this.trigger('render');
    },
    updated: function () {},
    render: function (opts) {
      var _this = this;
      $.ajax({
        type: 'GET',
        data: opts.sendData,
        dataType: 'json',
        url: opts.url,
        success: function (data) {
          if (data.status == 'C0000') {
            _this.data = data.result;
            _this.update();
          }
        }
      });
    }

  },

  events: {

  },

  handle: {

  }

};