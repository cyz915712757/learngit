var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    render: function (opts) {
      var _this = this;
      $.ajax({
        url: '/newhouse-web/garden/mainInformation',
        data: {
          expandId: opts.id
        },
        success: function(data) {
          if (data.status === 'C0000') {
          _this.data.desc = data.result.commissionComment;
          _this.data.list = data.result.commissions;
          _this.update();
        }
      }
    });
  }}
};
