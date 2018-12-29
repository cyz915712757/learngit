var tpl = require('./index.html');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
module.exports = {
  tpl: tpl,
  listen: {
    mount: function() {
      var _this = this;
      $(document).off('click.viewCustomer').on('click.viewCustomer', '.view-tab li', function() {
        var index = $(this).index();
        $(this).addClass('current').siblings('li').removeClass('current');
        var typeTab = $(this).data('type');
        _this.parent.trigger(typeTab, _this.parent.type);
      });
    },
    showOrHide: function(type) {
      var _this=this;
      var userConfig = amplify.store.sessionStorage('userConfig');
      if (userConfig && userConfig.customerReservationList&& (userConfig.customerReservationList.open==='Y')) {
        this.data.crl = true;
      }
      if (userConfig && userConfig.customerGuideList&& (userConfig.customerGuideList.open==='Y')) {
        this.data.cgl = true;
      }
      if (userConfig && userConfig.customerDealList&& (userConfig.customerDealList.open==='Y')) {
        this.data.cdl = true;
      }
      this.data.type = type;
       switch (type) {
          case 'private':
           _this.data.typeName="私客";
            break;
          case 'eprivate':
            _this.data.typeName="员工私客";
            break;
          case 'public':
             _this.data.typeName="公客";
            break;
          case 'resources':
             _this.data.typeName="资源客";
            break;
        }
      this.update();
    }
  }
}
