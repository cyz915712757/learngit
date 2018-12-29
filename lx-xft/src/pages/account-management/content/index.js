var coala = require('coala');
var personalCenter = require('./personalCenter');
var feedback = require('./feedback');
var tpl = require('./index.html');
require('./index.css');
module.exports = {
  tpl: tpl,
  refs: {
    personalCenter: {
      el: '#personalCenter',
      component: personalCenter
    },
    feedback: {
      component: feedback,
      el: '#feedback'
    }
  }
};