var coala = require('coala');
var tpl = require('./index.html');
require('./index.css');
require('vendors/ajaxupload');
module.exports = {
  tpl: tpl,
  listen: {
    render: function() {
      this.paramsImport = {};
      this.trigger('initWaySources');
      this.trigger('initDeptSources');
      var address = location.origin + '/resources/CustomerImportTemplate.xls';
      this.$('#excelAddress').attr('href', address);
      this.trigger('importData');
    },
    importData: function() {
      var _this = this;
      var uploadEl = this.$('#fileBtn');

      if (!uploadEl.hasClass('disabled')) {
        _this.uploader = new AjaxUpload(uploadEl, {
          action: '/newhouse-web/customer/import/excel/upload',
          autoSubmit: false,
          name: 'file',
          responseType: 'json',
          liid: null,
          onChange: function(file, extension) {
            if (!(extension.length && /^(xls|xlsx)$/.test(extension[0]))) {
              layer.msg('请上传excle格式文件!');
              return false;
            }
            if (this._input.files && this._input.files[0] && this._input.files[0].size > 5242880) {
              layer.msg('请上传小于5M的Excel文件');
              return false;
            }
            var fileName = file.length >= 10 ? file.substring(0, 5) + '..xls' : file;
            $('#fileName').text(fileName);
            uploadEl.addClass('disabled');
          },
          onComplete: function(file, data) {
            uploadEl.removeClass('disabled');
            if (data.status === 'C0000') {
              _this.$('.import-msg').show(300);
              _this.$('#successCount').text(data.result.success || 0);
              _this.$('#failCount').text(data.result.fail || 0);
            } else {
              layer.msg(data.message);
              return false;
            }
          }
        });
      }
    },
    initWaySources: function() {
      var _this = this;
      this.waySources = this.$('#waySourcesImport').select({
        url: '/newhouse-web/customer/basic/waySources',
        dataFormater: function(data) {
          var _this = this;
          return data.result;
        },
        width: 200,
        rows: 5,
        placeholder: '客户来源'
      });
      this.$('#waySourcesImport').on('bs.select.select', function(e, value, select) {
        _this.paramsImport.waySource = value.id;
      });
    },
    initDeptSources: function() {
      var _this = this;
      this.deptSubSources = this.$('#deptSourcesImport').select({
        treeOption: {
          url: '/newhouse-web/customer/basic/deptTree',
          idField: 'id',
          nameField: 'name',
          multiple: false,
          dataFormater: function(data) {
            var _this = this;
            return data.result;
          }
        },
        width: 200,
        placeholder: '部门来源'
      });
      this.$('#deptSourcesImport').on('bs.select.select', function(e, value, select) {
        _this.paramsImport.orgId = value[0].id;
        _this.paramsImport.orgName = value[0].name;
      });
    }
  },
  events: {
    'click .js-import': 'importData'
  },
  handle: {
    importData: function() {
      var _this = this;
      var params = {
        waySource: _this.paramsImport.waySource,
        orgId: _this.paramsImport.orgId,
        orgName: _this.paramsImport.orgName
      };

      if (!params.orgId) {
        layer.msg('请选择归属部门!');
        return false;
      }

      if (!params.waySource) {
        layer.msg('请选择客户来源！');
        return false;
      }

      if (_this.uploader && !_this.uploader._input.files.length) {
        layer.msg('请选择文件!');
        return false;
      }
      _this.uploader.setData(params);
      _this.uploader.submit();
    }
  }
};
