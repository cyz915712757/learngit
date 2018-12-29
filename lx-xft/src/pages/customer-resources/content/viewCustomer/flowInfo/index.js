var tpl = require('./index.html');
var pagination = require('components/pagination');
var utils = require('../../../../../utils');
require('./index.css');

module.exports = {
  tpl: tpl,
  refs: {
    pagination: {
      component: pagination,
      el: '#followPage'
    }
  },
  listen: {
    getFlowInfo: function(opts) {
      var _this = this;
      this.id = opts.id;
      this.customerId = opts.customerId;
      this.type = opts.type;
      this.batch = opts.batch;
      this.parent = opts.parent;

      this.flowInfo = $('#flowInfo').select({
        data: [
          { id: '1', name: '拒绝接听' },
          { id: '2', name: '无人接听' },
          { id: '3', name: '暂时不考虑买房' },
          { id: '2', name: '刚买房,暂时不考虑 ' },
          { id: '2', name: '正在忙,稍后再联系' },
          { id: '2', name: '刚买房,暂时不考虑 ' }
        ],
        search: true,
        itemFormater: function(item) {
          return '<a href="javascript:;" data-id="' + item.id + '" style="color: #9A9A9A;">' + item.name + '</a>';
        },
        width: 500,
        editable: true,
        highlight: true
      });

      $(document).on('input', '#flowInfo input', function() {
        if (this.value.length) {
          $(this).siblings('.select-menu.open').hide();
        } else {
          $(this).siblings('.select-menu.open').show();
        }
      });

      $(document).on('click', '#flowInfo .select-menu li', function() {
        $(this).parent().hide();
      });

      _this.trigger('showOrHideTag');
      //获取私客跟进记录信息
      this.followTb = this.$('#followTable').table({
        cols: [
          { title: '内容', name: 'content', width: 250, },
          { title: '跟进人', name: 'followUser', width: 40, }, {
            title: '跟进时间',
            name: 'followTime',
            width: 40,
            renderer: function(val, item, rowIndex) {
              return utils.formatDate(item.followTime, 'view');
            }
          }
        ],
        params: {
          id: opts.id,
          customerId: opts.customerId
        },
        method: 'get',
        url: '/newhouse-web/customer/' + _this.type + '/getFollows',
        transform: function(data) {
          if (data.result) {
            return data.result.items;
          } else {
            data.result = [];
          }

        },
        showBackboard: false,
        height: 'auto',
        fullWidthRows: true
      });

      this.followTb.on('loadSuccess', function(e, data) {
        if (data.result) {
          var pageParam = {
            currentPage: data.result.currentPage,
            pageCount: data.result.pageCount,
            pageSize: data.result.pageSize,
            totalCount: data.result.recordCount
          };
          _this.refs.pagination.trigger('refresh', pageParam);
        }
      });
    },
    jump: function(page, pageSize) {
      this.followTb.load({ id: this.id, customerId: this.customerId, page: page });
    },
    showOrHideTag: function() {
      var _this = this;
      //控制显示打标签功能
      $.ajax({
        type: 'get',
        url: '/newhouse-web/customer/' + _this.type + '/getItem',
        data: {
          id: _this.id,
        },
        success: function(data) {
          if ((_this.type === 'public' || _this.type === 'resources') && data.result.canMark) {
            _this.$('.follow-checkbox').show();
          } else {
            _this.$('.follow-checkbox').hide();
            if (_this.$('input[name="tag"]:checked')[0]) {
              _this.$('input[name="tag"]:checked')[0].value = '';
            }
          }
        }
      });
    }
  },

  events: {
    'click .save-btn:not(.disabled)': 'saveFlowInfo'
  },

  handle: {
    saveFlowInfo: function(e) {
      var $ele = this.$(e.currentTarget);
      var content = $.trim(this.flowInfo.getName());
      var checkedValue = this.$('input[name="tag"]:checked');
      if (checkedValue && checkedValue.length === 2) {
        layer.msg('只允许打一个标签，请重新选择。');
        return;
      }

      var _this = this;

      if (!content) {
        layer.msg('请填写跟进内容!');
        return;
      } else if (content.length >= 300) {
        layer.alert('跟进内容长度不可超过300个字!');
        return;
      }

      var params = {
        id: this.id,
        content: content,
        customerId: this.customerId,
        batch: this.batch
      };

      if (checkedValue[0]) {
        params.tag = checkedValue[0].value;
      }

      $.ajax({
        url: '/newhouse-web/customer/' + this.type + '/saveFollow',
        type: 'post',
        data: params,
        beforeSend: function() {
          $ele.addClass('disabled');
        },
        success: function(data) {
          if (data.status === 'C0000') {
            _this.flowInfo.render();
            layer.msg(data.message);
            if (_this.type === 'public' || _this.type === 'resources') {
              var params = {
                id: _this.id,
                customerId: _this.customerId,
                type: _this.type,
                batch: _this.batch
              };

              _this.parent.refs.viewCustomer.refs.privateDetail.trigger('getPrivateDetail', params)
              _this.trigger('showOrHideTag');
            }
            _this.followTb.load({ id: _this.id, customerId: _this.customerId });
            $ele.removeClass('disabled');
          } else {
            layer.msg(data.message);
            $ele.removeClass('disabled');
          }
        }
      });
    }
  }

}
