var coala = require('coala');
var tpl = require('./index.html');
var privateDetail = require('./privateDetail');
var flowInfo = require('./flowInfo');
var tabItems = require('./tabItems');
var publicMixin = require('../publicMixin.js');
require('./index.css');

module.exports = {
  tpl: tpl,
  refs: {
    privateDetail: {
      component: privateDetail,
      el: '#privateDetail'
    },
    tabItems: {
      component: tabItems,
      el: '#viewTab'
    }
  },
  listen: {
    fetch: function(opts) {
      this.customerId = opts.customerId;
      this.id = opts.id;
      this.idArr = opts.idArr;
      this.phone = opts.phone;
      this.type = opts.type;
      this.typeDetail = opts.typeDetail;
      this.batch = opts.batch;
      this.refs.tabItems.trigger('showOrHide', this.type);
      this.refs.privateDetail.trigger('getPrivateDetail', { id: this.id, type: this.type, typeDetail: this.typeDetail, customerId: this.customerId, batch: this.batch });
      var type = $('.view-tab li.current').data('type');
      this.trigger(type, this.type, this.typeDetail, this.batch);
      this.trigger('getCount', this.phone);
    },
    getCount: function(phone) {
      //获取成交记录，带看记录，报备记录总条数
      $.ajax({
        url: '/newhouse-web/customer/basic/statistics',
        data: {
          phone: phone
        },
        success: function(data) {
          if (data.status === 'C0000') {
            $('.view-tab li[data-type="reservation"] span').text('(' + data.result.reservationCount + ')');
            $('.view-tab li[data-type="lead"] span').text('(' + data.result.guideCount + ')');
            // $('.view-tab li[data-type="deal"] span').text('(' + data.result.bargainCount + ')');
          }
        }
      });
    },
    flow: function(type, typeDetail, batch) {
      var _this = this;
      require.ensure([], function() {
        var flowInfo = require('./flowInfo');
        var flowModule = coala.mount(flowInfo, '#viewTableInfo');
        flowModule.trigger('getFlowInfo', {
          id: _this.id,
          type: type,
          batch: batch,
          customerId: _this.customerId,
          parent: _this.parent
        });
      });
    },
    lead: function(type) {
      var _this = this;
      require.ensure([], function() {
        var guidesInfo = require('./guidesInfo');
        var guidesModule = coala.mount(guidesInfo, '#viewTableInfo');
        guidesModule.trigger('getGuidesInfo', {
          phone: _this.phone,
          type: type
        });
      });
    },
    reservation: function(type) {
      var _this = this;
      require.ensure([], function() {
        var reservationInfo = require('./reservationsInfo');
        var reservationModule = coala.mount(reservationInfo, '#viewTableInfo');
        reservationModule.trigger('getReservationsInfo', {
          phone: _this.phone,
          type: type
        });
      });
    },
    deal: function(type) {
      var _this = this;
      require.ensure([], function() {
        var dealsInfo = require('./dealsInfo');
        var dealsModule = coala.mount(dealsInfo, '#viewTableInfo');
        dealsModule.trigger('getDealsInfo', {
          phone: _this.phone,
          type: type
        });
      });
    },
    changeContent: function(current, flag) {
      var _this = this;
      var prevEl = $('a[data-id="' + this.idArr[current] + '"]');
      if (!prevEl.length) {
        if (current > 0 && current < this.idArr.length - 1) {
          while (!prevEl.length) {
            var id = flag === 'prev' ? this.idArr[--current] : this.idArr[++current];
            if (!id) {
              layer.msg('已经是当前页可查看的' + (flag === 'prev' ? '第一条' : '最后一条') + '了!');
              break;
            }
            prevEl = $('a[data-id="' + id + '"]');
          }
        } else if (current === 0) {
          layer.msg('已经是当前页第一条了。');
        } else if (current === this.idArr.length - 1) {
          layer.msg('已经是当前页最后一条了。');
        }
      }

      if (prevEl.length) {
        var id = prevEl.data('id');
        var customerId = prevEl.data('customerId');
        var phone = prevEl.data('phone');
        var batch = prevEl.data('batch');
        prevEl.closest('tr').addClass('selected').siblings('tr').removeClass('selected');
        var checkPrivate = publicMixin.checkCommonPrivate({ id: id, type: this.type, self: this.parent });
        $.when(checkPrivate).done(function() {
          _this.trigger('fetch', {
            customerId: customerId,
            id: id,
            phone: phone,
            batch: batch,
            idArr: _this.idArr,
            type: _this.type,
            typeDetail: _this.typeDetail
          });
        }).fail(function() {
          var index = flag === 'prev' ? --current : ++current;
          _this.trigger('changeContent', index, flag);
        });
      }

    },
    disabledBtnAndPhone: function() {
      this.$('.js-change-private').removeClass('m-ybtn js-change-private').addClass('m-cbtn').off('click');
      this.$('.telphone strong').text('***********');
    }
  },
  events: {
    'click .js-prev': 'prevInfo',
    'click .js-next': 'nextInfo'
  },

  handle: {
    prevInfo: function(e, flag) {
      var index = $.inArray(this.id, this.idArr);
      var current = --index;
      if (current < 0) {
        layer.msg('已经是当前页第一条了。');
      } else {

        this.trigger('changeContent', current, 'prev');
      }
    },

    nextInfo: function(e, flag) {
      var index = $.inArray(this.id, this.idArr);
      var current = ++index;
      if (current > this.idArr.length - 1) {
        layer.msg('已经是当前页最后一条了。');
      } else {
        this.trigger('changeContent', current, 'next');
      }
    }
  }
}
