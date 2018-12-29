var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function() {
      this.trigger('getGardenKnowledge');
    },
    getGardenKnowledge: function() {
      var _this = this;
      $.ajax({
        url: '/newhouse-web/garden/knowledge',
        data: {
          expandId: _this.refOpts.gardenId
        },
        type: 'post',
        success: function(data) {
          if (data.status === 'C0000' && data.result.length) {
            _this.data.list = data.result;
            _this.update();
          }
        }
      });
    }
  },

  events: {
    // 'click .garden-knowledge': 'download'
  },

  handle: {
    download: function(e) {
      var url = this.$(e.target).data('url');
      var name = this.$(e.target).data('name');

      $.ajax({
        url: '/newhouse-web/download',
        data: {
          url: url,
          fileName: name
        },
        success: function(data) {}
      });
    }
  }
};
