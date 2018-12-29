var coala = require('coala');
var config = require('config');
var tpl = require('./index.html');
require('./index.css');
var myDeal = require('./myDeal');
var myReport = require('./myReport');
var utils = require('utils');
// var myCharts = require('./myCharts');
var summary = require('../summary');

module.exports = {
    tpl: tpl,
    refs: {
        myDeal: {
            component: myDeal,
            el: '#myDeal'
        },
        myReport: {
            component: myReport,
            el: '#myReport'
        },
        summary: {
            component: summary,
            el: '#summary'
        }
    },
    listen: {
        mount: function() {
            this.params = {};
            this.trigger('initTab');
            this.trigger('initDate');

            this.summaryOpts = {
                sendData: this.params,
                type: 'personal',
                url: '/newhouse-web/distribution/personal/statistics'
            };
            this.refs.summary.trigger('render', this.summaryOpts);
        },

        unmount: function() {
            this.$('#dealStartDate').datetimepicker('remove');
            this.$('#dealEndDate').datetimepicker('remove');
            this.refs.myDeal && this.refs.myDeal.unmount();
            this.refs.myReport && this.refs.myReport.unmount();
        },

        initTab: function(e) {
            var _this = this;
            $(document).off('click.deal-report').on('click.deal-report', '.item-title li:not(:last)', function() {
                var index = $(this).index();
                $(this).addClass('current').siblings('li').removeClass('current');
                $('.item-content').eq(index).show().siblings('.item-content').hide();
                if (index === 1) {
                    _this.refs.myReport.trigger('initTable', { page: 1, pageSize: 15 });
                }
            });
        },

        initDate: function() {
            var _this = this;
            $('#dealStartDate').datetimepicker({
                format: 'yyyy-mm-dd',
                minView: 2,
                endDate: new Date()
            }).on('hide', function(e) {
                this.blur() //为了解决日期控件bug，不要删除
            }).on('changeDate', function(ev) {
                $('#dealEndDate').datetimepicker('setStartDate', ev.date);
                _this.params.startTime = utils.dateOp(ev.date);
            });

            $('#dealEndDate').datetimepicker({
                format: 'yyyy-mm-dd',
                minView: 2,
                endDate: new Date()
            }).on('hide', function(e) {
                this.blur() //for fixing bug ,do not remove it
            }).on('changeDate', function(ev) {
                $('#dealStartDate').datetimepicker('setEndDate', ev.date);
                _this.params.endTime = utils.dateOp(ev.date);
            });

            this.$('#dealStartDate').next('.icon-riqi').on('click', function() {
                _this.$('#dealStartDate').datetimepicker('show');
            });
            this.$('#dealEndDate').next('.icon-riqi').on('click', function() {
                _this.$('#dealEndDate').datetimepicker('show');
            });
        },

        queryCurrentTab: function() {
            var index = this.$('.item-title li.current').index();
            if (index === 0) {
                var params = $.extend({}, this.params, this.refs.myDeal.params);
                this.refs.myDeal.mmTable.load(params);
            } else {
                var params = $.extend({}, this.params, this.refs.myReport.params);
                this.refs.myReport.reportTable.load(params);
            }
        }
    },
    events: {
        'click #queryBtn': 'query',
        'click #resetBtn': 'reset'
    },
    handle: {
        query: function() {
            this.refs.summary.trigger('render', this.summaryOpts);
            this.trigger('queryCurrentTab');
        },
        reset: function() {
            this.params = {};
            this.$('#dealStartDate').val('');
            this.$('#dealEndDate').val('');

            this.summaryOpts.sendData.startTime = '';
            this.summaryOpts.sendData.endTime = '';
            /*重新设置时间插件*/
            this.$('#dealStartDate').datetimepicker('setEndDate', new Date());
            this.$('#dealStartDate').datetimepicker('setStartDate', null);
            this.$('#dealEndDate').datetimepicker('setEndDate', new Date());
            this.$('#dealEndDate').datetimepicker('setStartDate', null);
            this.refs.summary.trigger('render', this.summaryOpts);
            this.trigger('queryCurrentTab');
        }
    }
};
