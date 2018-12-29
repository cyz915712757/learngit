var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function() {
      $(document).on('click', '.photo-detail-preview .icon-qiehuan,.photo-detail-preview .icon-youqiehuan', function() {
        var $el = $('.layout-photo-detail-wrapper.slick-current.slick-active');
        var type = $el.find('img').data('type');
        var index = $el.data('slickIndex');
        $('.garden-photo-detail a[data-type="' + type + '"]').trigger('click');
        $('.num-index').text(index + 1);
      });

      $(document).on('click', '.garden-photo-detail a', function(e) {
        $(this).parent().siblings().removeClass('current').end().addClass('current');
        var type = $(e.target).data('type');
        var index = $('.layout-photo-detail-wrapper img[data-type="' + type + '"]').eq(0).parent().parent().parent().data('slickIndex');
        $('.num-index').text(index + 1);
        $('.photo-detail-preview').slick('slickGoTo', index, true);
      });
    },

    fetch: function(opts) {
      var _this = this;
      $.ajax({
        url: '/newhouse-web/garden/photoDetail',
        data: {
          expandId: opts.gardenId
        },
        success: function(data) {
          if (data.status === 'C0000') {
            _this.data.list = data.result;
            _this.data.type = opts.type;

            var count = 0;
            $.each(_this.data.list, function(index, ele) {
              count += ele.count;
              $.each(ele.urls, function(i, e) {
                e.url = e.url.replace('{size}', '1000x1000');
              });
            });

            _this.data.count = count;
            _this.update();
            _this.$('.photo-detail-preview').slick({
              infinite: false,
              prevArrow: '<i class="iconfont icon-youqiehuan"></i>',
              nextArrow: '<i class="iconfont icon-qiehuan"></i>'
            });
            var index = _this.$('.layout-photo-detail-wrapper img[data-type="' + opts.type + '"]').eq(0).parent().parent().parent().data('slickIndex');
            _this.$('.num-index').text(index + 1);
            _this.$('.photo-detail-preview').slick('slickGoTo', index, true);
            // var w = $(window).width() - 100;
            var h = $(window).height() - 200;
            _this.$('.layout-photo-detail-wrapper .layout-img-wrapper').css({  height: h + 'px' });
          }
        }

      });
    }
  }
};
