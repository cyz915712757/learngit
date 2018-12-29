var coala = require('coala');
var config = require('config');
var layer = require('components/layer');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
var tpl = require('./index.html');
require('./index.css');
var modifyPassword = require('./modifyPassword');
var modifyPhone = require('./modifyPhone');
require('vendors/ajaxupload');
module.exports = {
  tpl: tpl,
  listen: {
    init: function () {
      var uid = amplify.store.sessionStorage('uid');
      if (uid) {
        infoMenu = amplify.store.sessionStorage('infoMenu_' + uid);
        infoMenu && (this.data = infoMenu);
      }
    },
    updated: function () {
      var _this = this;
      var $imgTarget = this.$('#avatarUploadImg');
      var uploadEl = this.$('#avatarUpload');
      if (!uploadEl.hasClass('disabled')) {
        new AjaxUpload(uploadEl, {
          action: '/newhouse-web/pub/service/upload/image',
          autoSubmit: true,
          name: 'file',
          responseType: 'json',
          liid: null,
          onSubmit: function (file, extension) {
            // console.log(file, extension,this);
            if (!(extension.length && /^(jpg|png|jpeg)$/.test(extension[0]))) {
              layer.msg('请上传JPG、PNG、JPEG格式的图片');
              return false;
            }
            if (this._input.files && this._input.files[0] && this._input.files[0].size > 5242880) {
              layer.msg('请上传小于5M的图片');
              return false;
            }
            uploadEl.addClass('disabled');
          },
          onComplete: function (file, data) {
            uploadEl.removeClass('disabled');
            if (data.status === 'C0000') {
              var imgUrl = data.result.url.replace('{size}', '130x130');

              $imgTarget.attr('src', imgUrl);
              layer.msg('上传成功');

              _this.trigger('updatedAvatar', {
                imgUrl: imgUrl,
                sendObj: {
                  image: data.result.fdfsUrl
                }
              });
            } else {
              layer.msg(data.message);
              return false;
            }
          }
        });
      }
    },
    updatedAvatar: function (opts) {
      var _this = this;
      $.ajax({
        type: 'POST',
        url: '/newhouse-web/info/account/update/headPortrait',
        dataType: 'json',
        data: opts.sendObj,
        success: function (data) {
          if (data.status === 'C0000') {
            // 清除用户信息
            var uid = amplify.store.sessionStorage('uid');

            if (uid) {
              infoMenu = amplify.store.sessionStorage('infoMenu_' + uid);

              infoMenu.photoUrl = opts.imgUrl;

              amplify.store.sessionStorage('infoMenu_' + uid, infoMenu);

              _this.parent.parent.refs.topNav.setAvatar(opts.imgUrl);
            }
          }
        }
      });
    }
  },
  events: {
    'click .modify-password': 'modifyPassword',
    'click .modify-phone': 'modifyPhone',
    'click #bindStore': 'bindStoreNumber'
  },

  handle: {
    modifyPassword: function (e) {
      var $ele = this.$(e.currentTarget);
      $ele.addClass('cur');
      var index = layer.open({
        type: 1,
        area: ['500px', '440px'],
        title: '&nbsp;',
        content: '<div id="modifyPassword"></div>',
        cancel: function () {
          $ele.removeClass('cur');
        }
      });
      var $title = $('#layui-layer' + index + ' .layui-layer-title');
      var d = coala.mount(modifyPassword, '#modifyPassword');
      d.index = index;
    },
    modifyPhone: function (e) {
      var $ele = this.$(e.currentTarget);
      $ele.addClass('cur');
      var index = layer.open({
        type: 1,
        area: ['500px', '305px'],
        title: '&nbsp;',
        content: '<div id="modifyPhone"></div>',
        cancel: function () {
          $ele.removeClass('cur');
        }
      });

      var $title = $('#layui-layer' + index + ' .layui-layer-title');

      var d = coala.mount(modifyPhone, '#modifyPhone');

      d.index = index;

      d.data.userName = this.data.userName;

      d.trigger('render');
    },
    bindStoreNumber: function () {
      require.ensure([], function (require) {
        var reportBind = require('components/reportBind');

        global.layer.open({
          type: 1,
          shadeClose: true,
          area: ['520px', '550px'],
          title: '',
          content: '<div id="reportBind"></div>',
          scrollbar: false
        });
        coala.mount(reportBind, '#reportBind');
      });
    }
  }

};
