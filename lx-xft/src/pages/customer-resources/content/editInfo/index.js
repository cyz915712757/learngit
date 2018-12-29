var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  data: { item: {}, type: {} },
  listen: {
    init: function() { this.editData = { intentionCityId: '', intentionCountyId: '', intentionAreaId: '', intentionGardenId: '', intentionLayout: '', intentionMinArea: '', intentionMaxArea: '', intentionMinPrice: '', intentionMaxPrice: '', remark: '' }; },
    render: function(configObj) {
      var _this = this;
      if (configObj.getitem) {
        _this.data.item = configObj.getitem;
        _this.data.item.batch = configObj.batch;
        _this.update();
      } else {
        _this.update();
      }
    },
    mount: function() {

    },
    updated: function() {
      var _this = this;
      $('#subBtn').removeClass('disable');
      var res = this.data.item;
      /*初始化验证器*/
      this.trigger('createInfoValidator');
      this.trigger('initWaySel');
      this.trigger('initCustomerGroup');
      this.trigger('initCitySel');
      this.trigger('initGardenSel');
      this.trigger('initLayout');
      if (!$.isEmptyObject(res)) {
        if (_this.configObj.customerId) {
          this.editData.customerId = _this.configObj.customerId;
        }
        this.editData.id = res.id;
        this.editData.batch = res.batch;
        this.wayInfosources.setValue({ id: res.sourceType, name: res.source });
        this.customerGroup.setValue({id:res.customerGroupId,name:res.customerGroupName});
        this.editData.customerGroupId = res.customerGroupId;
        this.editData.customerGroupName = res.customerGroupName;
        this.editData.waySource = res.sourceType;
        this.editData.intentionCityId = res.intentionCityId;
        this.editData.intentionCountyId = res.intentionCountyId;
        this.editData.intentionAreaId = res.intentionAreaId;
        this.editData.intentionGardenId = res.intentionGardenId;
        this.editData.intentionLayout = res.layout;
        this.layout.setValue({ name: res.layout });
      }
    },
    createInfoValidator: function() {
      this.validator = new Validation([{
        el: '#cname',
        rules: [
          { rule: 'required', message: '请输入客户姓名' },
          { rule: 'maxlength', param: 10 }
        ],
      }, {
        el: '#phone',
        rules: [
          { rule: 'required', message: '请输入手机号' },
          { rule: 'phone', message: '请输入11位手机号' },
        ],
      }, {
        el: '#minArea',
        rules: [
          { rule: 'digits', message: '请填写数字' },
          { rule: 'min', param: 0 }
        ],
      }, {
        el: '#maxArea',
        rules: [
          { rule: 'digits', message: '请填写数字' },
          { rule: 'min', param: 0 }
        ],
      }, {
        el: '#minPrice',
        rules: [
          { rule: 'digits', message: '请填写数字' },
          { rule: 'min', param: 0 }
        ],
      }, {
        el: '#maxPrice',
        rules: [
          { rule: 'digits', message: '请填写数字' },
          { rule: 'min', param: 0 }
        ],
      }, {
        el: '#remark',
        rules: [
          { rule: 'maxlength', param: 60, message: '您可输入60个字' },
        ],
      }, {
        el: '#wayInfosources',
        event: 'bs.select.change',
        getValue: function($el) {
          return $el.data('select').getId()
        },
        rules: [
          { rule: 'required', message: '请选择来源' }
        ]
      }]);
    },
    initLayout: function() {
      var _this = this;
      this.layout = this.$('#layout').select({
        data: ['一房', '二房', '三房', '四房', '五房及以上', '别墅', '写字楼', '商铺', '其他'],
        rows: 5
      });
      this.$('#layout').on('bs.select.select', function(e, value, select) {
        _this.editData.intentionLayout = value.name;
      });
    },
    initWaySel: function() {
      var _this = this;
      this.wayInfosources = this.$('#wayInfosources').select({
        url: '/newhouse-web/customer/basic/waySources',
        dataFormater: function(data) {
          return data.result;
        },
        keyword: 'keyword',
        placeholder: '选择来源',
      });
      this.$('#wayInfosources').on('bs.select.select', function(e, value, select) {
        _this.editData.waySource = value.id;
      });
    },
    initCustomerGroup:function(){
      var _this = this;
      this.customerGroup = this.$('#customerGroup').select({
        url: '/newhouse-web/customer/basic/customerGroups',
        idField:'id',
        dataFormater: function(data) {
          return data.result;
        },
        keyword: 'keyword',
        placeholder: '选择分组',
      });
      this.$('#customerGroup').on('bs.select.select', function(e, value, select) {
        _this.editData.customerGroupId = value.id;
        _this.editData.customerGroupName = value.name;
      });
      this.$('#customerGroup').on('bs.select.clear', function(e, value, select) {
        _this.editData.customerGroupId = '';
        _this.editData.customerGroupName = '';
      });
    },
    initCitySel: function() {
      var res = this.data.item;
      var _this = this;
      this.citySel = this.$('#city').select({
        url: '/newhouse-web/customer/basic/queryCity',
        idField: 'internalId',
        keyword: 'keyword',
        rows: 6,
        dataFormater: function(data) {
          return data.result;
        },
        search: true
      });

      if (!$.isEmptyObject(res)) {
        this.trigger('initCounty', res.intentionCityId);
        this.trigger('initAreaSel', res.intentionCountyId);
        this.citySel.setValue({ internalId: res.intentionCityId, name: res.intentionCityName });
        this.countySel.setValue({ internalId: res.intentionCountyId, name: res.intentionCountyName });
        this.areaSel.setValue({ internalId: res.intentionAreaId, name: res.intentionAreaName });
      } else {
        this.trigger('initCounty', null);
        this.trigger('initAreaSel', null);
        _this.countySel.disable();
        _this.areaSel.disable();
      }
      this.$('#city').on('bs.select.select', function(e, value, select) {
        _this.editData.intentionCityId = value.internalId;
        _this.countySel.enable();
        _this.countySel.setParams({ internalCityId: value.internalId });
      });
      this.$('#city').on('bs.select.clear', function(e, value, select) {
        _this.editData.intentionCityId = '';
        _this.editData.intentionCountyId = '';
        _this.editData.intentionAreaId = '';
        _this.countySel.setValue({});
        _this.areaSel.setValue({});
        _this.countySel.disable();
        _this.areaSel.disable();
      });
    },
    initCounty: function(internalCityId) {
      var res = this.data.item;
      var _this = this;
      this.countySel = this.$('#county').select({
        url: '/newhouse-web/customer/basic/queryCounty',
        idField: 'internalId',
        rows: 6,
        params: { internalCityId: internalCityId },
        keyword: 'keyword',
        dataFormater: function(data) {
          return data.result;
        },
        search: true,
      });
      this.$('#county').on('bs.select.select', function(e, value, select) {
        _this.editData.intentionCountyId = value.internalId;
        _this.areaSel.enable();
        _this.areaSel.setParams({ internalCountyId: value.internalId });
      });
      this.$('#county').on('bs.select.clear', function(e, value, select) {
        _this.editData.intentionCountyId = '';
        _this.editData.intentionAreaId = '';
        _this.areaSel.setValue({});
        _this.areaSel.disable();
      });

    },
    initAreaSel: function(internalCountyId) {
      var _this = this;
      this.areaSel = this.$('#intentionArea').select({
        url: '/newhouse-web/customer/basic/queryArea',
        idField: 'internalId',
        rows: 6,
        keyword: 'keyword',
        params: { internalCountyId: internalCountyId },
        dataFormater: function(data) {
          return data.result;
        },
        search: true,
      });
      this.$('#intentionArea').on('bs.select.select', function(e, value, select) {
        _this.editData.intentionAreaId = value.internalId;
      });
      this.$('#intentionArea').on('bs.select.clear', function(e, value, select) {
        _this.editData.intentionAreaId = '';
      });

    },
    initGardenSel: function() {

      var res = this.data.item;
      var _this = this;
      this.gardenSel = this.$('#garden').select({
        url: '/newhouse-web/customer/basic/queryGarden',
        idField: 'gardenErpId',
        rows: 5,
        keyword: 'keyword',
        dataFormater: function(data) {
          return data.result;
        },
        search: true,
      });
      if (!$.isEmptyObject(res)) {
        this.gardenSel.setValue({ gardenErpId: res.intentionGardenId, name: res.intentionGardenName });
      }
      this.$('#garden').on('bs.select.select', function(e, value, select) {
        _this.editData.intentionGardenId = value.gardenErpId;
      });
      this.$('#garden').on('bs.select.clear', function(e, value, select) {
        _this.editData.intentionGardenId = '';
      });
    }
  },
  events: {
    'click #subBtn:not(.disable)': 'subInfo'
  },
  handle: {
    subInfo: function(e) {
      var _this = this;
      var tagEl = this.$(e.currentTarget);
      var result = this.validator.validate();
      var cname = $.trim(this.$('#cname').val());
      _this.editData.mobile = $.trim(this.$('#phone').val());
      _this.editData.name = cname;
      if (this.$('#minArea').val()) {
        _this.editData.intentionMinArea = parseInt($.trim(this.$('#minArea').val()), 10);
      } else {
        _this.editData.intentionMinArea = '';
      }
      if (this.$('#maxArea').val()) {
        _this.editData.intentionMaxArea = parseInt($.trim(this.$('#maxArea').val()), 10);
      } else {
        _this.editData.intentionMaxArea = '';
      }
      if (this.$('#minPrice').val()) {
        _this.editData.intentionMinPrice = parseInt($.trim(this.$('#minPrice').val()), 10) * 10000;
      } else {
        _this.editData.intentionMinPrice = '';
      }
      if (this.$('#maxPrice').val()) {
        _this.editData.intentionMaxPrice = parseInt($.trim(this.$('#maxPrice').val()), 10) * 10000;
      } else {
        _this.editData.intentionMaxPrice = '';
      }
      _this.editData.remark = $.trim(this.$('#remark').val());
      if (result) {
        //console.log(_this.editData);
        $.ajax({
          type: 'POST',
          data: _this.editData,
          beforeSend: function() {
            tagEl.addClass('disable');
          },
          url: '/newhouse-web/customer/' + _this.configObj.sendUrl,
          success: function(data) {
            if (data.status == 'C0000') {
              tagEl.addClass('disable');
              if (_this.configObj.type == 'add') {
                layer.msg('添加成功!');
                _this.parent.csCon.trigger('refresh');
              } else if (_this.configObj.type == 'edit') {
                layer.msg('编辑成功!');
                _this.parent.csCon.trigger('refresh');
                _this.parent.refs.viewCustomer.refs.privateDetail.trigger('getItemDetail');
              } else {
                layer.msg('转私成功!');
                _this.parent.changeStatus(_this.configObj.id, '已转私');
                _this.parent.refs.viewCustomer && _this.parent.refs.viewCustomer.trigger('disabledBtnAndPhone');
              }
              setTimeout(function() {
                layer.close(_this.index);
              }, 1000);
            } else if (data.status == 'CUSTOMER0023') {
              /*已经转私*/
              _this.parent.changeStatus(_this.configObj.id, '已被他人转私');
              _this.parent.refs.viewCustomer && _this.parent.refs.viewCustomer.trigger('disabledBtnAndPhone');
              layer.msg('对不起!此客户已被他人转私');
              setTimeout(function() {
                layer.close(_this.index);
              }, 1000);
            } else {
              tagEl.removeClass('disable');
              layer.msg(data.message);
            }
          }
        });
      }
    }
  }
};
