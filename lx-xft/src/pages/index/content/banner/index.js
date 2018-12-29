var coala = require('coala');
var config = require('config');
require('vendors/slick-1.6.0/slick.min');
require('vendors/slick-1.6.0/slick.css');
require('vendors/slick-1.6.0/slick-theme.css');
var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function() {
      this.trigger('getBanner');
    },
    updated: function() {
      $('#bannerList').slick({
        dots: true,
        infinite: true,
        autoplay: true
      });
    },
    getBanner: function() {
      var _this = this;
      $.ajax({
        type: 'GET',
        url: '/newhouse-web/index/ad',
        dataType: 'json',
        success: function(data) {
          var item = data.result;
          if (data.status == 'C0000') {
            if (item.list && item.list.length > 0) {
              $.each(item.list, function(index, obj) {
                if (obj.picUrl.indexOf('{size}') > -1) {
                  obj.picUrl = obj.picUrl.replace('{size}', '1000x330');
                }
              });
              _this.data = item.list;
              _this.update();
            } else {
              _this.$('#bannerList').html('<div class="no-banner"></div>');
            }

          }
        }
      })
    }

  }
};
