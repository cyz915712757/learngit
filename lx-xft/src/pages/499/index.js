var common = require('common');
var coala = require('coala');
var content = require('./content');
var topNav = require('components/topNav');
var footer = require('components/footer');
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
    }
  },
  listen: {
    update: function () {
      this.data.height = $(window).height() - 90;
    },
    updated: function () {
      this.$('#menu').find('a[href="customer-resources.html"]').closest('li').addClass('cur');
    }
  },
  mixins: [{
    stReload: function () {
      return true;
    }
  }],
}), '#app');
