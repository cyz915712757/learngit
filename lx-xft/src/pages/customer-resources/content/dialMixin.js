module.exports = {

  getDialCount: function (phone) {
    $.ajax({
      url: '/newhouse-web/customer/dial/getDialSumToday',
      data: {
        callee: phone
      },
      success: function (data) {
        if (data.status === 'C0000' && data.result >= 5) {
          layer.msg('今日该客户已被拨打5次');
        }
      }
    });
  },
  didDialCount: function (phone) {
    $.ajax({
      url: '/newhouse-web/customer/dial/dialCount',
      data: {
        callee: phone
      },
      type: 'post'
    });
  },
  getCallStatus(opts, that, index) {
    var timer = '';
    var flag = true;
    opts.callTimer && clearInterval(opts.callTimer);
    timer = setInterval(function () {
      $.ajax({
        url: '/newhouse-web/customer/dial/getCallStatus',
        data: {
          callId: opts.id
        },
        success: function (re) {
          var endStatus = {
            CALLEE_HANGUP: true,
            CALLEE_BUSY: true,
            CALLEE_REFUSE: true,
            CALLEE_NOANSWER: true,
            CALLEE_NULL: true,
            CALLEE_FAIL: true,
            CALLEE_STOP: true,
            FORWARD: true
          };
          if (re.status === 'C0000' && re.result && re.result.calleeAnswer && flag) {
            flag = false;
            // then.didDialCount(opts.phone);
          } else if (re.result && endStatus[re.result.state]) {
            clearInterval(timer);
            layer.msg('电话未接通，请及时填写跟进信息');
            layer.close(index);
          } else if (re.result && re.result.state === 'END') {
            clearInterval(timer);
            layer.msg('通话结束，请及时填写跟进信息');
            layer.close(index);
          } else if (re.result && re.result.state === 'CALLER_HANGUP') {
            clearInterval(timer);
            layer.msg('主叫挂断电话');
            layer.close(index);
          }
        }
      });
    }, 1000);
    that.data.timer = timer;
  },

  openDial: function (phone, that, dialType, Dial) {
    var _this = that;
    var then = this;
    var index = layer.open({
      type: 1,
      shadeClose: true,
      area: ['400px', '160px'],
      closeBtn: 0,
      shadeClose: false,
      title: '',
      content: '<div class="dial-phone-wrapper">' +
        '<div class="dial-phone-status"><i class="iconfont icon-bohao"></i>正在拨号至小号平台...</div>' +
        '<div class="dial-phone-msg">正在为您拨通客户电话</div><a class="dial-end js-end" href="javascript:;">结束通话</a></div>',
      success: function (layero, i) {
        $.when($.ajax({
          url: '/newhouse-web/customer/dial/call',
          data: {
            callee: phone
          },
          type: 'post'
        })).done(function (data) {
          if (data.status === 'C0000') {
            var callTimer = '';
            if (dialType !== '直拨') {
              // 双呼方式，不用调用callId
              var opts = {
                id: data.result.callId,
                phone: phone
              };
              then.getCallStatus(opts, _this, index);
            } else {
              Dial.call(null, data.result.callerDisplay);
              callTimer = setInterval(function () {
                $.when($.ajax({
                  url: '/newhouse-web/customer/dial/getCallId',
                  data: {
                    id: data.result.id
                  }
                })).done(function (res) {
                  if (res.status === 'C0000' && res.result && res.result.callId) {
                    var opts = {
                      callTimer: callTimer,
                      id: res.result.callId,
                      phone: phone
                    };
                    then.getCallStatus(opts, _this, index);
                  }
                });
              }, 1000);
            }

            $(document).on('click', '.js-end', function () {
              var timer = _this.data.timer;
              callTimer && clearInterval(callTimer);
              timer && clearInterval(timer);
              Dial.hangup();
              layer.close(i);
            });
          }
        });
      }
    });
  }

};
