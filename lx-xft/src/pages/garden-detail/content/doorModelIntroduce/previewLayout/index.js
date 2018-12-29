var tpl = require('./index.html');
require('./index.css');
module.exports = {
  tpl: tpl,
  listen: {
    render: function(data) {

      $.each(data.list, function(index, el) {
        el.url = el.url && el.url.replace('220x260', '1000x1000');
      });

      this.data.list = data.list;
      this.update();
      var slick = this.$('.layout-preview').slick({
        infinite: false,
        prevArrow: '<i class="iconfont icon-youqiehuan"></i>',
        nextArrow: '<i class="iconfont icon-qiehuan"></i>'
      });
      $('.layout-preview').slick('slickGoTo', data.current, true);
      // var w = $(window).width()-100;
      var h = $(window).height()-150;
      this.$('.layout-preview-wrapper .img-wrapper').css({height: h + 'px' });
    }
  }
};
