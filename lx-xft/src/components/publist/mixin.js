var coala = require('coala');
var config = require('config');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
var layer = require('components/layer');
var reportDialog = require('components/reportDialog');
// 重置数据
function transformData(items, params) {
  var size = '350x260';
  $.each(items, function (index, obj) {
    if (obj.pictureUrl.indexOf('{size}') > -1) {
      obj.pictureUrl = obj.pictureUrl.replace('{size}', size);
    }
    if (params && params.keyword) {
      var re = new RegExp(params.keyword, 'g');
      obj.originalName = obj.name;
      obj.originalAddress = obj.address;
      obj.name = obj.name.replace(re, '<span class="c-f91">' + params.keyword + '</span>');
      obj.address = obj.address.replace(re, '<span class="c-f91">' + params.keyword + '</span>');
    }
  });
}
module.exports = {
  _setPos: function () {
    var _this = this;
    var curPosName = null;
    var userConfig = amplify.store.sessionStorage('userConfig');
    var position = amplify.store.sessionStorage('position');
    if (position) {
      curPosName = position[0].positionName;
    }
    var pos = 1;

    // 公司负责人需要判断外联内联
    var uid = amplify.store.sessionStorage('uid');
    var infoMenu = null;
    var companyType = null;
    uid && (infoMenu = amplify.store.sessionStorage('infoMenu_' + uid));
    infoMenu && (companyType = infoMenu.companyType);

    switch (curPosName) {
      case '公司负责人':
        {
          pos = 2;
          if (companyType == 'OUTREACH') {
            if (userConfig && userConfig.companyReport && (userConfig.companyReport.open === 'Y')) {
              pos = 1;
            }
          }
        }
        break;
      case '营销总监':
      case '城市副总经理':
      case '城市总经理':
        pos = 2;
        break;
      case '店长':
      case '营销经理':
      case '营销主管':
      case '网销经理':
        {
          pos = 1;
          if (userConfig && userConfig.storeReport && (userConfig.storeReport.open === 'N')) {
            pos = 2;
          }
        }
        break;
      default:
        pos = 1;
        break;
    }
    return pos;
  },
  _getMain: function (params, cb) {
    // console.log(params);
    var _this = this;
    var ajaxUrl = 'index/mainGarden';
    var results = 'gardenList';
    if (params && params.flag === 'gm') {
      ajaxUrl = 'garden/list';
      results = 'list';
    }
    $.ajax({
      type: 'GET',
      url: '/newhouse-web/' + ajaxUrl,
      dataType: 'json',
      data: params && params.sendData,
      success: function (data) {
        var item = data.result;
        if (data.status === 'C0000') {
          var pageParam = {
            currentPage: item.currentPage,
            pageCount: item.pageCount,
            pageSize: item.pageSize,
            totalCount: item.totalCount
          };
          $('#allCount').text(item.totalCount || 0);
          if (item[results]) {
            transformData(item[results], params);
          }
          cb(item[results], item.others, pageParam);
        }
      }
    });
  },
  $openReport: function (e, hidePhoneTypeObj) {
    var index = layer.open({
      type: 1,
      shadeClose: true,
      area: ['400px', '375px'],
      title: '报备',
      content: '<div id="reportDialogbox"></div>',
      scrollbar: false
    });
    var d = coala.mount(reportDialog, '#reportDialogbox');

    d.index = index;
    var hNameBox = e.closest('li').find('.h-name');
    var hname = hNameBox.text();
    var hid = hNameBox.data('id');
    d.data.hName = hname;
    d.data.hid = hid;
    if (JSON.stringify(hidePhoneTypeObj) !== '{}') {
      $.extend(d.data, hidePhoneTypeObj);
    }
    d.trigger('render');
  }
};
