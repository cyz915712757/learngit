var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');
require('./index.css')
var feedback = require('../feedback');
module.exports = {
  tpl: tpl,
  listen: {

    mount: function() {
      this.trigger('getCount');
    },

    updated: function() {
      $("#backTop").on('click.backtop', function() {
        $('body,html').animate({
          scrollTop: 0
        }, 300);
        return false;
      });
    },

    getCount: function() {
      $.ajax({
        url: '/newhouse-web/index/feedback/unreadCount',
        success: function(data) {
          if (data.status === 'C0000' && data.result > 0) {
            $('.js-feedback .red-dot').text(data.result).show(300);
          }
        }
      })
    }
  },
  events: {
    'click .js-feedback': 'feedbackProcess'
  },

  handle: {
    feedbackProcess: function(e) {
      var index = layer.open({
        type: 1,
        title: '反馈意见',
        area: ['580px', '610px'],
        content: '<div id="businessFeedback" class="business-feedback"></div>'
      });

      var d = coala.mount(feedback, '#businessFeedback');
      d.parent = this;
      d.index = index;
    }
  }
};
