var coala = require('coala');
var layer = require('components/layer');
var tpl = require('./index.html');
require('vendors/slick-1.6.0/slick.min');
require('vendors/slick-1.6.0/slick.css');
require('vendors/slick-1.6.0/slick-theme.css');
require('./index.css');

var gardenPicture = require('./gardenPicture');
var gardenIntroDetail = require('./gardenIntroDetail');
var doorModelIntroduce = require('./doorModelIntroduce');
var sellPoint = require('./sellPoint');
var gardenDynamic = require('./gardenDynamic');
var distributionRule = require('./distributionRule');
var basicInformation = require('./basicInformation');
var gardenMap = require('./gardenMap');
var gardenKnowledge = require('./gardenKnowledge');

function getParam(p) {
  var reg = new RegExp('(^|&)' + p + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  return r ? decodeURI(r[2]) : null;
}

var gardenId = getParam('gid');

module.exports = {
  tpl: tpl,
  refs: {
    gardenPicture: {
      component: gardenPicture,
      el: '.garden-pic',
      gardenId: gardenId
    },
    gardenIntroDetail: {
      component: gardenIntroDetail,
      el: '#gardenIntroDetail',
      gardenId: gardenId
    },
    doorModelIntroduce: {
      component: doorModelIntroduce,
      el: '#doorModelIntroduce',
      gardenId: gardenId
    },
    sellPoint: {
      component: sellPoint,
      el: '#sellPoint',
      gardenId: gardenId
    },
    gardenDynamic: {
      component: gardenDynamic,
      el: '#gardenDynamic',
      gardenId: gardenId
    },
    distributionRule: {
      component: distributionRule,
      el: '#distributionRule',
      gardenId: gardenId
    },
    gardenMap: {
      component: gardenMap,
      el: '#gardenMap',
      gardenId: gardenId
    },
    basicInformation: {
      component: basicInformation,
      el: '#basicInformation',
      gardenId: gardenId
    },
    gardenKnowledge: {
      component: gardenKnowledge,
      el: '#gardenKnowledge',
      gardenId: gardenId
    }
  },
  listen: {
    mount: function () {
      var _this = this;
      $(window).off('scroll.nav').on('scroll.nav', function () {
        var top = $(this).scrollTop();
        if (top > 488) {
          this.$('.result-head').addClass('nav-fixed');
        } else {
          this.$('.result-head').removeClass('nav-fixed');
        }
      });

      $(document).off('click.nav').on('click.nav', '.result-head a', function () {
        $(this).siblings().removeClass('cur').end().addClass('cur');
        var id = $(this).data('id');
        $('html,body').animate({
          scrollTop: $('#' + id).offset().top - 50
        }, 200);
      });

      //判断楼盘动态
      $.ajax({
        url: '/newhouse-web/garden/dynamic',
        data: {
          expandId: gardenId,
          page: 1
        },
        success: function (data) {
          if (data.status === 'C0000' && !data.result.items.length > 0) {
            _this.$('.result-head a[data-id="gardenDynamic"]').remove();
          }
        }
      });
      //判断转介宝典
      $.ajax({
        url: '/newhouse-web/garden/knowledge',
        data: {
          expandId: gardenId
        },
        type: 'post',
        success: function (data) {
          if (data.status === 'C0000' && !data.result.length > 0) {
            _this.$('.result-head a[data-id="gardenKnowledge"]').remove();
          }
        }
      });
    }
  }
};
