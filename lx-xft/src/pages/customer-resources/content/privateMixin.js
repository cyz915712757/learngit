module.exports = {
  privateIntention: function(item) {
    var str = '';
    //请勿修改顺序(根据城市/区/街道/楼盘名称/....) eg: 北京/朝阳/奥运村/正中时代广场/1平米/12万/三房
    item.intentionCityName && (str += item.intentionCityName);
    item.intentionCountyName && (str += '/' + item.intentionCountyName);
    item.intentionAreaName && (str += '/' + item.intentionAreaName);
    item.intentionGardenName && (str += (str ? '/' : '') + item.intentionGardenName);

    if (item.minArea && item.maxArea === 0) {
      str += (str ? '/' : '') + item.minArea + '平米';
    } else if (item.minArea === 0 && item.maxArea) {
      str += (str ? '/' : '') + item.maxArea + '平米';
    } else if (item.minArea && item.maxArea) {
      str += (str ? '/' : '') + item.minArea + '-' + item.maxArea + '平米';
    }

    item.minPrice = item.minPrice / 10000;
    item.maxPrice = item.maxPrice / 10000;

    if (item.minPrice && item.maxPrice === 0) {
      str += (str ? '/' : '') + item.minPrice + '万';
    } else if (item.minPrice === 0 && item.maxPrice) {
      str += (str ? '/' : '') + item.maxPrice + '万';
    } else if (item.minPrice && item.maxPrice) {
      str += (str ? '/' : '') + item.minPrice + '-' + item.maxPrice + '万';
    }

    item.layout && (str += (str ? '/' : '') + item.layout);
    return str;
  }
};
