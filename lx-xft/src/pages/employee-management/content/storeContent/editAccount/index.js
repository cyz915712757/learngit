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
        address: '',
        name: '',
        countyId: '',
        cityId: '',
        tel: '',
        areaId: ''
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
      this.editData.cityId = item.city && item.city.id;
      this.editData.countyId = item.county && item.county.id;
      this.editData.areaId = item.area && item.area.id;
      this.editData.id = item.id;
      this.editData.photoUrl = item.photoUrl;
      this.trigger('initCitySel');
      this.trigger('initArea');
      this.trigger('initPianqu');
      // this.area.setValue({
      //   id: item.brokerPosition || 'BROKER',
      //   name: item.brokerPositionDesc || '经纪人'
      // });
      // this.editData.brokerPosition = item.brokerPosition || 'BROKER';
      // if (!$.isEmptyObject(item)) {
      //   this.city.setValue({
      //     id: item.storeId,
      //     name: item.txtStoreName
      //   });
      //   this.editData.storeId = item.storeId;
      // }
      if (!$.isEmptyObject(item)) {
        item.city && this.city.setValue({
          id: item.city.id,
          name: item.city.name
        });
        item.county && this.area.setValue({
          id: item.county.id,
          name: item.county.name
        });
        item.area && this.pianqu.setValue({
          id: item.area.id,
          name: item.area.name
        });
      }
    },
    // 城市选择
    initCitySel: function () {
      var _this = this;
      this.city = this.$('#city').select({
        keyword: 'spell',
        url: '/newhouse-web/outreach/store/autoArea?level=2',
        dataFormater: function (data) {
          return data.result;
        },
        itemFormater: function (item) {
          return '<a href="javascript:;" data-id="' + item.id + '">' + item.name + '</a>';
        },
        search: true,
        placeholder: '城市名称',
        rows: 5
      });
      this.$('#city').on('bs.select.select', function (e, value, select) {
        _this.editData.cityId = value.id;
        _this.trigger('initArea', value.id);
      });
      this.$('#city').on('bs.select.clear', function (e, value, select) {
        _this.editData.cityId = '';
        _this.editData.countyId = '';
        _this.trigger('initArea', '');
        _this.trigger('initPianqu', '');
      });
    },
    // 区域
    initArea: function (id) {
      var _this = this;
      var curId = id || this.editData.cityId;
      this.area = this.$('#area').select({
        keyword: 'spell',
        url: '/newhouse-web/outreach/store/autoArea?level=3&cityId=' + curId,
        beforeOpen: function () {
          if (!curId) {
            $('#cityTip').show();
            return false;
          }
          $('#cityTip').hide();
        },
        dataFormater: function (data) {
          return data.result;
        },
        search: true,
        rows: 5,
        placeholder: '区域'
      });
      this.$('#area').on('bs.select.select', function (e, value, select) {
        _this.editData.countyId = value.id;
        _this.trigger('initPianqu', value.id);
      });
      this.$('#area').on('bs.select.clear', function (e, value, select) {
        _this.editData.countyId = '';
        _this.trigger('initPianqu', '');
      });
    },
    // 片区
    initPianqu: function (id) {
      var _this = this;
      var curId = id || this.editData.countyId;
      this.pianqu = this.$('#pianqu').select({
        keyword: 'spell',
        url: '/newhouse-web/outreach/store/autoArea?level=4&countyId=' + curId,
        beforeOpen: function () {
          if (!curId) {
            $('#areaTip').show();
            return false;
          }
          $('#areaTip').hide();
        },
        dataFormater: function (data) {
          return data.result;
        },
        search: true,
        rows: 5,
        placeholder: '片区'
      });
      this.$('#pianqu').on('bs.select.select', function (e, value, select) {
        _this.editData.areaId = value.id;
      });
    },
    // 验证对象
    createValidator: function () {
      this.validator = new Validation([{
        el: '#bname',
        rules: [{
          rule: 'required',
          message: '请输入分店名'
        },
        {
          rule: 'maxlength',
          param: 20
        }
        ]
      }, {
        el: '#phone',
        rules: [
          {
            rule: 'number'
          },
          {
            rule: 'maxlength',
            param: 20
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
        el: '#city',
        event: 'bs.select.change',
        placement: 'top',
        getValue: function ($el) {
          return $el.data('select').getId() && $el.data('select').getId().toString();
        },
        rules: [{
          rule: 'required',
          message: '请选择城市'
        }]
      }, {
        el: '#area',
        placement: 'top',
        event: 'bs.select.change',
        getValue: function ($el) {
          // id是整型
          return $el.data('select').getId() && $el.data('select').getId().toString();
        },
        rules: [{
          rule: 'required',
          message: '请选择区域'
        }]
      },
      {
        el: '#pianqu',
        placement: 'top',
        event: 'bs.select.change',
        getValue: function ($el) {
          // id是整型
          return $el.data('select').getId() && $el.data('select').getId().toString();
        },
        rules: [{
          rule: 'required',
          message: '请选择片区'
        }]
      },
      {
        el: '#address',
        rules: [{
          rule: 'required',
          message: '请输入详细地址'
        },
        {
          rule: 'maxlength',
          param: 20
        }
        ]
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
      var $countEl = $('#storeNumber');
      var count = $countEl.html();
      this.editData.address = $.trim(this.$('#address').val());
      this.editData.name = $.trim(this.$('#bname').val());
      this.editData.tel = $.trim(this.$('#phone').val());
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
        url: '/newhouse-web/outreach/store/' + _this.configObj.ajaxUrl,
        success: function (data) {
          if (data.status == 'C0000') {
            $tagEl.addClass('disable');
            if (_this.configObj.type == 'add') {
              layer.msg('已保存!');
              count = +count + 1;
              $countEl.html(count);
              _this.parent.trigger('loadTb');
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
