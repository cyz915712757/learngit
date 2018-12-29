var imageuploader = require('components/imageuploader');
var tpl = require('./index.html');

module.exports = {
  tpl: tpl,
  refs: {
    uploader: {
      el: '#uploader',
      component: imageuploader
    }
  }
};
