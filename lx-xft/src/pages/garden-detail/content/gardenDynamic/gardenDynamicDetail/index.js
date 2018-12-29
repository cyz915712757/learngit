var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function() {
      this.trigger('fetch', this.data.gardenId);
    },

    fetch: function(id) {
      var _this = this;
      $.ajax({
        url: '/newhouse-web/garden/dynamic/detail',
        type: 'post',
        data: {
          dynamicId: id
        },
        success: function(data) {
          if (data.status = 'C0000' && data.result) {
            _this.data = data.result;
            _this.update();
          }
        }
      });
    }
  }
};
