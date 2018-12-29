var coala = require('coala');
var tpl = require('./index.html');
var layer = require('components/layer');
var reportBind = require('components/reportBind');
var directRoom = require('../directRoom');
var programs = require('../programs');
var reportDialog = require('components/reportDialog');
var amplify = require('vendors/amplify/amplify.store.min').amplify;

require('./index.css');


module.exports = {
  tpl: tpl,
  listen: {
    mount: function () {
      var _this = this;

      this.trigger('getMainInformation');
      this.trigger('getDirectRoom');
    },

    getDirectRoom: function () {
      var _this = this;
      this.directPromise = $.ajax({
        url: '/newhouse-web/garden/directRoom',
        data: {
          expandId: _this.refOpts.gardenId
        },
        success: function (data) {
          if (data.status === 'C0000') {
            var sort = ['A', 'B', 'C'];
            $.each(data.result, function (index, el) {
              el.image = el.image.replace('{size}', '120x90');
              var str = [];
              $.each(el.houseType.split(','), function (i, e) {
                str.push('户型' + sort[i] + ':' + e);
              });

              el.houseType = str.join(',');
            });
            _this.data = {
              directList: data.result
            };
          }
        }
      });
    },
    setPos: function () {
      var _this = this;
      var curPosName = null;
      var userConfig = amplify.store.sessionStorage('userConfig');
      var position = amplify.store.sessionStorage('position');
      if (position) {
        curPosName = position[0].positionName;
      }
      var pos = 1;

      // 公司负责人需要判断外联内联
      var uid = amplify.store.sessionStorage('uid');
      var infoMenu = null;
      var companyType = null;
      uid && (infoMenu = amplify.store.sessionStorage('infoMenu_' + uid));
      infoMenu && (companyType = infoMenu.companyType);
      switch (curPosName) {
        case '公司负责人':
          _this.data.pos = 2;
          if (companyType === 'OUTREACH') {
            if (userConfig && userConfig.companyReport && (userConfig.companyReport.open === 'Y')) {
              _this.data.pos = 1;
            }
          }
          break;
        case '营销总监':
        case '城市副总经理':
        case '城市总经理':
          _this.data.pos = 2;
          break;
        case '店长':
        case '营销经理':
        case '营销主管':
        case '网销经理':
          _this.data.pos = 1;
          if (userConfig && userConfig.storeReport && (userConfig.storeReport.open === 'N')) {
            _this.data.pos = 2;
          }
          break;
        default:
          _this.data.pos = 1;
          break;
      }
    },
    getMainInformation: function () {
      var _this = this;
      $.ajax({
        url: '/newhouse-web/garden/mainInformation',
        data: {
          expandId: _this.refOpts.gardenId
        },
        success: function (data) {
          if (data.status === 'C0000') {
            _this.data = data.result;
            var commissions = data.result.commissions[0] || {};
            _this.data.flagLength = data.result.commissions.length;
            _this.data.maxRetio = commissions.retioMoney;
            _this.data.fixed = commissions.fixedMoney;
            _this.data.cash = commissions.cashMoney;
            document.title = _this.data.name;
            _this.trigger('setPos');
            _this.update();
          }
        }
      });
    },

    attention: function (visiteUrl, ele) {
      var _this = this;
      $.ajax({
        url: '/newhouse-web/garden/' + visiteUrl,
        data: {
          expandId: _this.refOpts.gardenId
        },
        type: 'post',
        success: function (data) {
          if (data.status === 'C0000') {
            if (visiteUrl === 'cancelAttention') {
              layer.msg('取消关注成功！');
              _this.$('.js-attention').text('添加至首页');
              ele.find('i').removeClass('icon-shoucang').addClass('icon-weishoucang');
            } else {
              window._hmt && window._hmt.push(['_trackEvent', '关注成功', 'click']);
              layer.msg('关注成功!');
              _this.$('.js-attention').text('已添加');
              ele.find('i').removeClass('icon-weishoucang').addClass('icon-shoucang');
            }
          }
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
          // layer.close(index); //如果设定了yes回调，需进行手工关闭
          // 马上绑定
          global.layer.close(index); // 如果设定了yes回调，需进行手工关闭
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
  events: {
    'click .share-shoucang': 'attentionHandle',
    'click .share-fenxiang': 'shareHandle',
    'click .report-ready': 'reportReadyHandle',
    'click .view-action': 'ViewAction'
  },
  handle: {
    attentionHandle: function (e) {
      var _this = this;
      // 判断有没有绑定 没绑定弹框 绑定继续报备 orgunitId有没有值 没有值就要提示绑定
      var uid = amplify.store.sessionStorage('uid');
      var infoMenu = null;
      if (uid) {
        infoMenu = amplify.store.sessionStorage('infoMenu_' + uid);
      }
      // infoMenu.orgunitId = undefined;
      if (!infoMenu.storeId) {
        _this.trigger('askBind');
        return;
      }

      var $ele = this.$(e.currentTarget);
      if ($ele.find('i.icon-shoucang').length) {
        this.trigger('attention', 'cancelAttention', $ele);
      } else {
        this.trigger('attention', 'attention', $ele);
      }
    },

    shareHandle: function (e) {
      var _this = this;
      if (!this.$(e.currentTarget).hasClass('disabled')) {
        $.when(this.directPromise).done(function () {
          if (_this.data.directList && _this.data.directList.length) {
            _this.$(e.currentTarget).addClass('disabled');
            directRoom.data = {
              list: _this.data.directList,
              gardenName: _this.$('#cusGardenName').textl()
            };
            var tip = layer.tips('<div id="directRoomTip"></div>', '.share-fenxiang', {
              tips: [3, '#fff'],
              area: ['590px', '500px'],
              time: 0,
              id: 'directRoom',
              end: function () {
                _this.$(e.currentTarget).removeClass('disabled');
              }
            });
            var d = coala.mount(directRoom, '#directRoomTip');
            d.tip = tip;
          } else {
            var layId = layer.tips('该楼盘暂无可分享的直推房源', '.share-fenxiang', {
              tips: [3, '#333']
            });
          }
        });
      }
    },

    reportReadyHandle: function (e) {
      var _this = this;
      // 判断有没有绑定 没绑定弹框 绑定继续报备 orgunitId有没有值 没有值就要提示绑定
      var uid = amplify.store.sessionStorage('uid');
      var infoMenu = null;
      if (uid) {
        infoMenu = amplify.store.sessionStorage('infoMenu_' + uid);
      }
      // infoMenu.orgunitId = undefined;
      if (!infoMenu.storeId) {
        _this.trigger('askBind');
        return;
      }
      $.ajax({
        type: 'POST',
        url: '/newhouse-web/garden/report/getPhoneFormats',
        dataType: 'json',
        data: { expandId: _this.refOpts.gardenId },
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


            var index = layer.open({
              type: 1,
              title: '报备',
              area: ['400px', '375px'],
              content: '<div id="reportDialogBox"></div>',
              scrollbar: false
            });
            var d = coala.mount(reportDialog, '#reportDialogBox');

            d.index = index;
            d.data.hName = _this.$('#cusGardenName').text();
            d.data.hid = _this.refOpts.gardenId;
            if (JSON.stringify(realData) !== '{}') {
              $.extend(d.data, realData);
            }
            d.trigger('render');
          } else {
            global.layer.msg(data.message);
          }
        },
        error: function (err) {
          global.layer.msg('err:' + err);
        }

      });
    },

    ViewAction: function (e) {
      var index = layer.open({
        type: 1,
        title: '佣金方案',
        area: ['600px', '260px'],
        content: '<div id="viewPrograms" class="view-programs"></div>'
      });
      var d = coala.mount(programs, '#viewPrograms');
      d.index = index;
      d.trigger('render', { id: this.refOpts.gardenId });
    }
  }
};
