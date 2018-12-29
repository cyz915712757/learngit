module.exports = {
  /* timestamp: it can be a real timestamp, or a value of Date type;
   *  fmt: 'yyyy-MM-dd hh:mm:ss' or 'MM-dd' or ...
   *  humanized: check the date is today or not
   */
  dateFormat: function (timestamp, fmt, humanized) {
    if (timestamp instanceof Date) {
      timestamp = timestamp.getTime();
    }

    if (timestamp != null) {
      var localTime = new Date(timestamp + (new Date(timestamp).getTimezoneOffset() - -480) * 60 * 1000);
      // get the date from client side, but it may not be the same as the date from server side

      var today = new Date();
      if (humanized) {
        if (new Date(localTime.getFullYear() + '/' + (localTime.getMonth() + 1) + '/' + localTime.getDate()).getTime() == new Date(today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate()).getTime()) {
          fmt = fmt.replace(/(y+-)?M+-d+/, '今日');
        }
      }

      var o = {
        'M+': localTime.getMonth() + 1,
        'd+': localTime.getDate(),
        'h+': localTime.getHours(),
        'm+': localTime.getMinutes(),
        's+': localTime.getSeconds()
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (localTime.getFullYear() + '').substr(4 - RegExp.$1.length));
      }

      for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
      }

      return fmt;
    }
    return '';
  },

  urlParse: function (url) {
    var pattern = /(\w+)=(\w+)/ig;
    var params = {};
    url.replace(pattern, function (a, b, c) {
      params[b] = c;
    });

    return params;
  },
  dateOp: function (nd, days, showType) {
    if (days) {
      nd -= (days - 1) * 24 * 60 * 60 * 1000;
    }
    nd = new Date(nd);
    var y = nd.getFullYear();
    var m = nd.getMonth() + 1;
    var d = nd.getDate();
    var h = nd.getHours();
    var i = nd.getMinutes();
    var s = nd.getSeconds();
    if (m <= 9) m = '0' + m;
    if (d <= 9) d = '0' + d;
    var cdate = y + '-' + m + '-' + d;
    if (showType) {
      // 显示时分秒
      if (h <= 9) h = '0' + h;
      if (i <= 9) i = '0' + i;
      if (s <= 9) s = '0' + s;
      cdate += ' ' + h + ':' + i + ':' + s;
    }
    return cdate;
  },
  // 获取AddDayCount天后的日期
  getDateStr: function (AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;// 获取当前月份的日期
    var d = dd.getDate();
    return y + '-' + m + '-' + d;
  },
  formatDate: function (datetimeStr, type) {
    var timeResult = datetimeStr.split(' ');
    var timeStr = timeResult[0].split('-');
    var year = timeStr[0];
    var month = timeStr[1];
    var day = timeStr[2];
    var time = '';
    if (timeResult[1]) {
      time = timeResult[1].split(':')[0] + ':' + timeResult[1].split(':')[1];
    }
    var nowYear = new Date().getFullYear();
    var nowMonth = new Date().getMonth() + 1;
    var nowDay = new Date().getDate();

    if (+year === nowYear && +month === nowMonth && +day === nowDay) {
      return '今天 ' + (type ? time : '');
    } else if (+year === nowYear && +month === nowMonth && +day === (nowDay - 1)) {
      return '昨天 ' + (type ? time : '');
    } else if (+year === nowYear) {
      return month + '月' + day + '日 ' + (type ? time : '');
    }
    return +year + '-' + month + '-' + day;

    // return datetimeStr;
  },
  daysBetween: function (dateOne, dateTwo) {
    var oneMonth = dateOne.substring(5, dateOne.lastIndexOf('-'));
    var oneDay = dateOne.substring(dateOne.length, dateOne.lastIndexOf('-') + 1);
    var oneYear = dateOne.substring(0, dateOne.indexOf('-'));
    var twoMonth = dateTwo.substring(5, dateTwo.lastIndexOf('-'));
    var twoDay = dateTwo.substring(dateTwo.length, dateTwo.lastIndexOf('-') + 1);
    var twoYear = dateTwo.substring(0, dateTwo.indexOf('-'));
    var between = ((Date.parse(oneMonth + '/' + oneDay + '/' + oneYear) - Date.parse(twoMonth + '/' + twoDay + '/' + twoYear)) / 86400000);
    return Math.abs(between);
  }
};
