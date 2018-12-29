var config = require('config');
var coala = require('coala');
var invalidSession = false;
require('vendors/qui/css/bootstrap.min.css');
require('vendors/iconfont/iconfont.css');
require('vendors/qui/js/bootstrap');
require('css/base.css');
require('./analytics');
// setup the default parameter for all of the ajax requests
$.ajaxSetup({
  cache: false,
  xhrFields: {
    withCredentials: true
  }
});

$(document).on('ajaxBeforeSend', function (e, xhr) {
  var userInfo = amplify.store.sessionStorage('userInfo');
  if (userInfo) {
    xhr.setRequestHeader('sid', userInfo.sessionId);
  }

});

// whenever an ajax request completes with an error, check the xhr status;
$(document).off('ajaxError').on('ajaxError', function (res, xhr) {
  if (xhr.status == 0) {
    return;
  } else if (xhr.status == 401 && !invalidSession) {
    invalidSession = !0;
    location.href = 'login.html';
  } else if (xhr.status == 403) {
    location.href = '403.html';
  } else if (xhr.status == 499) {
    //客源管理外网以及开关页面权限
    location.href = '499.html';
  }
});

// abort the all the ajax requests when the session is expired.
$.ajaxPrefilter(function (options, originalOptions, xhr) {
  if (invalidSession) {
    xhr.abort();
  } else if (options.robot) {
    xhr.setRequestHeader('X-Robot', true);
  } else if (options.loading) {
    //options.layerId = layer.msg('加载中...', {icon: 16});
  }
});

$(document).off('ajaxComplete').on('ajaxComplete', function (e, req, options) {
  if (options.loading) {
    //layer.close(options.layerId);
  }
});

// 被嵌入于其它系统中时，以 window.open 方式打开楼盘详情页
if (top !== window) {
  $(document).on('click', '[data-track=楼盘详情],[data-track=推荐楼盘]', function (e) {
    var newWindow = window.open(e.currentTarget.href, '_blank', 'width=' + screen.availWidth + 10 + ',height=' + screen.availHeight + 10 + ',toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no');
    newWindow.moveTo(-3, -3);
    newWindow.resizeTo(screen.availWidth + 10, screen.availHeight + 10);
    newWindow.focus();
    return false;
  });
}
