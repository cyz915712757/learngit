const SUCCESS = 0;

/**
 * 话机接口中调用Demo
 * @type {{init: Common.init, getConnectStatus: Common.getConnectStatus, call: Common.call, hangup: Common.hangup, answer: Common.answer, getIMEI: Common.getIMEI, enableRecord: Common.enableRecord, forbidRecord: Common.forbidRecord, setNumberHidden: Common.setNumberHidden, getNumberHidden: Common.getNumberHidden, exitSdk: Common.exitSdk, setRecordFormat: Common.setRecordFormat, getRecordFormat: Common.getRecordFormat, setPushUrl: Common.setPushUrl, getPushUrl: Common.getPushUrl, setNumber: Common.setNumber, getNumber: Common.getNumber, getStatus: Common.getStatus, jsonpRequest: Common.jsonpRequest}}
 */
var Common = {
  /**
   * 初始化sdk连接串口（该接口需最先被调用, 即使被重复调用也不影响使用）
   */
  init: function () {
    this.jsonpRequest("+reopencom", {
    }, function (res) {
      if (SUCCESS == res.code) {
        console.log("初始化完成!!!");
      } else {
        console.log("code: " + res.code + "，msg: " + res.msg);
      }
    });
  },

  /**
   * 查询话机连接状态
   */
  getConnectStatus: function () {
    this.jsonpRequest("+telstatus", {
    }, function (res) {
      if (SUCCESS == res.code) {
        if (0 == res.data.code) {
          layer.msg('话机连接失败');
        } else {
          console.log('话机连接成功');
        }
      } else {
        console.log("code: " + res.code + "，msg: " + res.msg);
      }
    });
  },

  /**
   * 发起呼叫
   * @param call_id  通话唯一标识, 可以为null
   * @param tel_number  补叫号码
   * @returns {boolean}
   */
  call: function (call_id, tel_number) {
    if (!call_id) {
      call_id = null;
    }
    if (!tel_number) {
      return false
    }

    this.jsonpRequest("+cdv", {
      call_id: call_id,
      callargs: tel_number
    }, function (res) {
      if (SUCCESS == res.code) {
        console.log("已成功发起呼叫!!!");
      } else {
        console.log("code: " + res.code + "，msg: " + res.msg);
      }
    });
  },


  /**
   * 电话挂断
   */
  hangup: function () {
    this.jsonpRequest("+chv", {
    }, function (res) {
      if (SUCCESS == res.code) {
        console.log("电话已挂断!!!");
      } else {
        console.log("code: " + res.code + "，msg: " + res.msg);
      }
    });
  },

  /**
   * 接听电话
   */
  answer: function () {
    this.jsonpRequest("ata", {
    }, function (res) {
      if (SUCCESS == res.code) {
        console.log("电话已发起接听!!!");
      } else {
        console.log("code: " + res.code + "，msg: " + res.msg);
      }
    });
  },

  /**
   * 读取IMEI号码(判断话机以及管理话机用)
   */
  getIMEI: function () {
    this.jsonpRequest("+vmeid", {
      callargs: "?"
    }, function (res) {
      if (SUCCESS == res.code) {
        console.log("IMEI编码为：" + res.data.result);
      } else {
        console.log("code: " + res.code + "，msg: " + res.msg);
      }
    }
    );
  },


  /**
   * 允许话机录音
   */
  enableRecord: function () {
    this.jsonpRequest("JD_enable_record", {
    }, function (res) {
      if (SUCCESS == res.code) {
        console.log("允许话机录音调用成功!!!");
      } else {
        console.log("code: " + res.code + "，msg: " + res.msg);
      }
    }
    );
  },


  /**
   * 禁止话机录音
   */
  forbidRecord: function () {
    this.jsonpRequest("JD_unable_record", {
    }, function (res) {
      if (SUCCESS == res.code) {
        console.log("禁止话机录音调用成功!!!");
      } else {
        console.log("code: " + res.code + "，msg: " + res.msg);
      }
    }
    );
  },

  /**
   * 设置号码隐藏
   */
  setNumberHidden: function (begin, end) {
    this.jsonpRequest("JD_set_numtostar", {
      begin: begin,
      end: end,
    }, function (res) {
      if (SUCCESS == res.code) {
        if (begin == end && 0 == begin) {
          console.log("取消号码隐藏设置成功");
        } else {
          console.log("号码隐藏设置成功");
        }
      } else {
        console.log("code: " + res.code + "，msg: " + res.msg);
      }
    }
    );
  },

  /**
   * 查询号码隐藏
   */
  getNumberHidden: function () {
    this.jsonpRequest("JD_get_numtostar", {}, function (res) {
      if (SUCCESS == res.code) {
        console.log("号码隐藏：begin=" + res.data.begin + ", end=" + res.data.end);
      } else {
        console.log("code: " + res.code + "，msg: " + res.msg);
      }
    }
    );
  },

  /**
   * 退出sdk 清理资源
   */
  exitSdk: function () {
    this.jsonpRequest("JD_sdk_exit", {
    }, function (res) {
      if (SUCCESS == res.code) {
        console.log("ok");
      } else {
        console.log("code: " + res.code + "，msg: " + res.msg);
      }
    }
    );
  },


  /**
   * 设置推送到业务系统的URL地址
   * 话机会将通话记录、录音、状态推送给该url
   * @param url
   */
  setPushUrl: function (url) {
    this.jsonpRequest("JD_set_pushurl", {
      pushurl: url
    }, function (res) {
      if (SUCCESS == res.code) {
        console.log("已成功设置推送地址");
      } else {
        console.log("code: " + res.code + "，msg: " + res.msg);
      }
    }
    );
  },


  /**
   * 获取推送到业务系统的URL地址
   * @return url
   */
  getPushUrl: function () {
    this.jsonpRequest("JD_get_pushurl", {}, function (res) {
      if (SUCCESS == res.code) {
        console.log("推送地址为 " + res.data.pushurl);
      } else {
        console.log("code: " + res.code + "，msg: " + res.msg);
      }
    }
    );
  },

  /**
   * 设置话机的用户身份编号、绑定手机号码及企业编号
   * 这三个参数都会随话机的通话记录推送给第三方的业务系统(第三方可根据这三个参数识别通话记录的归属)
   * 推送地址详见对应的推送地址设置接口
   * @param agent  唯一标识话机的用户身份编号
   * @param thismobile  话机绑定的手机号码
   * @param company  企业编号
   */
  setNumber: function (agent, thismobile, company) {
    this.jsonpRequest("JD_set_number", {
      agent: agent,
      thismobile: thismobile,
      company: company
    }, function (res) {
      if (SUCCESS == res.code) {
        console.log('设置话机用户编号与绑定手机号码成功.');
      } else {
        console.log("code: " + res.code + "，msg: " + res.msg);
      }
    }
    );
  },


  /**
   * 查询话机的用户身份编号、绑定手机号及企业编号
   * @return  json
   */
  getNumber: function () {
    this.jsonpRequest("+telstatus", {}, function (res) {
      if (SUCCESS == res.code) {
        console.log('话机的用户编号为 ' + res.data.agnetId + ', 绑定手机号为 ' + res.data.mobile + ', 企业编号为 ' + res.data.company);
      } else {
        console.log("code: " + res.code + "，msg: " + res.msg);
      }
    }
    );
  },

  /**
   * 查询话机状态
   * @return  json
   *   call_coming  --- 来电话了
   *   coming_ring  --- 来电话机振铃中
   *   talking      --- 开始通话
   *   peerring     --- 呼出振铃中
   *   hangup       --- 挂电话了
   *   callout      --- 开始呼出
   */
  getStatus: function () {
    this.jsonpRequest("+telstatus", {}, function (res) {
      if (SUCCESS == res.code) {
        console.log('当前话机状态: ' + res.data.status);
      } else {
        console.log("code: " + res.code + "，msg: " + res.msg);
      }
    }
    );
  },


  /**
   * 发起jsonp调用
   * @param action  接口我
   * @param params  参数
   * @param callback 回调函数
   */
  jsonpRequest: function (action, params, callback) {
    var url = "http://localhost:10080/" + action;
    $.ajax({
      type: "get",
      async: true,
      url: url,
      dataType: "jsonp",
      jsonp: "callback",
      data: params,
      beforeSend: function () {
        //请求前的处理
      },
      success: function (data) {  //请求成功处理，和本地回调完全一样
        console.log(data);
        callback && callback.apply(null, [data]);
      },
      complete: function () {
        //请求完成的处理
        console.log('complete');
      },
      error: function () {
        //请求出错处理
        console.log('error');
      }
    });
  },
};

module.exports = Common;
