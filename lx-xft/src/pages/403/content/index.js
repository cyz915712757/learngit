var coala = require('coala');
var permission = require('./permission');
var tpl = require('./index.html');
require('./index.css');
module.exports = {
  tpl: tpl,
  refs: {
    permission:{
      el:'#noPermission',
      component: permission
    }
  }
};
