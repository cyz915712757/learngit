var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function() {
      this.trigger('getDistributionRule');
    },
    updated: function() {
      //add tab switch
      $(document).on('click', '.distribution li', function() {
        var index = $(this).index();
        $(this).attr('class', "current").siblings('li').removeClass('current');
        $('.distribution-item').eq(index).show().siblings('.distribution-item').hide();
      });
    },
    getDistributionRule: function() {
      var _this = this;
      $.ajax({
        url: '/newhouse-web/garden/distributionRule',
        data: {
          expandId: _this.refOpts.gardenId
        },
        type: 'get',
        success: function(data) {
          if (data.status === 'C0000') {
            _this.data = data.result;
            _this.data.contacters = data.result.customerReferral.contacters;
            _this.data.reserveAttention = data.result.customerReferral.reserveAttention;
            _this.data.protectionPeriod = data.result.customerReferral.protectionPeriod;
            _this.data.commissionRemark = data.result.commissionRemark.replace(/\r\n/g, '<br/>');
            _this.data.lookProcess = data.result.lookProcess.replace(/\r\n/g, '<br/>');
            _this.data.callWords = data.result.callWords.replace(/\r\n/g, '<br/>');
            if (_this.data.promotes) {
              for (var i = 0; i < _this.data.promotes.length; i++) {
                _this.data.promotes[i] = _this.data.promotes[i].replace(/\r\n/g, '<br/>');
              }
            }
            _this.update();
          }
        }
      });
    }
  }
};
