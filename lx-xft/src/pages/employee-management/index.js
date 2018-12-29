var common = require('common');
var coala = require('coala');
var content = require('./content');
var topNav = require('components/topNav');
var footer = require('components/footer');
var sideNav = require('components/sideNav');
var tpl = require('./index.html');
coala.mount($.extend(true, common, {
  tpl: tpl,
  refs: {
    topNav: {
      component: topNav,
      el: '#topNav'
    },
    content: {
      component: content,
      el: '#pageWrapper'
    },
    footer: {
      component: footer,
      el: '#footer'
    },
    sideNav: {
      component: sideNav,
      el: '#sideNav'
    }
  },
  listen: {
    update: function () {
      this.data.height = $(window).height() - 90;
    }
  },
  mixins: [{
    stReload: function () {
      return true;
    }
  }],
}), '#app');
