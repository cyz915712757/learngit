var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');
var layer = require('components/layer');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    fetch: function(opts) {
      var _this = this;
      $.ajax({
        url: opts.url,
        data: {
          id: opts.id,
          dealEmployeeId: opts.dealEmployeeId ||''
        },
        success: function(data) {
          if (data.status === 'C0000') {
            var result = data.result;
            result.reservationTime = result.reservationTime.substring(0, 10);
            result.subscribeCreateDate = result.subscribeCreateDate.substring(0, 10);
            result.gardenName = result.gardenName.length < 12 ? result.gardenName : result.gardenName.substring(0, 12) + '...';

            var jsDetail = [];

            if (result.paidCommissionDetail.length) {
              $.each(result.paidCommissionDetail, function(index, el) {
                el.paidTime = el.paidTime.substring(0, 10);
                el.type = '佣金';
                jsDetail.push(el);
              });
            }

            if (result.paidCashDetail.length) {
              $.each(result.paidCashDetail, function(index, el) {
                el.paidTime = el.paidTime.substring(0, 10);
                el.type = '现金奖';
                jsDetail.push(el);
              });
            }
            result.jsDetail = jsDetail;
            _this.data = result;
            _this.update();
          }
        }
      });
    }
  },
  events: {
    'mouseenter .icon-wenhao': 'showMsg'
  },
  handle: {
    showMsg: function(e) {
      var $el = this.$(e.target);
      var $elNext = $el.next();
      var content = $elNext.html();
      var offset = this.$(e.target).offset();
      layer.tips(content, $(e.target), {
        id: 'dealDetail',
        tips: [3, '#fff'],
        time: 3000
      });
    }
  }
};
