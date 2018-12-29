var coala = require('coala');
var config = require('config');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
var citySwitch = require('./citySwitch');
var systemMsg = require('./systemMsg');
var tpl = require('./index.html');
require('./index.css');
var infoMenu = null;
var selObj = null;
module.exports = {
  tpl: tpl,
  refs: {
    citySwitch: {
      component: citySwitch,
      el: '#citySwitch'
    },
    systemMsg: {
      component: systemMsg,
      el: '#systemMsg'
    }
  },
  listen: {
    init: function () {
      var uid = amplify.store.sessionStorage('uid');
      if (uid) {
        infoMenu = amplify.store.sessionStorage('infoMenu_' + uid);
        infoMenu && (this.data = infoMenu);
      }
    },

    mount: function () {
      if (!infoMenu) {
        this.trigger('getInfo');
      }
    },

    updated: function () {
      this.trigger('getPos');
      this.trigger('changePos');
      if (this.refOpts.isOpen) {
        this.$('.open-box').removeClass('dn');
      }
      if (this.refOpts.isHidden) {
        this.$('.js-nav-search').addClass('dn');
      }
      // 菜单高亮
      var pathname = location.pathname;

      if (pathname.indexOf('garden-detail') > -1) {
        this.$('#menu').find('li:eq(1)').addClass('cur');
      } else if (pathname === '/') {
        /* 首页 */
        this.$('#menu').find('li:eq(0)').addClass('cur');
      } else {
        this.$('#menu').find('a[href="' + pathname.substr(1, pathname.length - 1) + '"]').closest('li').addClass('cur');
      }
    },

    dropMenu: function (e) {
      var openEl = e.find('.open-box');
      openEl.slideUp(300);
    },

    openMenu: function (e) {
      var openEl = e.find('.open-box');
      if (openEl.is(':hidden')) {
        openEl.slideDown(300);
      }
    },
    /* 得到佣金 */
    getCommission: function (curPosName) {
      var _this = this;
      // 公司负责人需要判断外联内联
      var uid = amplify.store.sessionStorage('uid');
      infoMenu = null;

      var companyType = null;

      uid && (infoMenu = amplify.store.sessionStorage('infoMenu_' + uid));

      infoMenu && (companyType = infoMenu.companyType);

      if (curPosName === 'noPosition') {
        _this.trigger('setCommission');
        return;
      }

      if (companyType === 'OUTREACH' && curPosName === '公司负责人') {
        curPosName = '外联公司负责人';
      }
      // switch (curPosName) {
      // 经纪人
      // case '经纪人':
      // case '网销专员':
      // case '店长':
      // case '营销经理':
      // case '营销主管':
      // case '网销经理':
      // case '外联公司负责人':
      // {

      $.ajax({
        type: 'GET',
        url: '/newhouse-web/info/commission',
        success: function (data) {
          if (data.status === 'C0000') {
            _this.trigger('setCommission',
              '<span>' + (data.result.commission.total || 0) + '</span>元',
              '<span>' + (data.result.commission.paid || 0) + '</span>元');
          }
        }
      });
      //   }
      //   break;
      // default:
      //   _this.trigger('setCommission', '暂无数据', '暂无数据');
      //   break;
      // }
    },
    setCommission: function (str1, str2) {
      this.$('#money').prev('.js-load').addClass('dn');
      if (str1 && str2) {
        this.$('#totalCom').html(str1);
        this.$('#paidCom').html(str2);
        this.$('#money').removeClass('dn');
      } else {
        this.$('#money').after('<a id="bindStoreNumber" href="javascript:;">立即绑定</a>');
        this.$('#bindStoreNumber').off().on('click', function () {
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
        });
      }
    },
    /* 得到职位 */
    getPos: function (positionSend) {
      var _this = this;
      var position = amplify.store.sessionStorage('position');
      var positionVal = position;
      if (!position) {
        position = $.ajax({
          type: 'GET',
          data: positionSend,
          url: '/newhouse-web/info/positionList',
          success: function (data) {
            if (data.status === 'C0000') {
              // 没有erp 岗位， 模拟一个空的默认 经纪人岗位
              if (!data.result) {
                data.result = [{
                  isPrimary: '1',
                  orgId: '',
                  orgLongNumber: '',
                  orgName: '',
                  positionId: '',
                  positionName: 'noPosition',
                  storeId: 'null'
                }];
              }

              positionVal = data.result;

              amplify.store.sessionStorage('position', data.result);

              if (positionSend && _this.parent.stReload && _this.parent.stReload()) {
                location.reload();
              }
            }
          }
        });
      }
      $.when(position).done(function () {
        if (positionVal) {
          if (positionVal[0].positionName !== 'noPosition') {
            selObj = $('#jobBox').select({
              value: {
                positionId: positionVal[0].positionId,
                positionName: positionVal[0].orgName + positionVal[0].positionName
              },
              data: positionVal,
              idField: 'positionId',
              nameField: 'positionName',
              itemFormater: function (data) {
                return '<a href="javascript:;" title="' + data.positionName + '" data-id="' + data.positionId + '">' + data.orgName + data.positionName + '</a>';
              }
            });

            _this.$('#jobBox').removeClass('dn');
          } else {
            $('#jobBox').after('<p id="noBindStore">您暂未绑定分店</p>');
          }

          _this.$('#jobBox').prev('.js-load').addClass('dn');

          _this.curPosName = positionVal[0].positionName;

          _this.trigger('getCommission', _this.curPosName);
        }
      });
    },
    /* 切换岗位 */
    changePos: function () {
      var _this = this;
      this.$('#jobBox').on('bs.select.select', function (e, value, select) {
        var positionSend = {
          positionId: value.positionId
        };
        amplify.store.sessionStorage('position', null);
        _this.trigger('getPos', positionSend);
      });
    },
    /* 用户信息和菜单 */
    getInfo: function (e) {
      var _this = this;
      $.ajax({
        type: 'GET',
        url: '/newhouse-web/info/detail',
        dataType: 'json',
        success: function (data) {
          var item = data.result;
          if (data.status === 'C0000') {
            // 对员工管理公司负责人单独处理
            if (item.broker) {
              if ((item.broker.brokerPosition !== 'COMPANY_MANAGER' && item.broker.brokerPosition !== 'STORE_MANAGER') || item.broker.companyType !== 'OUTREACH') {
                if (item.menu && item.menu.length) {
                  for (var i = 0; i < item.menu.length; i++) {
                    if (item.menu[i].name === '员工管理') {
                      item.menu.splice(i, 1);
                      i--;
                    }
                  }
                }
              }
              if (item.broker.photoUrl && item.broker.photoUrl.indexOf('{size}') > -1) {
                item.broker.photoUrl = item.broker.photoUrl.replace('{size}', '130x130');
              }
              _this.data = item.broker;
              item.menu && (_this.data.menu = item.menu);
              amplify.store.sessionStorage('uid', item.broker.id);
              amplify.store.sessionStorage('infoMenu_' + item.broker.id, _this.data);
              amplify.store.sessionStorage('userConfig', item.config);
              amplify.store.sessionStorage('station', item.broker.brokerPositionDesc);
              amplify.store.sessionStorage('stationStoreNum', item.broker.storeNum);
              amplify.store.sessionStorage('stationStoreName', item.broker.txtStoreName);
              amplify.store.sessionStorage('stationStoreId', item.broker.storeId);
              amplify.store.sessionStorage('stationCompanyType', item.broker.companyType);
              _this.update();
            }
          }
        }
      });
    },

    exitLogin: function (e) {
      $.ajax({
        type: 'POST',
        url: '/newhouse-web/info/logout',
        dataType: 'json',
        success: function (data) {
          if (data.status == 'C0000') {
            amplify.store.sessionStorage('userInfo', null);
            var uid = amplify.store.sessionStorage('uid');
            if (uid) {
              amplify.store.sessionStorage('infoMenu_' + uid, null);
            }
            amplify.store.sessionStorage('area', null);
            amplify.store.sessionStorage('uid', null);
            amplify.store.sessionStorage('opencity', null);
            amplify.store.sessionStorage('position', null);
            amplify.store.sessionStorage('userConfig', null);
            amplify.store.sessionStorage('isrow', null);
            amplify.store.sessionStorage('isrowindex', null);
            amplify.store.sessionStorage('refer', null);
            amplify.store.sessionStorage('station', null);
            amplify.store.sessionStorage('stationCompanyType', null);
            amplify.store.sessionStorage('stationStoreName', null);
            amplify.store.sessionStorage('stationStoreId', null);
            location.href = 'login.html';
          }
        }
      });
    }
  },
  mixins: [{
    getKeyWord: function () {
      var keyWord = this.$('#keyWord').val();
      if (keyWord) {
        location.href = 'garden-management.html?keyWord=' + keyWord;
      }
    },
    setAvatar: function (imgUrl) {
      this.$('#avatar').attr('src', imgUrl);
    }

  }],
  events: {
    'mouseleave .js-open': 'dropMenuFun',
    // 'mouseleave .open-box': 'dropMenuFun',
    'mouseenter .js-open': 'openMenuFun',
    // 'mouseenter .open-box': 'addActive',
    'click .js-search': 'searchFun',
    'click #exitLogin': 'exitLoginFun',
    'keydown #keyWord': 'enterSearch'
  },

  handle: {
    exitLoginFun: function (e) {
      this.trigger('exitLogin');
    },
    dropMenuFun: function (e) {
      this.trigger('dropMenu', this.$(e.currentTarget));
    },

    openMenuFun: function (e) {
      this.trigger('openMenu', this.$(e.currentTarget));
    },
    enterSearch: function (e) {
      if (e.keyCode == 13) {
        this.getKeyWord();
      }
    },
    searchFun: function (e) {
      this.getKeyWord();
    }
  }
};
