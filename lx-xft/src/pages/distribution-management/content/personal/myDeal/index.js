var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');
var layer = require('components/layer');
var dealReport = require('../../dealReport');
require('./index.css');
module.exports = {
    tpl: tpl,
    listen: {
        mount: function() {
            var _this = this;
            this.params = {};
            this.trigger('initTable', this.params);
            $(document).on('click', '.my-deal .status-item', function(e) {
                var $ele = _this.$(e.currentTarget);
                _this.params.status = $ele.data('status');
                if ($ele.hasClass('current')) {
                    return;
                } else {
                    $ele.addClass('current').siblings('.current').removeClass('current');
                    var params = $.extend({}, _this.params, _this.parent.params)
                    _this.mmTable.load(params);
                }
            })
        },
        initTable: function(opts) {
            this.mmTable = $('#dealTb').table({
                cols: [
                    { title: '成交楼盘', name: 'gardenName' },
                    { title: '房号', name: 'roomNumber' }, {
                        title: '成交价格',
                        name: 'dealPrice',
                        renderer: function(a, item, c) {
                            return item.dealPrice + '元';
                        }
                    }, {
                        title: '应结佣金',
                        name: 'totalCommission',
                        renderer: function(a, item, c) {
                            return item.totalCommission + '元';
                        }
                    }, {
                        title: '已结佣金',
                        name: 'paidCommission',
                        renderer: function(a, item, c) {
                            return item.paidCommission + '元';
                        }
                    }, {
                        title: '未结佣金',
                        name: 'unPaidCommission',
                        renderer: function(a, item, c) {
                            return item.unPaidCommission + '元';
                        }
                    }, {
                        title: '上数日期',
                        name: 'bargainTime',
                        renderer: function(a, item, c) {
                            return item.bargainTime.substring(0, 10);
                        }
                    }, {
                        title: '状态',
                        name: 'statusDesc'
                    }, {
                        title: '操作',
                        name: 'name',
                        renderer: function(a, item, c) {
                            var colorFlag;
                            if (item.status.indexOf('BARGAIN_NON_PAIED') > -1) {
                                colorFlag = '#ea5532';
                            } else if (item.status.indexOf('BARGAIN_PAIED') > -1) {
                                colorFlag = '#00a95f';
                            } else if (item.status.indexOf('BARGAIN_PART_PAIED') > -1) {
                                colorFlag = '#00afec';
                            }
                            return '<div class="status-desc" style="color:' + colorFlag + '">' + item.statusDesc + '</div><a href="javascript:;" data-id="' + item.id + '" class="see-report">查看交易报告</a>';
                        }
                    }
                ],
                params: opts,
                url: '/newhouse-web/distribution/personal/deals',
                root: 'result',
                showBackboard: false,
                height: 'auto',
                fullWidthRows: true
            });
        }
    },
    events: {
        'click .see-report': 'seeReport',
        'click #searchBtn': 'queryData',
        'click .js-clear': 'clearData'
    },
    handle: {
        seeReport: function(e) {
            var $el = this.$(e.target);
            var index = layer.open({
                type: 1,
                title: '交易报告',
                area: ['580px', '490px'],
                move: false,
                scrollbar: false,
                content: '<div id="dealReport" class="deal-report"></div>',
                cancel: function() {
                    layer.closeAll();
                }
            });

            var d = coala.mount(dealReport, '#dealReport');
            d.index = index;
            d.trigger('fetch', { id: $el.data('id'), url: '/newhouse-web/distribution/personal/report' });

        },

        queryData: function(e) {
            this.params.keyword = this.$('#dealKeyword').val();
            var params = $.extend({}, this.params, this.parent.params)
            this.mmTable.load(params);
        },

        clearData: function(e) {
            if (this.params.status) {
                $('.my-deal .status-item.current').removeClass('current');
                $('.my-deal .status-wrapper li').eq(1).addClass('current');
            }
            this.params = {};
            this.$('#dealKeyword').val('');
            var params = $.extend({}, this.params, this.parent.params)
            this.mmTable.load(params);
        }
    }


};
