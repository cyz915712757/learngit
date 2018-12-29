var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');
var layer = require('components/layer');
var fbForm = require('./fbForm');
require('./index.css')
module.exports = {
  tpl: tpl,
  listen: {},
  events: {
    'click #feedbackBtn': 'openFbForm'
  },

  handle: {
    openFbForm: function () {
      var index = layer.open({
        type: 1,
        skin: 'open-title',
        shadeClose: true,
        area: ['700px', '520px'],
        title: '匿名调研',
        content: '<div id="fbForm"></div>'
      });
      var d = coala.mount(fbForm, '#fbForm');
      d.index = index;
      d.trigger('render');

    }
  }
};