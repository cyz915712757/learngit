var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function() {
      this.data.hType = this.refOpts.hType;
      this.data.hTname=this.refOpts.hTname;
      this.trigger('getSide');
    },

    getSide: function() {
      var _this = this;
      var hType = _this.data.hType;
      var newBox = _this.parent.$('#buildingNew').closest('.building-newbox');
      var recommendBox = _this.parent.$('#buildingIntro').closest('.building-introbox');
      var hTypeUrl = '';
      if (hType == 'new') {
        hTypeUrl = 'newGarden';
      } else {
        hTypeUrl = 'recommendGarden';
      }

      $.ajax({
        type: 'GET',
        url: '/newhouse-web/index/' + hTypeUrl,
        dataType: 'json',
        success: function(data) {

          if (data.status == 'C0000') {
            if (data.result && data.result.length > 0) {
              if (hType == 'new') {
                newBox.show();
              } else {
                recommendBox.show();
              }
              $.each(data.result, function(index, obj) {
                if (obj.pictureUrl.indexOf('{size}') > -1) {
                  obj.pictureUrl = obj.pictureUrl.replace('{size}', 80 + 'x' + 60);
                }
              });
              _this.data = data.result;
              _this.data.hType = _this.refOpts.hType;
              _this.data.hTname=_this.refOpts.hTname;
              _this.update();
            } else {
              if (hType == 'new') {
                newBox.hide();
                recommendBox.css('marginTop', 0);
              } else {
                recommendBox.hide();
              }
            }
          }
        }
      });

    }
  },
  events: {},

  handle: {}
};
