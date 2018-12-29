var coala = require('coala');
var tpl = require('./index.html');
var layer = require('components/layer');
var dialog = require('./dialog');

var dragula = require('vendors/dragula/dragula.min.js');
require('./index.css');
require('assets/vendors/dragula/dragula.css');

module.exports = {
  tpl: tpl,
  listen: {
    update: function() {
      var _this = this;
      _this.uniqueId = 0;
      $.each(_this.data.imageList, function(k, v) {
        if (!v.id) {
          v.id = '';
        }

        if (!v.fid) {
          v.fid = ++_this.uniqueId;
        }
      });
    },

    updated: function() {
      var _this = this;
      dragula([this.$('.image-list')[0]], {
        moves: function(el, container, handle) {
          return handle.nodeName.toLowerCase() === 'img';
        }
      }).on('drag', function(el, source) {
        this.dragIndex = $(el).index();
      }).on('drop', function(el, target, source, sibling) {
        var beforePos = this.dragIndex;
        var afterPos = $(el).index();
        console.log(_this.data.imageList);
        var img = _this.data.imageList.splice(beforePos, 1);
        _this.data.imageList.splice(afterPos, 0, img[0]);
        console.log(_this.data.imageList);
      });
    },

    imageDialog: function(options) {
      var _this = this;
      var index = layer.open({
        type: 1,
        skin: 'layui-layer-rim',
        area: ['800px', '540px'],
        title: this.data.title || '请选择',
        content: '<div id="dialogBody"></div>',
        end: function() {
          _this.trigger('change');
        }
      });
      var d = coala.mount($.extend(dialog, {
        data: options
      }), '#dialogBody');
      d.parent = this;
      this.data.layerIndex = index;
    },

    refreshImageList: function(data) {
      layer.close(this.data.layerIndex);
      this.data.imageList = this.data.imageList.concat(data.imageList);
      this.update();
    },

    addImageFromLib: function(data) {
      if (this.data.imageList.length < this.data.imageTotalCount) {
        this.data.imageList.push(data.img);
        this.update();
        this.parent.trigger('setImageStatusInLib', {
          $el: data.$el,
          selected: true
        });
        this.trigger('change');
        this.$('.btn-add-image').toggleClass('btn-add-image-disabled', this.data.imageList.length == this.data.imageTotalCount);
      }
    },

    restoreImageToLib: function(fid) {
      var pos = -1;
      $.each(this.data.imageList, function(k, v) {
        if (fid == v.fid) {
          pos = k;
          return false;
        }
      });

      if (pos !== -1) {
        this.parent.trigger('setImageStatusInLib', {
          $el: $('#' + fid).closest('li'),
          selected: false
        });
        this.data.imageList.splice(pos, 1);
        this.update();
      }
    }
  },

  events: {
    'click .btn-add-image': 'addImage',
    'click .gallery-img-remove': 'removeImage',
    'mouseenter .gallery-img-preview': 'previewImage',
    'mouseleave .gallery-img-preview': 'hideImage',
    'click a.gallery-img-set-cover': 'setCover',
    'change .gallery-img-type': 'setImageType'
  },

  handle: {
    addImage: function(e) {
      var $el = $(e.currentTarget);
      var imageCount = +$el.data('imageRemainingCount');
      if (imageCount) {
        this.trigger('imageDialog', {
          container: '#' + $el.parent().attr('id'),
          maxFileCount: imageCount,
          uploadUrl: this.data.uploadUrl,
          setCover: this.data.setCover,
          imageType: !!this.data.imageTypeList ? 'LANDSCAPE' : undefined
        });
      }
    },

    removeImage: function(e) {
      // post a request to remove the image on server
      //$.ajax({});
      var $el = $(e.target);
      var $imgCon = $el.closest('li');
      var fid = $imgCon.find('img').data('fid');
      this.trigger('restoreImageToLib', fid);
    },

    previewImage: function(e) {
      var url = $(e.currentTarget).closest('li').find('img').data('url');
      url = url.replace('{size}', '600x450');
      this.data.layerIndex = layer.tips('<div><img src="' + url + '" width="600" height="450"></div>', $(e.currentTarget), {
        tips: [3, '#ebebeb'],
        area: ['615px', '459px'],
        time: 0,
        shift: 5
      });
      $('.layui-layer-tips .layui-layer-content').css('padding', '8px');
    },

    hideImage: function(e) {
      if (this.data.layerIndex) {
        layer.close(this.data.layerIndex);
        this.data.layerIndex = 0;
      }
    },

    setCover: function(e) {
      var fid = $(e.currentTarget).closest('li').find('img').data('fid');
      $.each(this.data.imageList, function(idx, val) {
        val.index = val.fid == fid ? '1' : '0';
      });

      this.update();
    },

    setImageType: function(e) {
      var type = $(e.currentTarget).val();
      var fid = $(e.currentTarget).closest('li').find('img').data('fid');
      $.each(this.data.imageList, function(idx, val) {
        if (val.fid == fid) {
          val.imageType = type;
        }
      });

    }
  }
};
