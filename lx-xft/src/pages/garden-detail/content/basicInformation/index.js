var tpl = require('./index.html');
var layer = require('components/layer');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function() {
      this.trigger('getGardenBasicInformation');

      $(document).on('click', '.long-text', function() {
        var text = $(this).data('text');
        layer.tips(text, '#' + this.id, {
          tips: [1, '#888']
        });
      });
    },

    getGardenBasicInformation: function() {
      var _this = this;
      $.ajax({
        url: '/newhouse-web/garden/basicInformation',
        data: {
          expandId: _this.refOpts.gardenId
        },
        type: 'post',
        success: function(data) {
          if (data.status === 'C0000') {
            _this.data = data.result;
            _this.update();
          }
        }
      });
    }
  }
};
