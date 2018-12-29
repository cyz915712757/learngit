var coala = require('coala');
var config = require('config');
var layer = require('components/layer');
var utils = require('../../utils');
var tpl = require('./index.html');
require('./index.css');

module.exports = {
  tpl: tpl,
  data: {
    phoneType: 'ML' // HK: hongkong ML: mainland
  },
  listen: {
    mount: function () {
      // 初始化日期
      this.trigger('initDatePicker');
    },
    render: function () {
      var _this = this;

      _this.update();
    },


    updated: function () {
      if (!this.data.hName) {
        this.trigger('hNameSel');
      }

      if (this.data.FPhoneFormatHK && !this.data.phone) {
        this.trigger('hPhoneEl');
      }

      // 初始化日期
      this.trigger('initDatePicker');
      $('#reportSub').removeClass('disable');
    },

    hNameSel: function () {
      var _this = this;
      this.hNameSel = this.$('#hName').select({
        url: '/newhouse-web/garden/queryGarden',
        keyword: 'keyword',
        width: 335,
        rows: 7,
        dataFormater: function (data) {
          return data.result;
        },
        search: true,
        placeholder: '楼盘'
      });

      /* $('#hName').find('input').on('input', function(e) {
         var val = $.trim(this.value);

         var list = _this.hNameSel.data;
         _this.hid = null;
         for (var i = list.length - 1; i >= 0; i--) {
           if (val === list[i].name) {
             _this.hid = list[i].id;
           }
         }
         console.log(_this.hid);
       }); */

      this.$('#hName').on('bs.select.select', function (e, value, select) {
        _this.hid = value.id;
      });
      this.$('#hName').on('bs.select.clear', function (e, value, select) {
        _this.hid = null;
      });
    },

    hPhoneEl: function () {
      var phoneCount = 11;
      var hidePhone = this.data.Fphoneformat;

      if (this.data.phoneType === 'HK') {
        hidePhone = this.data.FPhoneFormatHK;
        phoneCount = 13;
      }

      var hideArr = hidePhone.match(/0+/) || [''];
      var firstPlaceholder = '';
      if (!hideArr[0]) { // 不用隐藏
        hideArr.index = phoneCount;
      }

      var hideCount = hideArr[0].length;
      var hidePosition = hideArr.index;
      firstPlaceholder = hidePosition === phoneCount ? '请输入' + hidePosition + '位客户手机号码' : '前' + hidePosition + '位';
      var html = '<input type="input" class="form-control js-frm" id="phoneFirst" data-type="securePhone"  maxlength="' + hidePosition + '"  placeholder="' + firstPlaceholder + '">';

      if (hidePosition > 0 && hidePosition !== phoneCount) {
        html += '<span id="starDom">' + (new Array(hideCount + 1)).join('*') + '</span>';
      }

      if (hidePosition > 0 && hideCount + hidePosition !== phoneCount) {
        html += '<input type="input" class="form-control js-frm"  id="phoneSecond" data-type="securePhone" maxlength="' + (phoneCount - hideCount - hidePosition) + '"  placeholder="后' + (phoneCount - hideCount - hidePosition) + '位">';
      }

      $('#phoneWrapper').empty().append(html);
    },
    // 初始化日期
    initDatePicker: function () {
      var _this = this;
      var dateOpt = {
        format: 'yyyy-mm-dd hh:ii',
        minView: 0,
        startDate: new Date(),
        endDate: utils.getDateStr(1) + ' 23:59:59'
      };
      this.visitDatePicker = $('#visitDate').datetimepicker(dateOpt)
        .on('hide', function (e) {
          this.blur();
        })
        .on('changeDate', function (ev) {
          _this.appointmentTime = utils.dateOp(ev.date, null, true).substring(0, 16) + ':00';
        })
        .on('outOfRange', function () {
          layer.msg('日期超出选择范围！', { time: 500 });
        });

      this.visitDatePicker.siblings('.js-dicon').on('click', function () {
        _this.visitDatePicker.datetimepicker('show');
      });

      this.visitDatePicker.siblings('.js-reset').on('click', function () {
        _this.visitDatePicker.datetimepicker('hide');
        _this.appointmentTime = '';
        $('#visitDate').val('');
      });
    }
  },
  events: {
    'click .js-cancel': 'cancelFun',
    'click #reportSub:not(.disable)': 'reportSubFun',
    'blur .js-frm': 'blurFun',
    'click #togglePhone': 'togglePhoneFun'
  },
  mixins: [{
    validInfo: function (elms) {
      var _this = this;
      var msg = '';
      var $msg = $('<p class="error-tip"><i class="iconfont icon-baocuo2"></i></p>');
      this.$('.error-tip').remove();
      var flag = true;
      $.each(elms, function (index, $el) {
        var val = $.trim($el.val());
        var type = $el.data('type');

        if (type === 'hname') {
          if (!_this.hid) {
            msg = '请选择楼盘';
            $el.parent().append($msg.append(msg));
            flag = false;
            return false;
          }
        }
        if (type === 'pname') {
          if (!val.length) {
            msg = '请输入客户姓名';
            $el.parent().append($msg.append(msg));
            // $el.focus();
            flag = false;
            return false;
          }
          if (val.length > 10) {
            msg = '请输入正确的客户姓名';
            $el.parent().append($msg.append(msg));
            // $el.focus();
            flag = false;
            return false;
          }
        }
        if (type === 'phone') {
          if (!val.length) {
            msg = '请输入客户手机号码';
            $el.parent().append($msg.append(msg));
            // $el.focus();
            flag = false;
            return false;
          }
          if (!(/^(\d{8}|\d{11})$/).test(val)) {
            msg = '请输入正确的手机号码';
            $el.parent().append($msg.append(msg));
            // $el.focus();
            flag = false;
            return false;
          }
        }
        if (type === 'securePhone') { // 这个类型的校验,placeholder中必须包含要校验的号码位数
          val = $.trim($el.val());
          if (!val.length) {
            msg = '请输入客户手机号码';
            $el.closest('.phone-container').append($msg.append(msg));
            // $el.focus();
            flag = false;
            return false;
          }
          if (
            !(
              (/^\d+$/).test(val) && val.length === +$el.attr('placeholder').match(/\d+/g)[0]
            )
          ) {
            msg = '请输入正确的手机号码';
            $el.closest('.phone-container').append($msg.append(msg));
            // $el.focus();
            flag = false;
            return false;
          }
        }
      });
      return flag;
    }
  }],
  handle: {
    blurFun: function (e) {
      var $el = this.$(e.currentTarget);
      this.validInfo([$el]);
    },
    togglePhoneFun: function (e) {
      this.data.phoneType = this.data.phoneType === 'ML' ? 'HK' : 'ML';

      var btnText = this.data.phoneType === 'ML' ? '港澳号码' : '大陆号码';
      var tipText = this.data.phoneType === 'ML' ? '大陆' : '港澳';
      var $el = $(e.currentTarget);
      $el.text('切换为' + btnText);
      $('#togglePhone').siblings('span').text('客户号码（' + tipText + '）：');
      this.trigger('hPhoneEl');
    },

    cancelFun: function (e) {
      layer.close(this.index);
    },

    reportSubFun: function (e) {
      var _this = this;
      var tagEl = this.$(e.currentTarget);

      var personName = $.trim($('#personName').val());
      var phone = $.trim($('#phone').val());

      var hName = $.trim($('#hName').val());
      var result;

      // /*匹配house id*/
      // var list = _this.hNameSel.data;

      // for (var i = list.length - 1; i >= 0; i--) {
      //   if (val === list[i].name) {
      //     _this.hid = list[i].id;
      //   }
      // }

      if (!this.data.hName) {
        var hid = _this.hid;
        result = this.validInfo([$('#hName'), $('#personName')]);
      } else {
        var hid = this.$('#hName').data('id');
        result = this.validInfo([$('#personName')]);
      }

      if (this.data.FPhoneFormatHK && !this.data.phone) {
        var phonePartCount = $('#phoneWrapper').children().length;
        phone = $.trim($('#phoneFirst').val());
        if (phonePartCount === 1) {
          result = this.validInfo([$('#phoneFirst')]);
        }
        if (phonePartCount === 2) {
          result = this.validInfo([$('#phoneFirst')]);
          phone += $('#starDom').text();
        }
        if (phonePartCount === 3) {
          result = this.validInfo([$('#phoneFirst'), $('#phoneSecond')]);
          phone += $('#starDom').text() + $.trim($('#phoneSecond').val());
        }
      } else {
        result = this.validInfo([$('#phone')]);
      }


      var sendObj = {
        customerName: personName,
        mobileNo: phone,
        id: hid,
        appointmentTime: this.appointmentTime
      };
      console.log(sendObj, '报备发送', result);
      if (result) {
        $.ajax({
          type: 'POST',
          url: '/newhouse-web/garden/report',
          dataType: 'json',
          data: sendObj,
          beforeSend: function () {
            tagEl.addClass('disable');
          },
          success: function (data) {
            if (data.status === 'C0000') {
              tagEl.addClass('disable');
              layer.msg('报备提交成功!');
              window._hmt && window._hmt.push(['_trackEvent', '报备提交成功', 'click']);
              setTimeout(function () {
                layer.close(_this.index);
              }, 2000);
            } else {
              layer.msg(data.message);
              setTimeout(function () {
                layer.close(_this.index);
              }, 2000);
              tagEl.removeClass('disable');
            }
          }

        });
      }
    }

  }

};
