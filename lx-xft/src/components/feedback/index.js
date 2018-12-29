var tpl = require('./index.html');
require('assets/vendors/plupload/plupload.full.min');
var layer = require('components/layer');
var BASE_URL = '/assets/vendors/plupload/';
var itemTpl = require('./item.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function() {
      $(document).on('input', '.show-content', function() {
        var content = $(this).val();

        if(content.length > 140){
          $(this).val(content.substring(0,140));
          return;
        }
        $('#realNum').text(content.length);
      })
      $('.js-feedback .red-dot').text('0').hide(300);
      this.trigger('getFeedList', { page: 1 });
    },

    updated: function() {
      this.trigger('initUploader');
    },

    initUploader: function() {
      var _this = this;
      //跟新已读为未读
      $.post({url:'/newhouse-web/index/feedback/isRead'});

      var $list = this.$('#imgList');
      var addFile = function(file, defaultStatus) {
        var $li = $('<li class="uploader-img-item" id="img' + file.id + '" data-fid="' + file.id + '"></li>');

        if (defaultStatus == 'FILE_SIZE_ERROR' || file.size / 1024 / 1024 > 5) {
          $li.append('<p class="uploader-img-wrap"><i class="iconfont icon-jinggao fs18"></i> 上传失败</p><div class="uploader-status-bar">上传失败，图片大小超过10M</div>');
          uploader.removeFile(file.id);
        } else {
          $li.append('<p class="uploader-img-wrap"><img class="uploader-img" src="assets/img/transparent.png"></p><div class="uploader-status-bar"><p class="uploader-progress"><span></span></p>上传中</div>');
        }

        $li.append('<a class="uploader-img-remove" href="javascript:;">&times;</a>');
        $list.append($li);
      };

      var uploader = new plupload.Uploader({
        max_file_count: 3,
        browse_button: 'uploadPointer',
        url: '/newhouse-web/pub/service/upload/image',
        flash_swf_url: BASE_URL + 'Moxie.swf',
        multi_selection: true,
        filters: {
          mime_types: [{
            title: '图片文件',
            extensions: 'jpeg,jpg,gif,png,bmp'
          }],
          max_file_size: '5mb',
          prevent_duplicates: true
        }
      });
      uploader.init();

      uploader.bind('Error', function(up, err) {
        if (err.code == -600) {
          // 'plupload.FILE_SIZE_ERROR'
          addFile(err.file, 'FILE_SIZE_ERROR');
          _this.$('#uploaderTips').hide();
        } else if (err.code == -602) {
          layer.msg('对不起，请不要重复的文件');
        }
      });

      uploader.bind('FilesAdded', function(up, files) {
        var len = files.length;
        var addLength = $('#imgList li').length;
        if ((len + addLength) > 3) {
          layer.msg('对不起，最多只能上传 3 张图片');
          return;
        } else {
          var opts = up.getOption();
          _this.$('#uploaderTips').hide();
          for (var i = 0; i < len; i++) {
            addFile(files[i]);
          }
          up.start();
        }
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
          var url = uri.replace('{size}', '90x53');
          $imgItem.find('.uploader-status-bar').html('上传成功');
          $imgItem.attr('data-furl', res.result.fdfsUrl);
          $imgItem.find('img').attr('src', url).data('url', uri).css({
            width: 90,
            height: 53
          }).addClass('js-success');
        }
      });

      this.$('#imgList').on('click', '.uploader-img-remove', function() {
        var $el = $(this).closest('li');
        var file = uploader.getFile($el.data('fid'));
        file && uploader.removeFile(file);
        $el.remove();
        if (!_this.$('#imgList li').length) {
          _this.$('#uploaderTips').show();
        } else {
          _this.$('#uploaderTips').hide();
        }
      });

      setTimeout(function() {
        _this.$('#filePicker').trigger('click');
      }, 300);
    },

    getFeedList: function(opts) {
      var _this = this;
      $.ajax({
        url: '/newhouse-web/index/feedback/query',
        data: {
          page: opts.page
        },
        success: function(data) {
          if (data.status === 'C0000') {
            _this.data.currentPage = data.result.currentPage;
            if (opts.page == 1) {
              _this.data.list = data.result.items;
              _this.update();
            } else {
              _this.trigger('appendMoreData', { item: data.result.items });
            }
            if (opts.page != data.result.pageCount) {
              $('.view-more-wrapper').show();
            } else {
              $('.view-more-wrapper').hide();
            }
          }
        }
      });
    },

    appendMoreData: function(data) {
      var template = itemTpl({ data: data.item });
      $('.my-history-item').append(template);
    }
  },

  events: {
    'click .js-cancel': 'closeModal',
    'click .js-submit': 'submitHandle',
    'click .view-more': 'viewMore'
  },

  handle: {
    closeModal: function(e) {
      layer.close(this.index);
    },
    submitHandle: function(e) {
      var _this = this;
      var content = $.trim(this.$('.show-content').val());
      var photos = [];
      $.each(this.$('#imgList li'), function(index, ele) {
        photos.push($(ele).data('furl'));
      });

      if (!content) {
        layer.msg('请输入建议内容');
        this.$('.show-content').focus();
        return;
      }

      $.ajax({
        url: '/newhouse-web/index/feedback/add',
        data: {
          content: content,
          photos: photos.join(',')
        },
        type: 'post',
        success: function(data) {
          if (data.status === 'C0000') {
            layer.msg('上传成功！');
            _this.trigger('getFeedList', { page: 1 });
          }
        }
      });
    },
    viewMore: function() {
      this.trigger('getFeedList', { page: this.data.currentPage + 1 })
    }
  }
};
