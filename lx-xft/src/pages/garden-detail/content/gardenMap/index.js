var tpl = require('./index.html');
require('./index.css');

var gardenId = null;

window.initMap = function() {
  gardenId = getParam('gid');
  getMap(gardenId);
};

function getParam(p) {
  var reg = new RegExp('(^|&)' + p + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  return r ? decodeURI(r[2]) : null;
}

function getMap(gardenId, type) {
  var type = type || 'BUS';
  $.ajax({
    url: '/newhouse-web/garden/gardenMap',
    type: 'get',
    data: {
      expandId: gardenId,
      type: type
    },
    success: function(data) {
      if (data.status === 'C0000') {
        generateMap(data.result, type);
      }
    }
  });
}

//如果是香港楼盘，转换地图坐标
// function parsePoint(opts) {
//   var url = 'http://api.map.baidu.com/geoconv/v1/?coords=' + opts.lat + ',' + opts.lng + '&from=3&to=5&ak=54GOhD0enjiUHZG47A1EozPH';

//   $.ajax({
//     url: url,
//     async: false,
//     success: function(data) {
//       console.log(data);
//     }
//   });
// };

function generateMap(result, type) {
  //初始化地图
  var map = new BMap.Map('mapContainer');
  var point = new BMap.Point(result.lat, result.lng);
  map.centerAndZoom(point, 15);
  var top_left_navigation = new BMap.NavigationControl();  //左上角，添加默认缩放平移控件
  map.addControl(top_left_navigation);
  //绘制楼盘名称
  addMarker(map, point, '<div class="garden-name">' + result.gardenName + '<i class="down-arrow"></i></div>');

  //绘制1km
  // var pointD = new BMap.Point(result.lat, result.lng);
  // addMarker(map, pointD, '<div class="garden-distance">1km</div>');

  //绘制圆
  var circle = new BMap.Circle(point, 1000, {
    strokeWeight: 2,
    fillOpacity: 0.3
  });
  map.addOverlay(circle);

  var typeName = {
    BUS: '公交站',
    METRO: '地铁站',
    EDUCATION: '教育机构',
    MEDICAL: '医疗设施',
    BUSINESS_SUPER: '商场超市',
    BANK: '银行',
    FOOD_BEVERAGE: '餐饮'
  };

  if (!$.isEmptyObject(result.datas)) {
    var str = '';
    var typeDetailName = {
      // BUS: '公交站',
      // METRO: '地铁站',
      KINDERGARTEN: '幼儿园',
      PRIMARY_SCHOOL: '小学',
      JUNIOR_SCHOOL: '中学',
      HIGH_SCHOOL: '高中',
      HOSPITAL: '医院',
      PHARMACY: '药店',
      BANK: '银行',
      ATM: 'ATM',
      SUPERMARKET: '超市',
      MALL: '商场',
      CONVENIENCE_STORE: '便利店',
      RESTAURANT: '餐馆'
    };
    var j = 0;
    for (var obj in result.datas) {

      if(typeDetailName[obj]){
        str += '<li><p class="type-name">' + typeDetailName[obj] + '</p></li>';
      }else{
        str+='';
      }

      var items = result.datas[obj];
      for (var i = 0; i < items.length; i++) {
        j++;
        var pointItems = new BMap.Point(items[i].lng, items[i].lat);
        var tpl = '<a class="garden-item-marker" data-point="' + pointItems.lng + '-' + pointItems.lat + '" data-id="' + items[i].poiUid + '" style="position:absolute" href="javascript:;"><i class="iconfont icon-dingwei"></i><span class="garden-num" data-num="' + j + '">' + (j) + '</span></a>';
        addMarker(map, pointItems, tpl);
        str += '<li class="map-result-item" data-id="' + items[i].poiUid + '"><p class="bus-info clearfix"><span class="bus-index" data-bus-index="' + j + '">' + (j) + '</span><i class="iconfont icon-dingwei"></i><span class="bus-name ellips">' + items[i].name + '</span><span class="bus-distance">' + (items[i].distance.toFixed(2)) * 1000 + '米</span</p><p class="bus-line">' + items[i].address + '</p></li>';
      }
    }

    this.$('.map-result-detail').empty().append(str);
  } else {
    this.$('.map-result-detail').empty().append('<li class="empty-data">对不起，暂无数据。</li>');
  }

  this.$('.map-title').text(typeName[type]);
}

function addMarker(map, point, tpl) {
  var marker = new BMap.Overlay();
  marker.initialize = function() {
    var div = this._div = $(tpl)[0];
    div.style.zIndex = BMap.Overlay.getZIndex(point.lat);
    map.getPanes().labelPane.appendChild(div);
    return div;
  };

  marker.draw = function() {
    var pixel = map.pointToOverlayPixel(point);
    $(this._div).css({ left: pixel.x - 10, top: pixel.y - 30 });
  };

  map.addOverlay(marker);
}

//切换高亮色和鼠标样式
function switchCurrent(ele) {
  ele.find('i').addClass('marker-highlight').end()
    .siblings().find('i').removeClass('marker-highlight').end()
    .siblings().removeClass('bus-item-current').end().addClass('bus-item-current');
}

//给标注添加index
function addIndex(ele) {
  var zIndex = +(ele.parent().data('cusindex')) || 0;
  if (zIndex) {
    zIndex = zIndex + 1;
    ele.css('zIndex', zIndex);
    ele.parent().data('cusindex', zIndex);
  } else {
    ele.css('zIndex', zIndex + 1);
    ele.parent().data('cusindex', zIndex + 1);
  }
}

//切换类型重新绘制地图
$(document).on('click', '.map-type', function() {
  $('.map-result-detail').animate({ scrollTop: 0 }, 200);
  $(this).parent().addClass('current').end().parent().siblings().removeClass('current');
  var type = $(this).data('type');
  getMap(gardenId, type);
});

//点击地图marker同时标示右侧
$(document).on('click', '.garden-item-marker', function(e) {
  var index = $(e.currentTarget).find('.garden-num').text();
  var $el = $('.map-result-item').find('.bus-index[data-bus-index="' + index + '"]').parent().parent();
  switchCurrent($el);
  switchCurrent($(e.currentTarget));
  addIndex($(this));
  var $map = $('.map-result-detail');
  var scrollTop = $map.scrollTop() + $el.position().top;
  $map.animate({ scrollTop: scrollTop }, 800);
});

//点击地图右侧同时标注地图marker
$(document).on('click', '.map-result-item', function() {
  var index = $(this).find('.bus-index').text();
  var $el = $('.garden-item-marker').find('.garden-num[data-num="' + index + '"]').parent();
  addIndex($el);
  switchCurrent($el);
  switchCurrent($(this));
});

module.exports = {
  tpl: tpl,
  listen: {
    mount: function() {
      this.el.append('<script src="http://api.map.baidu.com/api?v=2.0&ak=54GOhD0enjiUHZG47A1EozPH&callback=initMap"></script>');
    }
  }
};
