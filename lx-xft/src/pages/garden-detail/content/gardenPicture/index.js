var coala = require('coala');
var tpl = require('./index.html');
var layer = require('components/layer');
var gardenPhotoDetail = require('./gardenPhotoDetail');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function() {
      this.trigger('getGardenPhotoIntro');
    },
    getGardenPhotoIntro: function() {
      var _this = this;
      $.ajax({
        url: '/newhouse-web/garden/photoIntro',
        data: {
          expandId: _this.refOpts.gardenId
        },
        success: function(data) {
          if (data.status === 'C0000') {

            $.each(data.result.photoIntroList, function(index, el) {
              el.url = el.url.replace('{size}', '310x235');
              el.minUrl = el.url.replace('310x235', '85x65');
            });
            _this.data.introList = data.result.photoIntroList;
            _this.data.length = data.result.photoIntroList.length;
            _this.update();
            _this.$('#gardenPicture').slick({
              slidesToShow: 1,
              slidesToScroll: 1,
              arrows: false,
              fade: true,
              asNavFor: '#gardenPictureNav'
            });

            _this.$('#gardenPictureNav').slick({
              slidesToShow: 3,
              slidesToScroll: 1,
              // infinite: false,
              prevArrow: '<i class="iconfont icon-youqiehuan"></i>',
              nextArrow: '<i class="iconfont icon-qiehuan"></i>',
              asNavFor: '#gardenPicture',
              dots: false,
              centerMode: true,
              centerPadding: '0px',
              focusOnSelect: true
            });

            //add garden-picture numbers
            _this.$('#gardenPicture').append('<div class="desc">共' + data.result.amount + '张</div>');

          }
        }
      });
    }
  },
  events: {
    'click .js-photo-detail': 'openPhotoDetail'
  },
  handle: {
    openPhotoDetail: function(e) {

      // var layerHeight = screen.height <= 1020 ? '560px' : '680px';
      var index = layer.open({
        type: 1,
        title: false,
        // area: ['835px', layerHeight],
        content: '<div id="photoDetail"></div>',
        closeBtn: 1,
        area: ['100%', '100%'],
        skin: 'layui-layer-nobg',
        shadeClose: true
      });
      layer.full(index);
      var type = this.$(e.currentTarget).data('type');
      var d = coala.mount(gardenPhotoDetail, '#photoDetail');
      var indexOrder = this.$(e.currentTarget).data('slickIndex');
      d.index = index;
      d.trigger('fetch', { gardenId: this.refOpts.gardenId, type: type, index: indexOrder });
      $('#photoDetail').parent().next('.layui-layer-setwin').find('a').addClass('reset-close-btn');
    }
  }
};
