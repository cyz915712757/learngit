var coala = require('coala');
var config = require('config');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
var reportBind = require('components/reportBind');
var mixin = require('../publist/mixin.js');
var tpl = require('./index.html');
require('./index.css');
module.exports = {
  tpl: tpl,
  data: { isInit: true, filterText: {} },
  listen: {
    init: function () {

    },

    mount: function () { },

    updated: function () {
      var _this = this;
      /*   _this.$('.js-infohover').hover(function() {
           $(this).find(".info-hoverbox").removeClass('dn');
           $(this).find(".info-dfbox").addClass('dn');
         }, function() {
           $(this).find(".info-hoverbox").addClass('dn');
           $(this).find(".info-dfbox").removeClass('dn');
         }); */
    },
    getMain: function (selected, page, pageSize) {
      var _this = this;
      var flag = '';
      var filterArr = [];
      if (selected) {
        flag = selected.flag;
        $.each(selected.filterHist, function (key, val) {
          if (val) {
            filterArr.push(val);
          }
        });
        selected.sendData.page = page || 1;
        selected.sendData.pageSize = pageSize || 20;
      }
      this._getMain(selected, function (data1, data2, pageParam) {
        _this.data.isInit = null;
        _this.data.positionType = _this._setPos();
        _this.data.list = data1;
        _this.data.other = data2;
        _this.data.flag = flag;
        _this.data.cname = selected && selected.cname;
        _this.data.filterText = filterArr && filterArr.join('、');
        if (filterArr.length == 0) {
          _this.data.cityflag = true;
        }
        _this.data.pageParam = pageParam;
        _this.update();
        if ((flag === 'gm') && pageParam) {
          _this.parent.refs.pagination.trigger('refresh', pageParam);
        }
      });
    },
    // 询问绑定
    askBind: function () {
      global.layer.open({
        skin: 'open-title',
        type: 1,
        shadeClose: true,
        area: ['375px', '160px'],
        title: '&nbsp',
        content: '<div class="tip-box warn-box pr"><i class="iconfont icon-gantanhao"></i>请绑定公司后再报备</div>',
        btn: ['马上绑定', '暂不绑定'],
        yes: function (index, layero) {
          global.layer.close(index); // 如果设定了yes回调，需进行手工关闭
          // 马上绑定
          // amplify.store.sessionStorage('refer', { pathname: location.pathname, search: location.search });
          // location.href = 'report-bind.html';
          global.layer.open({
            type: 1,
            shadeClose: true,
            area: ['520px', '550px'],
            title: '',
            content: '<div id="reportBind"></div>',
            scrollbar: false
          });
          coala.mount(reportBind, '#reportBind');
        }
      });
    }
  },
  mixins: [mixin],
  events: {
    'click .js-report': 'reportFun'
  },

  handle: {
    reportFun: function (e) {
      var _this = this;

      // 判断有没有绑定 没绑定弹框 绑定继续报备 storeId有没有值 没有值就要提示绑定
      var uid = amplify.store.sessionStorage('uid');
      var infoMenu = null;
      if (uid) {
        infoMenu = amplify.store.sessionStorage('infoMenu_' + uid);
      }
      if (!infoMenu.storeId) {
        _this.trigger('askBind');
        return;
      }
      $.ajax({
        type: 'POST',
        url: '/newhouse-web/garden/report/getPhoneFormats',
        dataType: 'json',
        data: { expandId: _this.$(e.currentTarget).data('id') },
        success: function (data) {
          if (data.status === 'C0000') {
            var dataObj = data.result || {};
            var realData = {};

            var hkType = dataObj.FPhoneFormatHK;
            var defaultType = dataObj.Fphoneformat;

            var reg = /^1+$/;
            var reg1 = /^1+0+$/;
            var reg2 = /^1+0+1+$/;

            if (
              !(
                reg.test(hkType)
                || reg1.test(hkType)
                || reg2.test(hkType)
              )
            ) {
              hkType = '1111000011111';
            }

            if (
              !(
                reg.test(defaultType)
                || reg1.test(defaultType)
                || reg2.test(defaultType)
              )
            ) {
              defaultType = '11100001111';
            }

            realData = {
              FPhoneFormatHK: hkType,
              Fphoneformat: defaultType,
              phoneType: 'ML' // HK: hongkong ML: mainland
            };


            _this.$openReport(_this.$(e.currentTarget), realData);
          } else {
            global.layer.msg(data.message);
          }
        },
        error: function (err) {
          global.layer.msg('err:' + err);
        }

      });
    }
  }
};
