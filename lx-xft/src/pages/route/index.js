var common = require('common');
var coala = require('coala');
var amplify = require('vendors/amplify/amplify.store.min').amplify;
var tpl = require('./index.html');
coala.mount($.extend(true, common, {
  tpl: tpl,
  listen: {
    updated: function() {
      // userName,password,broker
      /*参考链接http://localhost:80/route.html?query=012233*/
      var encryptedData = this.getQuery('query');
      var userName = this.getQuery('userName');
      var password = this.getQuery('password');
      var broker = this.getQuery('broker');
      var userInfo = { encryptedData: encryptedData, userName: userName, password: password, broker: broker };
      //console.log(userInfo);
      var _this = this;

      if (userInfo) {
        //userInfo.broker = 'broker';
        _this.trigger('login', userInfo);
      } else {
        location.replace('login.html');
      }
    },
    login: function(userInfo) {
      $.ajax({
        url: '/newhouse-web/info/singleSignOn',
        type: 'POST',
        data: userInfo,
        success: function(data) {
          if (data.status === 'C0000') {
            var uid = amplify.store.sessionStorage('uid');
            if (uid) {
              amplify.store.sessionStorage('infoMenu_' + uid, null);
            }
            amplify.store.sessionStorage('uid', null);
            amplify.store.sessionStorage('area', null);
            amplify.store.sessionStorage('opencity', null);
            amplify.store.sessionStorage('position', null);
            amplify.store.sessionStorage('userConfig', null);
            amplify.store.sessionStorage('isrow', null);
            amplify.store.sessionStorage('isrowindex', null);
            amplify.store.sessionStorage('userInfo', { sessionId: data.result.sessionId });
            location.replace('index.html');
          } else {
            location.replace('login.html')
          }
        }
      });
    }

  },
  mixins: [{
    getQuery: function(p) {
      var reg = new RegExp('(^|&)' + p + '=([^&]*)(&|$)', 'i');
      var r = window.location.search.substr(1).match(reg);
      return r ? decodeURI(r[2]) : null;
    },
  }]

}), '#app');
