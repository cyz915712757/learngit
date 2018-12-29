module.exports = {

  turnCommonPrivate: function(opts) {
    var _this = opts.self;
    var e = opts.e;
    var tagEl = _this.$(e.currentTarget);
    var id = tagEl.data('id');
    var batch = tagEl.data('batch');
    $.ajax({
      type: 'GET',
      data: { id: id },
      url: '/newhouse-web/customer/' + opts.type + '/getItem',
      success: function(data) {
        if (data.status == 'C0000') {
          var configObj = {
            id: id,
            type: opts.type,
            getitem: data.result,
            sendUrl: opts.type + '/toPrivate',
            batch: batch
          };
          _this.parent.editFun(opts.type === 'public' ? '公客转私' : '资源客转私', configObj);
        } else if (data.status == 'CUSTOMER0023') {
          /*已经转私*/
          layer.msg('对不起!此客户已被他人转私');
          _this.parent.changeStatus(id, '已被他人转私');
        } else {
          layer.msg(data.message);
        }
      }
    });
  },

  checkCommonPrivate: function(opts) {
    var deferred = $.Deferred();
    var _this = opts.self;
    var id = opts.id;
    $.ajax({
      type: 'GET',
      data: { id: id },
      url: '/newhouse-web/customer/' + opts.type + '/getItem',
      success: function(data) {
        if (data.status == 'CUSTOMER0023') {
          /*已经转私*/
          _this.changeStatus(id, '已被他人转私');
          deferred.reject();
        } else {
          deferred.resolve();
        }
      }
    });
    return deferred;
  },

  viewCommonCustomer: function(opts) {
    var _this = opts.self;
    var e = opts.e;
    var tagEl = _this.$(e.currentTarget);
    var id = tagEl.data('id');
    $.ajax({
      type: 'GET',
      data: { id: id },
      url: '/newhouse-web/customer/' + opts.type + '/getItem',
      success: function(data) {
        if (data.status == 'C0000') {
          _this.parent.trigger('openViewCustomer', {
            type: opts.type,
            el: _this.$(e.target),
            idArr: _this.idArr
          });
          _this.parent.changeStatus(id);
        } else if (data.status == 'CUSTOMER0023') {
          /*已经转私*/
          layer.msg('对不起!此客户已被他人转私');
          _this.parent.changeStatus(id, '已被他人转私');
        } else {
          layer.msg(data.message);
        }
      }
    });
  },

  publicIntention: function(item) {

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
  },

  unparam: function(input) {
    var items, temp,

      // Expresiones regulares

      expBrackets = /\[(.*?)\]/g,
      expVarname = /(.+?)\[/,

      // Contenedor para almacenar el resultado

      result = {};

    // Descartamos entradas que no sean cadenas de texto o se encuentren vacías

    if ((temp = $.type(input)) != 'string' || (temp == 'string' && !temp.length))

      return {};

    // Decodificamos la entrada y la dividimos en bloques

    items = decodeURIComponent(input).split('&');

    // Es necesario que los datos anteriores no se encuentren vacíos

    if (!(temp = items.length) || (temp == 1 && temp === ''))

      return result;

    // Recorremos los datos

    $.each(items, function(index, item) {

      // Es necesario que no se encuentre vacío

      if (!item.length)

        return;

      // Iniciamos la divisón por el caracter =

      temp = item.split('=');

      // Obtenemos el nombre de la variable

      var key = temp.shift(),

        // Y su valor

        value = temp.join('=').replace(/\+/g, ' '),

        size, link, subitems = [];

      // Es necesario que el nombre de la clave no se encuentre vacío

      if (!key.length)

        return;

      // Comprobamos si el nombre de la clave tiene anidaciones

      while ((temp = expBrackets.exec(key)))

        subitems.push(temp[1]);

      // Si no tiene anidaciones

      if (!(size = subitems.length)) {

        // Guardamos el resultado directamente

        result[key] = value;

        // Continuamos con el siguiente dato

        return;

      }

      // Decrementamos el tamaño de las anidaciones para evitar repetidas restas

      size--;

      // Obtenemos el nombre real de la clave con anidaciones

      temp = expVarname.exec(key);

      // Es necesario que se encuentre y que no esté vacío

      if (!temp || !(key = temp[1]) || !key.length)

        return;

      // Al estar todo correcto, comprobamos si el contenedor resultante es un objecto

      if ($.type(result[key]) != 'object')

      // Si no lo es forzamos a que lo sea

        result[key] = {};

      // Creamos un enlace hacia el contenedor para poder reccorrerlo a lo largo de la anidación

      link = result[key];

      // Recorremos los valores de la anidación

      $.each(subitems, function(subindex, subitem) {

        // Si el nombre de la clave se encuentra vacío (varname[])

        if (!(temp = subitem).length) {

          temp = 0;

          // Recorremos el enlace actual

          $.each(link, function(num) {

            // Si el índice es un número entero, positivo y mayor o igual que el anterior

            if (!isNaN(num) && num >= 0 && (num % 1 === 0) && num >= temp)

            // Guardamos dicho número y lo incrementamos en uno

              temp = Number(num) + 1;

          });

        }

        // Si se llegó al final de la anidación

        if (subindex == size) {

          // Establecemos el valor en el enlace

          link[temp] = value;

        } else if ($.type(link[temp]) != 'object') { // Si la anidación no existe

          // Se crea un objeto con su respectivo enlace

          link = link[temp] = {};

        } else { // Si la anidación existe

          // Cambiamos el enlace sin sobreescribir datos

          link = link[temp];

        }

      });

    });

    // Retornamos el resultado en forma de objeto

    return result;

  }

};
