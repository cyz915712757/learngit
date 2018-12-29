var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    render: function(opts) {
      this.id = opts.id;
      this.data.customerName = opts.customerName;
      this.data.phone = opts.phone;
      this.data.batch = opts.batch;
      this.update();
    }
  },
  events: {
    'click .js-confirm:not(.disabled)': 'confirmHandle',
    'click .js-cancel': 'cancelHandle'
  },
  handle: {
    confirmHandle: function(e) {
      var _this = this;
      var $el = this.$(e.currentTarget);
      $.ajax({
        url: '/newhouse-web/customer/private/toPublic',
        data: {
          id: _this.id,
          batch: _this.batch
        },
        beforeSend: function() {
          $el.addClass('disabled');
        },
        success: function(data) {
          if (data.status === 'C0000') {
            layer.msg('私客转公成功!');
            if (_this.type && _this.type === 'inline') {
              layer.close(_this.index);
              _this.parent.trigger('refresh');
            } else {
              layer.close(_this.index);
              layer.close(_this.parent.parent.index);
              _this.parent.parent.parent.csCon.trigger('refresh');
            }
          } else {
            layer.msg(data.message);
            $el.removeClass('disabled');
          }

        }
      });
    },

    cancelHandle: function(e) {
      layer.close(this.index);
    }
  }
}
