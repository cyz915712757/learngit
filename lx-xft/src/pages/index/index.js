var common = require('common');
var coala = require('coala');
var content = require('./content');
var topNav = require('components/topNav');
// var feedback = require('components/feedback')
var sideNav = require('components/sideNav');
var footer = require('components/footer');
var tpl = require('./index.html');

// ？？？？？？？？？？  找不到common   ？？？？？？？？？？？？？

coala.mount($.extend(true, common, {
  tpl: tpl,
  refs: {
    topNav: {
      component: topNav,
      el: '#topNav',
      isOpen: false     //  ??????? 是什么意思？有什么作用
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
    pageMark: function () {
      return 'index';
    },
    stReload: function () {
      return true;
    }
  }]
}), '#app');
