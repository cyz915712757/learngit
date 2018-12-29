var coala = require('coala');
var config = require('config');
var layer = require('components/layer');
var fbSus = require('../fbSus');
var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    render: function () {
      var _this = this;
      _this.update();
    },
    updated: function () {
      this.trigger('initoValidate');
      $('#fbSub').removeClass('disable');
    },
    initoValidate: function () {
      this.fbValidator = new Validation([{
        el: '.satisfaction',
        event: 'change',
        rules: [{
          rule: function () {
            return $('#satisfaction .satisfaction:checked').length > 0;
          },
          message: '请勾选',
          callback: function (result, el) {
            if (!result) {
              $(el).parent().css('color', '#ff4a51');
            } else {
              $(el).parent().css('color', '#333');
            }
          }
        }]
      }, {
        el: '.betterFunctions',
        event: 'change',
        rules: [{
          rule: function () {
            return $('#betterFunctions .betterFunctions:checked').length > 0;
          },
          message: '请勾选',
          callback: function (result, el) {
            if (!result) {
              $(el).parent().css('color', '#ff4a51');
            } else {
              $(el).parent().css('color', '#333');
            }
          }
        }]
      }, {
        el: '#content',
        rules: [
          { rule: 'required', message: '请填写意见' },
          { rule: 'maxlength', param: 500, message: '您可输入500个字' }
        ]
      }]);
    }
  },
  mixins: [{

  }],
  events: {
    'click #fbSub:not(.disable)': 'fbSub'
  },

  handle: {
    fbSub: function (e) {
      /*后台提交 */
      var result = this.fbValidator.validate();
      var tagEl = this.$(e.currentTarget);
      var sendObj = {};
      sendObj.content = $.trim($('#content').val());
      if ($('#satisfaction .satisfaction:checked').val()) {
        sendObj.satisfaction = +$('#satisfaction .satisfaction:checked').val();
      }
      var checkedObj = $('#betterFunctions .betterFunctions:checked');
      checkedObj.each(function () {
        var isCheck = this.value;
        if (!sendObj.betterFunctions) {
          sendObj.betterFunctions = isCheck;
        } else {
          sendObj.betterFunctions = sendObj.betterFunctions + ',' + isCheck;
        }
      });
      if (result) {
        $.ajax({
          type: 'POST',
          url: '/newhouse-web/index/feedback/add',
          dataType: 'json',
          beforeSend: function () {
            tagEl.addClass('disable');
          },
          data: sendObj,
          success: function (data) {
            if (data.status == 'C0000') {
              tagEl.addClass('disable');
              var index = layer.open({
                type: 1,
                title: false,
                closeBtn: 0,
                shadeClose: true,
                area: ['424px', '290px'],
                content: '<div id="fbSus"></div>'
              });
              var d = coala.mount(fbSus, '#fbSus');
              d.index = index;
              d.trigger('render');
            } else {
              tagEl.romoveClass('disable');
              layer.msg(data.message);
            }
          }
        });
      }
    }

  }

};
