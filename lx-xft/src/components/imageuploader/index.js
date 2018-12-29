var layer = require('components/layer');
var tpl = require('./index.html');

require('assets/vendors/plupload/plupload.full.min');
require('./index.css');

var BASE_URL ='/assets/vendors/plupload/';

module.exports = {
  tpl: tpl,
  listen: {
    updated: function() {
      this.trigger('initUploader');
    },

    initUploader: function() {
      var opts = this.parent.data;
      var _this = this;
      var $list = this.$('#fileList');
      var addFile = function(file, defaultStatus) {
        var $li = $('<li class="uploader-img-item" id="img' + file.id + '" data-fid="' + file.id + '"></li>');

        if (defaultStatus == 'FILE_SIZE_ERROR' || file.size / 1024 / 1024 > 10) {
          $li.append('<p class="uploader-img-wrap"><i class="iconfont icon-jinggao fs18"></i> 上传失败</p><div class="uploader-status-bar">上传失败，图片大小超过10M</div>');
          uploader.removeFile(file.id);
        } else {
          $li.append('<p class="uploader-img-wrap"><img class="uploader-img" src="assets/img/transparent.png"></p><div class="uploader-status-bar"><p class="uploader-progress"><span></span></p>上传中</div>');
        }

        $li.append('<a class="uploader-img-remove" href="javascript:;">&times;</a>');
        $list.append($li);
      };

      var uploader = new plupload.Uploader({
        max_file_count: opts.maxFileCount,
        browse_button: 'filePicker',
        url: opts.uploadUrl,
        flash_swf_url: BASE_URL + 'Moxie.swf',
        filters: {
          mime_types: [{
            title: '图片文件',
            extensions: 'jpg,gif,png,bmp'
          }],
          max_file_size: '10mb',
          prevent_duplicates: true
        }
      });
      uploader.init();

      uploader.bind('Error', function(up, err) {
        if (err.code == -600) {
          // 'plupload.FILE_SIZE_ERROR'
          addFile(err.file, 'FILE_SIZE_ERROR');
          _this.$('#uploaderTips').hide();
        }
      });

      uploader.bind('FilesAdded', function(up, files) {
        var len = files.length;
        var opts = up.getOption();

        _this.$('#uploaderTips').hide();
        for (var i = 0; i < len; i++) {
          addFile(files[i]);
        }

        up.start();
      });

      uploader.bind('UploadProgress', function(uploader, file) {
        _this.$('#img' + file.id + ' .uploader-progress span').css('width', file.percent + '%');
      });

      uploader.bind('FileUploaded', function(up, file, info) {
        var res = JSON.parse(info.response);
        var fid = file.id;
        var $imgItem = $('#img' + fid);
        if (res.status !== 'C0000') {
          $imgItem.find('.uploader-img-wrap').html('<i class="iconfont icon-jinggao fs18"></i> 上传失败');
          $imgItem.find('.uploader-status-bar').html(res.message);
        } else if (res.result.url) {
          var uri = res.result.url;
          var url = uri.replace('{size}', '180x135');
          $imgItem.find('.uploader-status-bar').html('上传成功');
          $imgItem.find('img').attr('src', url).data('url', uri).css({
            width: 180,
            height: 135
          }).addClass('js-success');
        }
      });

      this.$('#fileList').on('click', '.uploader-img-remove', function() {
        var $el = $(this).closest('li');
        var file = uploader.getFile($el.data('fid'));
        file && uploader.removeFile(file);
        $el.remove();
        if (!_this.$('#fileList li').length) {
          _this.$('#uploaderTips').show();
        } else {
          _this.$('#uploaderTips').hide();
        }
      });

      setTimeout(function() {
        _this.$('#filePicker').trigger('click');
      }, 300);
    }

  },
  events: {
    'click #btnConfirm': 'confirmAndClose'
  },

  handle: {
    confirmAndClose: function(e) {
      var $images = this.$('#fileList img.js-success');
      if ($images.length > this.parent.data.maxFileCount) {
        layer.tips('最多只能选择 ' + this.parent.data.maxFileCount + ' 张图片！', e.currentTarget, {
          tips: [1, '#c00']
        });
        return;
      }

      var imageList = [];
      var _this = this;
      var setCover = this.parent.data.setCover;
      $.each($images, function(index, img) {
        var $img = $(img);
        imageList.push({
          url: $img.data('url'),
          fid: $img.closest('li').data('fid'),
          index: setCover ? '0' : undefined,
          imageType: _this.parent.data.imageType
        });
      });

      this.parent.parent.trigger('refreshImageList', {
        imageList: imageList,
        container: this.parent.data.container
      });
    }
  }
};
