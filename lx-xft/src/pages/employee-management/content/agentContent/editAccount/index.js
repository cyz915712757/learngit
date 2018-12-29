var coala = require('coala');
var config = require('config');
var layer = require('components/layer');
// var utils = require('../../../../utils');
require('vendors/ajaxupload');

var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  data: {
    item: {},
    type: {}
  },
  listen: {
    init: function () {
      this.editData = {
        id: '',
        idCardNo: '',
        name: '',
        photoUrl: '',
        storeId: '',
        userName: '',
        brokerPosition: ''
      };
    },
    render: function (configObj) {
      this.configObj = configObj;
      if (configObj.getItem) {
        this.data.item = configObj.getItem;
      }
      this.update();
    },
    mount: function () {
      /* 初始化验证器 */
      this.trigger('createValidator');
    },
    updated: function () {
      var _this = this;
      var item = this.data.item;
      this.trigger('initStoreSel');
      this.trigger('initPosition');
      this.editData.id = item.id;
      this.editData.photoUrl = item.photoUrl;
      this.position.setValue({
        id: item.brokerPosition || 'BROKER',
        name: item.brokerPositionDesc || '经纪人'
      });
      this.editData.brokerPosition = item.brokerPosition || 'BROKER';
      if (!$.isEmptyObject(item)) {
        this.store.setValue({
          id: item.storeId,
          name: item.txtStoreName
        });
        this.editData.storeId = item.storeId;
      }
      // var $imgTarget = this.$('#avatarUploadImg');
      // var uploadEl = this.$('#avatarUpload');
      // if (!uploadEl.hasClass('disabled')) {
      //   new AjaxUpload(uploadEl, {
      //     action: '/newhouse-web/pub/service/upload/image',
      //     autoSubmit: true,
      //     name: 'file',
      //     responseType: 'json',
      //     liid: null,
      //     onSubmit: function (file, extension) {
      //       console.log(file, extension, this);
      //       if (!(extension.length && /^(jpg|png|jpeg)$/.test(extension[0]))) {
      //         layer.msg('请上传JPG、PNG、JPEG格式的图片');
      //         return false;
      //       }
      //       if (this._input.files && this._input.files[0] && this._input.files[0].size > 5242880) {
      //         layer.msg('请上传小于5M的图片');
      //         return false;
      //       }
      //       uploadEl.addClass('disabled');
      //     },
      //     onComplete: function (file, data) {
      //       uploadEl.removeClass('disabled');
      //       if (data.status === 'C0000') {
      //         var imgUrl = data.result.url.replace('{size}', '80x80');
      //         $imgTarget.attr('src', imgUrl);
      //         if ($imgTarget.hasClass('dn')) {
      //           $imgTarget.removeClass('dn');
      //         }
      //         layer.msg('上传成功');
      //         _this.editData.photoUrl = data.result.fdfsUrl;
      //       } else {
      //         layer.msg(data.message);
      //         return false;
      //       }
      //     }
      //   });
      // }
    },
    // 分店选择
    initStoreSel: function () {
      var _this = this;
      this.store = this.$('#store').select({
        url: '/newhouse-web/outreach/employee/getStores',
        dataFormater: function (data) {
          return data.result;
        },
        width: 200,
        rows: 5,
        placeholder: '分店'
      });
      this.$('#store').on('bs.select.select', function (e, value, select) {
        _this.editData.storeId = value.id;
        $('#storeNum').val(value.storeNumber);
      });
    },
    // 岗位
    initPosition: function () {
      var _this = this;
      this.position = this.$('#position').select({
        url: '/newhouse-web/outreach/employee/getBrokerPosition',
        dataFormater: function (data) {
          return data.result;
        },
        width: 200,
        rows: 5,
        placeholder: '岗位'
      });
      this.$('#position').on('bs.select.select', function (e, value, select) {
        _this.editData.brokerPosition = value.id;
      });
    },
    // 验证对象
    createValidator: function () {
      this.validator = new Validation([{
        el: '#bname',
        rules: [{
          rule: 'required',
          message: '请输入客户姓名'
        },
        {
          rule: 'maxlength',
          param: 10
        }
        ]
      }, {
        el: '#phone',
        rules: [{
          rule: 'required',
          message: '请输入手机号'
        },
        {
          rule: 'phone',
          message: '请输入11位手机号'
        }
        ]
      }, {
        el: '#idCard',
        rules: [{
          rule: 'idCard'
        }],
        magnifier: 'xxxxxx xxxx xxxx xxxx'
      },
      {
        el: '#store',
        event: 'bs.select.change',
        placement: 'top',
        getValue: function ($el) {
          return $el.data('select').getId() && $el.data('select').getId().toString();
        },
        rules: [{
          rule: 'required',
          message: '请选择分店'
        }]
      }, {
        el: '#position',
        placement: 'top',
        event: 'bs.select.change',
        getValue: function ($el) {
          // id是整型
          return $el.data('select').getId() && $el.data('select').getId().toString();
        },
        rules: [{
          rule: 'required',
          message: '请选择岗位'
        }]
      }
      ]);
    }

  },
  events: {
    // 验证手机号存在
    // 'blur #phone.js-unexit': 'checkPhone',
    // 提交编辑
    'click #edit:not(.disable)': 'edit'
  },

  handle: {
    // 提交编辑
    edit: function (e) {
      var _this = this;
      var $tagEl = this.$(e.currentTarget);
      var result = this.validator.validate();
      var $agentEl = $('#agentNumber');
      var $newAgent = $('#newPeople');
      var count = $agentEl.html();
      var newPeople = $newAgent.html() || 0;
      this.editData.userName = $.trim(this.$('#phone').val());
      this.editData.name = $.trim(this.$('#bname').val());
      this.editData.idCardNo = $.trim(this.$('#idCard').val());
      // console.log(result, this.editData);
      // 添加账户之后更新列表
      // 修改资料之后更新详细资料弹窗以及列表
      if (!result) {
        return;
      }
      $.ajax({
        type: 'POST',
        data: _this.editData,
        beforeSend: function () {
          $tagEl.addClass('disable');
        },
        url: '/newhouse-web/outreach/employee/' + _this.configObj.ajaxUrl,
        success: function (data) {
          if (data.status == 'C0000') {
            $tagEl.addClass('disable');
            if (_this.configObj.type == 'add') {
              layer.msg('账号开通成功，密码已以短信形式下发至手机，请注意查收!');
              count = +count + 1;
              newPeople = +newPeople + 1;
              if (newPeople === 1) {
                _this.parent.parent.trigger('getSummary');
              } else {
                $agentEl.html(count);
                $newAgent.html(newPeople);
                _this.parent.trigger('loadTb');
              }
              // _this.parent.refs.summary.trigger('getSummary');
            } else if (_this.configObj.type == 'modify') {
              layer.msg('修改成功!');
              _this.parent.trigger('loadTb');
              // _this.parent.parent.trigger('loadTb');
            }
            setTimeout(function () {
              layer.close(_this.index);
            }, 1500);
          } else if (data.status == 'INFO40') {
            /* 已经占用 */
            layer.msg('该手机号已占用，请重新输入');
            $tagEl.removeClass('disable');
            // setTimeout(function () {
            //   layer.close(_this.index);
            // }, 1000);
          } else {
            $tagEl.removeClass('disable');
            layer.msg(data.message);
          }
        }
      });
    }

  }

};
