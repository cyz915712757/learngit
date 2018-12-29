var coala = require('coala');

var config = require('config');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
var layer = require('components/layer');
var tpl = require('./index.html');
module.exports = {
  tpl: tpl,
  listen: {
    init: function () {
      var userConfig = amplify.store.sessionStorage('userConfig');
      //外联公司负责人是否有结佣的权限,1为案场配置有申请结佣的权限
      this.data.allow = 1;
      if (userConfig && userConfig.canApplicationForCommission && (userConfig.canApplicationForCommission.open === 'N')) {
        this.data.allow = 2;
      }
    },
    render: function (result) {
      this.data.applyCommission = result.applyCommission;
      this.data.applyPersonId = result.applyPersonId;
      this.data.applyPersonName = result.applyPersonName;
      this.data.companyId = result.companyId;
      this.data.domainName = result.domainName;
      this.update();
    },
  },

  events: {
    'click #applyPaidBtn.nopaid': 'applyNoPaidOpen',
    'click #applyPaidBtn.haspaid': 'applyDis'
  },

  handle: {
    applyNoPaidOpen: function () {
      layer.msg('暂无可申请结算的成交单');
    },
    applyDis: function (e) {
      var _this = this;
      var $el = this.$(e.target);
      var index = layer.open({
        type: 2,
        title: '申请分佣',
        area: [
          '800px', '580px'
        ],
        move: false,
        scrollbar: false,
        resize: false,
        content: '//' + _this.data.domainName + '/louxun-trade/xftSettlementBill/apply?applyPersonId=' + _this.data.applyPersonId + '&applyPersonName=' + _this.data.applyPersonName + '&companyId=' + _this.data.companyId,
        end: function () {
          _this.parent.trigger('getPaid');
          _this.parent.refs.comList.trigger('loadTb', _this.parent.queryParams);
        }
      });
    }
  }
};
