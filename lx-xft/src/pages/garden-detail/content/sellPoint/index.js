var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function() {
      this.trigger('getGardenSellPoint');
    },
    getGardenSellPoint: function() {
      var _this = this;
      $.ajax({
        url: '/newhouse-web/garden/sellPoint',
        data: {
          expandId: _this.refOpts.gardenId
        },
        success: function(data) {
          if (data.status === 'C0000') {
            data.result.projectProfile = data.result.projectProfile.replace(/\r\n/g, '<br/>');
            data.result.sellPoint = data.result.sellPoint.replace(/\r\n/g, '<br/>');
            _this.data = data.result;
            _this.update();
          }
        }
      });
    }
  }
};
