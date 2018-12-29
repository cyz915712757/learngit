var coala = require('coala');
var tpl = require('./index.html');
var layer = require('components/layer');
var previewLayout = require('./previewLayout');
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
        url: '/newhouse-web/garden/doorModelIntroduce',
        data: {
          expandId: _this.refOpts.gardenId
        },
        success: function(data) {
          if (data.status === 'C0000') {
            $.each(data.result, function(index, el) {
              el.url = el.url && el.url.replace('{size}', '1000x1000');
            });

            _this.data.list = data.result;
            _this.update();

            _this.$('.responsive').slick({
              dots: false,
              infinite: false,
              speed: 300,
              slidesToShow: 4,
              slidesToScroll: 4,
              flag: true, //特殊标记
              prevArrow: '<i class="iconfont icon-youqiehuan"></i>',
              nextArrow: '<i class="iconfont icon-qiehuan"></i>'
            });

            _this.$('button.slick-next').addClass('iconfont icon-qiehuan');
            _this.$('button.slick-prev').addClass('iconfont icon-youqiehuan');
          }
        }
      });
    }
  },
  events: {
    'click .js-preview-layout': 'previewLayout'
  },
  handle: {
    previewLayout: function(e) {
      // var layerHeight = screen.height <= 1020 ? '560px' : '710px';
      var index = layer.open({
        type: 1,
        title: false,
        content: '<div id="previewLayout"></div>',
        id: 'doorPreviewDetail',
        closeBtn: 1,
        area: ['100%', '100%'],
        skin: 'layui-layer-nobg',
        shadeClose: true
      });
      layer.full(index);
      var d = coala.mount(previewLayout, '#previewLayout');
      d.index = index;
      d.trigger('render', { list: this.data.list, current: this.$(e.currentTarget).parent().data('slickIndex') });
      $('#doorPreviewDetail').next('.layui-layer-setwin').find('a').addClass('reset-close-btn');
    }
  }
};
