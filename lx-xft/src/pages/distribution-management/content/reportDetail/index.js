var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    fetch: function(opts) {
      var _this = this;
      $.ajax({
        url: opts.url,
        data: {
          reservationId: opts.reservationId
        },
        success: function(data) {
          if (data.status === 'C0000') {
            _this.data.list = data.result.reservationRecord;
            _this.data.flag = _this.data.list.length;
            _this.update();
          }
        }
      });
    }
  }
};
