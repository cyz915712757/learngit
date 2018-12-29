var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
//获取开通拨号权限
var dialFlag = amplify.store.sessionStorage('userConfig').dial_status.open || '';
var editInfo = require('./editInfo');
var viewCustomer = require('./viewCustomer');
require('./index.css');
module.exports = {
  tpl: tpl,
  listen: {
    openViewCustomer: function(opts) {
      var $el = opts.el;
      if ($('#viewCustomer').length) {
        return;
      }
      var index = layer.open({
        type: 1,
        title: '查看',
        area: ['860px', '640px'],
        // move: true,
        scrollbar: false,
        resize: false,
        content: '<div id="viewCustomer" class="deal-report"></div>',
        cancel: function() {
          layer.closeAll();
        }
      });

      var d = coala.mount(viewCustomer, '#viewCustomer');
      d.index = index;
      d.parent = this;
      this.refs.viewCustomer = d;
      var customerId = $el.data('customerId');
      var id = $el.data('id');
      var phone = $el.data('phone');
      var batch = $el.data('batch');
      var idArr = opts.idArr;

      d.trigger('fetch', {
        customerId: customerId,
        id: id,
        idArr: idArr,
        phone: phone,
        type: opts.type,
        typeDetail: opts.typeDetail,
        batch: batch
      });
    },
    init: function() {
      this.trigger('renderModel');
      this.data.dialFlag = dialFlag;
    },
    renderModel: function() {
      var _this = this;
      var curPosName = null;
      var position = amplify.store.sessionStorage('position');
      var userConfig = amplify.store.sessionStorage('userConfig');
      // 资料客管理权限
      if (userConfig && userConfig.customer_list_menu && userConfig.customer_list_menu.open === 'Y') {
        _this.data.menuListAuth = 1;
      }
      //资料客导入
      if (userConfig && userConfig.customer_batch_menu && userConfig.customer_batch_menu.open === 'Y') {
        _this.data.menuAuth = 1;
      }
      if (position) {
        curPosName = position[0].positionName;
      }
      /*经纪人没有客源统计功能 2表示没有*/
      switch (curPosName) {
        case '店长':
        case '营销经理':
        case '营销主管':
        case '网销经理':
          {
            _this.data.positionType = 1;
            _this.data.cusStatistics = 1;
            _this.requirePrivate();
          }
          break;
        case '经纪人':
        case '网销专员':
          {
            _this.data.positionType = 2;
            _this.data.customerType = 1;
            _this.data.cusStatistics = 2;
            _this.requirePrivate();
          }
          break;
        default:
          {
            _this.data.positionType = 2;
            _this.data.cusStatistics = 1;
            _this.requirePrivate();
          }
          break;
      }
    }
  },

  mixins: [{
    requirePrivate: function() {
      var _this = this;
      require.ensure([], function() {
        _this.csCon = coala.mount(require('./myPrivate'), '#csCon');
        _this.csCon.parent = _this;
      });
    },
    requireEmployeePrivate: function() {
      var _this = this;
      require.ensure([], function() {
        _this.csCon = coala.mount(require('./employeePrivate'), '#csCon');
        _this.csCon.parent = _this;
      });
    },
    requirePublic: function() {
      var _this = this;
      require.ensure([], function() {
        _this.csCon = coala.mount(require('./myPublic'), '#csCon');
        _this.csCon.parent = _this;
      });
    },
    requireResources: function() {
      var _this = this;
      require.ensure([], function() {
        _this.csCon = coala.mount(require('./resources'), '#csCon');
        _this.csCon.parent = _this;
      });
    },
    requireResourcesManager: function() {
      var _this = this;
      require.ensure([], function() {
        _this.csCon = coala.mount(require('./resourcesManager'), '#csCon');
        _this.csCon.parent = _this;
      });
    },
    requireCusStatistics: function() {
      var _this = this;
      require.ensure([], function() {
        _this.csCon = coala.mount(require('./cusStatistics'), '#csCon');
        _this.csCon.parent = _this;
      });
    },
    changeStatus: function(curId, str) {
      var curEl = $('a[data-id="' + curId + '"]');
      curEl.closest('tr').addClass('oped');
      if (str) {
        curEl.closest('.js-opbox').empty().html(str);
      }
    },
    editFun: function(title, configObj) {
      var _this = this;
      var index = layer.open({
        type: 1,
        shadeClose: true,
        area: ['800px', '520px'],
        title: title,
        content: '<div id="editInfoBox"></div>'
      });
      var editInfoCom = coala.mount(editInfo, '#editInfoBox');
      editInfoCom.index = index;
      editInfoCom.parent = _this;
      /*var configObj = { id: tagEl.data('id'), type: 'resources', getitem: data.result, sendUrl: 'resources/toPrivate', tb: _this.resourcesTb };*/
      editInfoCom.configObj = configObj;
      editInfoCom.trigger('render', configObj);
    },
  }],
  events: {
    'click #csTab a:not(".set-number")': 'tabFun',
    'click .set-number': 'setNumber'
  },

  handle: {
    tabFun: function(e) {
      var _this = this;
      var tagEl = this.$(e.currentTarget);
      var type = tagEl.data('type');
      if (!tagEl.hasClass('cur')) {
        tagEl.addClass('cur').siblings().removeClass('cur');
        //销毁日期
        if (_this.csCon) {
          _this.csCon.unmount();
          //_this.csCon.trigger('unmount');
        }
        switch (type) {
          case 'private':
            _this.requirePrivate();
            break;
          case 'eprivate':
            _this.requireEmployeePrivate();
            break;
          case 'public':
            _this.requirePublic();
            break;
          case 'resources':
            _this.requireResources();
            break;
          case 'resources-manager':
            _this.requireResourcesManager();
            break;
          case 'cus-statistics':
            _this.requireCusStatistics();
            break;
        }
      }

    },
    setNumber: function(){
      $.when($.ajax({
        url:'/newhouse-web/customer/dial/getCaller',
      })).done(function(res){
        var phone = res.result.caller || '';
        var index = layer.open({
        type: 1,
        shadeClose: true,
        area: ['400px', '200px'],
        btn:['保存','取消'],
        title: '设置主叫号码 <span style="font-size:12px;color:red">(当前电脑话机号码)</span>',
        content: '<div class="set-number-wrapper">' +
        '<div class="set-number-item">话机号码：<input type="text" id="caller" value="' + phone +'"/><a class="m-btn m-cbtn fr js-clear-number" href="javascript:;">清空</a></div>'+
        '</div>',
        yes: function(index){
          var caller = $.trim($('#caller').val());
          if(!(/^(13[0-9]|14[579]|15[0-3,5-9]|17[0135678]|18[0-9])\d{8}$/.test(caller))){
            layer.msg('请输入正确的手机号');
            return false;
          }
          $.ajax({
            url:'/newhouse-web/customer/dial/saveCaller',
            data:{
              caller:caller
            },
            type:'post',
            success: function(data){
              if(data.status === 'C0000'){
                layer.msg(data.message);
                layer.close(index);
              }else{
                layer.msg(data.message);
              }
            }
          });
        }
      });

      $(document).on('click','.js-clear-number',function(){
        $('#caller').val('').focus();
      });

      });

    }
  }

};
