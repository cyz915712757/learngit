var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');


module.exports = {
  tpl: tpl,
  listen: {
    mount: function() {
    },
    updated: function() {
      if (!$.isEmptyObject(this.data)) {
        this.$('.filter-sub-list').removeClass('dn');
      } else {
        this.$('.filter-sub-list').addClass('dn');
      }
    },
    getAreaCount: function(areaData) {
      var _this = this;
      $.ajax({
        type: 'GET',
        url: '/newhouse-web/garden/statisGarden',
        data: areaData,
        dataType: 'json',
        success: function(data) {
          if (data.status == 'C0000') {
            _this.data = data.result;
            _this.update();
          }
        }
      });
    },


  },
  mixins: [{


  }],
  events: {

  },


  handle: {

  }
};
