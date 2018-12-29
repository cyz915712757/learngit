var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');
var msgList = require('./msgList');

module.exports = {
  tpl: tpl,
  listen: {
    mount: function () {
      this.trigger('getRead');
    },
    // 获取是否有未读信息，有消息右上方有红点
    getRead: function () {
      var _this = this;
      $.ajax({
        type: 'GET',
        url: '/newhouse-web/index/notify/unreadCount',
        success: function (data) {
          if (data.status == 'C0000') {
            _this.data.unReadCount = data.result;
            _this.update();
          }
        }
      });
    }
  },
  events: {
    'click .js-msg': 'changeRead'
  },
  mixins: [{
    openMsg: function () {
      if (this.$('#msgList').length) {
        return;
      }
      var index = layer.open({
        type: 1,
        skin: 'system-open',
        shadeClose: true,
        area: ['580px', '486px'],
        title: '系统通知',
        content: '<div id="msgList"></div>'
      });
      var d = coala.mount(msgList, '#msgList');
    }
  }],
  handle: {
    changeRead: function (e) {
      // 更新未读为已读
      if (this.data.unReadCount) {
        var _this = this;
        $.ajax({
          type: 'GET',
          url: '/newhouse-web/index/notify/isRead',
          success: function (data) {
            if (data.status == 'C0000') {
              _this.data.unReadCount = 0;
              _this.update();
              _this.openMsg();
            }
          }
        });
      } else {
        this.openMsg();
      }
    }
  }
};
