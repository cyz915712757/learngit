var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');
require('../../numeral.js');
var _ = require('lodash');
require('./index.css');
var domPrefixStr = '<div class="login-error-message"><i class="iconfont icon-gantanhao"></i>';
var domSuffixStr = '</div>';
module.exports = {
  tpl: tpl,
  data: {
    type: 'input', // 手动输入方式
    isRequired: false, // 绑定分店码内容 是否 是必填字段
    isTip: true // 建议绑定分店码提示 是否 是必填字段
  },
  listen: {
    init: function () {
      this.data.isRequired = this.refOpts.isRequired || false; // 是否 是必填字段
      this.data.isTip = this.refOpts.isTip || true; // 是否 提示
      this.params = { // 选择方式  门店参数
        companyId: '',
        companyName: '',
        storeId: '',
        storeName: ''
      };
      this.inputParams = { // 手动输入方式   门店参数
        storeId: '',
        storeName: '',
        companyName: '',
        companyId: ''
      };
    },

    mount: function () {
      // 门店码只能输入数字
      $('#getCompanyName').on('keyup', function () {
        this.value = this.value.replace(/[^\d]/g, '');
      });

      // 输入门店码 自动获取门店名字
      $('#getCompanyName').on('input', this.handle.getStoreFromStoreNum.bind(this));

      // 手动选择门店码 初始化 选择公司下拉框
      this.trigger('companySelect');

      // 手动选择门店码 初始化 选择公司下拉框
      this.trigger('storeSelect');

      // 需在companySelect和storeSelect 初始化后执行
      this.trigger('validate');
    },

    updated: function () { },

    companySelect: function () {
      var _this = this;
      this.companySelect = this.$('#companySelect').select({
        placeholder: '请选择公司',
        search: true,
        keyword: 'name',
        url: '/newhouse-web/outreach/company/getPagination',
        notFoundFormater: function () {
          return '<div class="no-data-find">暂无数据</div>';
        },
        dataFormater: function (result) {
          var data = result.result;
          if (data && data.items && data.items.length) {
            return data.items;
          }
          return '';
        },
        width: 80,
        highlight: true,
        rows: 5
      });
      $('#companySelect').on('bs.select.select', function (e, value, select) {
        $(this).parents('.login-form-group').next('.login-error-message').remove();
        _this.params = {
          companyId: value.id,
          companyName: value.name,
          storeId: '',
          storeName: ''
        };

        _this.storeSelect.enable();
        _this.storeSelect.setParams({
          companyId: value.id
        });
      });

      $('#companySelect').on('bs.select.clear', function (e, value, select) {
        _this.params = {
          companyId: '',
          companyName: '',
          storeId: '',
          storeName: ''
        };
        _this.storeSelect.clearValue();
        _this.storeSelect.disable();
        $('.store-number-container').text('');
      });
    },

    storeSelect: function () {
      var _this = this;
      _this.storeSelect = _this.$('#storeSelect').select({
        placeholder: '请选择分店',
        search: true,
        keyword: 'name',
        url: '/newhouse-web/outreach/store/queryStoresByComanyId',
        notFoundFormater: function () {
          return '<div class="no-data-find">暂无数据</div>';
        },
        dataFormater: function (result) {
          return result.result;
        },
        width: 80,
        highlight: true,
        rows: 5
      });

      _this.storeSelect.disable();

      $('#storeSelect').on('bs.select.select', function (e, value, select) {
        $(this).parents('.login-form-group').next('.login-error-message').remove();
        _this.params.storeId = value.id;
        _this.params.storeName = value.name;
        $('.store-number-container').text(value.storeNumber);
      });

      $('#storeSelect').on('bs.select.clear', function (e, value, select) {
        _this.params.storeId = '';
        _this.params.storeName = '';
        $('.store-number-container').text('');
      });
    },

    getParams: function () {
      // 手动输入门店码
      if (this.data.type === 'input') {
        var $getCompanyName = $('#getCompanyName');
        var storeNumber = $getCompanyName.val();

        if (
          storeNumber &&
          storeNumber.length === 6 &&
          $('.company-name').text().trim() &&
          $('.store-name').text().trim()
        ) {
          return this.inputParams;
        }

        $('#getCompanyName').trigger('blur');
        return false;
      }

      // 手动选门店码
      if (
        Object.values(this.params).every(function (val) {
          return !!val;
        })
      ) {
        return this.params;
      }

      $('#companySelect input').trigger('blur');
      $('#storeSelect input').trigger('blur');
      return false;
    },

    validate: function () {
      var _this = this;
      $('#getCompanyName').on('blur', function () {
        $(this).parent().siblings('.login-error-message').remove();
        if (!(this.value.length === 6)) {
          var extMsg = '请输入6位分店码';
          var msg = domPrefixStr + extMsg + domSuffixStr;
          $(this).parent().after(msg);
          return;
        }
      });

      $('#companySelect input').on('blur', function () {
        $(this).parents('.login-form-group').next('.login-error-message').remove();
        if (!(_this.params.companyId)) {
          var extMsg = '请选择公司';
          var msg = domPrefixStr + extMsg + domSuffixStr;
          $(this).parents('.login-form-group').after(msg);
        }
      });

      $('#storeSelect input').on('blur', function () {
        $(this).parents('.login-form-group').next('.login-error-message').remove();
        if (!(_this.params.storeId)) {
          var extMsg = '请选择分店';
          var msg = domPrefixStr + extMsg + domSuffixStr;
          $(this).parents('.login-form-group').after(msg);
        }
      });
    }


  },
  events: {
    'click input[name="bindType"]': 'toggleType'
  },

  handle: {
    toggleType: function (e) {
      var type = e.currentTarget.value;

      if (type === this.data.type) return;

      this.$('.item').toggleClass('cur');

      this.data.type = type;
    },
    getStoreFromStoreNum: function () {
      var _this = this;
      var $getCompanyName = $('#getCompanyName');

      var storeNumber = $getCompanyName.val();

      var storeNumberLen = storeNumber.length;

      var $storeNameDom = $getCompanyName.parents('.item').find('.store-name');

      var $companyNameDom = $getCompanyName.parents('.item').find('.company-name');

      _this.inputParams = {
        storeId: '',
        storeName: '',
        companyId: '',
        companyName: ''
      };

      if (storeNumberLen === 6) {
        if (/^\d{6}$/.test(storeNumber)) {
          $.ajax({
            url: '/newhouse-web/outreach/store/getStoreFromStoreNum',
            type: 'post',
            data: { storeNumber },
            success: function (data) {
              if (data.status === 'C0000' && data.result) {
                $getCompanyName.parent().siblings('.login-error-message').remove();

                var store = data.result.store;
                var company = data.result.company;
                $storeNameDom.text(store.name);
                $companyNameDom.text(company.name);

                _this.inputParams = {
                  storeId: store.id,
                  storeName: store.name,
                  companyId: company.id,
                  companyName: company.name
                };
              } else {
                $companyNameDom.text('');
                $storeNameDom.text('');

                $getCompanyName.parent().siblings('.login-error-message').remove();

                var msg = domPrefixStr + data.message + domSuffixStr;

                $getCompanyName.parent().after(msg);
              }
            }
          });
        }
      } else {
        $companyNameDom.text('');
        $storeNameDom.text('');
      }
    }
  }
};
