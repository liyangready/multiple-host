/**
 * 业务逻辑
 */
define(function(require, exports) {
	'require:nomunge,exports:nomunge,module:nomunge';

	// 后台页数据模型
	var model = require('../model/model.js'),

	// 工具集
	util = require('../util/util.js'),

	/**
	 * 禁用掉集合中的域名, 返回禁用结点集合(指定group或entry的除外)
	 */
	_disableAll = function(hostnames, group, entry) {
        //hostnames : {qunarzz.com: true}
        //entry : 就是选中的那条entry对象
        //console.log('biz.js _disableAll : ', hostnames, group, entry);

        //这个地方不能再重新loadData,否则会刷新model中缓存的data,
        //会导致在node上绑定的data永远和model.get('data')不相等,
        //导致在保存操作的时候,node上的entry,entry.enable=true等操作无法同步到model中的data里
        //保存永远无效
        //var data = exports.loadData(),
        var data = model.get('data'),

		disables = $(), did, i;
		for (i in data) {
			if (data[i] != group) {
				did = false;
				data[i].traverse(function() {
                    //console.log(this != entry, this.enable, hostnames[this.hostname], this.hostname)
					if (this != entry && this.enable && hostnames[this.hostname]) {
						this.enable = false;
						disables = disables.add(this.target);
						did = true;
					}
				});
				if (did) {
					data[i].enable = false;
					disables = disables.add(data[i].target);
				}
			}
		}

        //console.log('biz.js _disableAll data : ', data);
		hostnames = group = entry = data = null;
		return disables;
	};

    /**
     * add by wonk :
     * 就是为了检查所选条目上的entry数据与缓存中的数据是否能对应上
     * 参数entry:绑定在dom元素(node)上
     * 缓存数据:model.get('data')
     * 返回true:表示能对应上
     * 返回false:对应不上
     * @param entry
     * @returns {boolean}
     * @private
     */
    var _checkData = function(entry) {
        var _originData = model.get('data');
        var rtnFlag = false;
        for(var i in _originData) {
            _originData[i].traverse(function() {
                if(this === entry) {
                    rtnFlag = true;
                }
            });
        }
        //console.log('所选条目上的entry数据与缓存中的数据对应不上');
        //console.log('这可能是重复model.put("data", data)导致的');
        //console.log('这会导致设置entry.enable=true等操作永远无效');
        return rtnFlag;
    };

	/**
	 * 切换组启用状态
	 */
	exports.checkGroup = function(node, callback) {
		var entry = node.data('target');
		if (entry.enable) { // 启用的组切换为禁用
			entry.traverse(function() {
				if (this.enable) {
					this.enable = false;
					node = node.add(this.target);
				}
			});
			entry.enable = false;
			callback(null, node);
			entry = node = null;
		} else { // 禁用的组切换为启用
			var hostnames = {},
			duplicate = false,
			disables = null,
			enables = entry.target;
			entry.traverse(function() { // 寻找组内是否有重复hostname
				if (hostnames[this.hostname]) {
					duplicate = true;
					return false;
				} else {
					hostnames[this.hostname] = true;
				}
			});
			if (duplicate) {
				throw 1;
			}
			disables = _disableAll(hostnames, entry); // 禁用其他组内和本组有重复的hostname
			entry.traverse(function() {
				if (!this.enable) {
					this.enable = true;
					enables = enables.add(this.target);
				}
			});
			entry.enable = true;
			callback(enables, disables);
			entry = node = hostnames = disables = enables = null;
		}
	};

	/**
	 * 切换行启用状态
	 */
	exports.checkLine = function(node, callback) {
		var entry = node.data('target'),
		group = entry.findGroup(),
		hostnames = {},
		enables = null,
        disables = null;

        //console.log('exports.checkLine : entry.enable : ', entry.enable);
        //console.log(entry.target);

        //禁用
		if (entry.enable) {
			entry.enable = false;
			group.enable = false;
            enables = null;
            disables = entry.target.add(group.target);

            if(_checkData(entry)){
                callback(enables, disables);
            };
		}
        //启用
        else {
			hostnames[entry.hostname] = true;
			entry.enable = true;
			enables = group.checkEnable() ? group.target.add(entry.target) : entry.target;
            disables = _disableAll(hostnames, null, entry);

            //console.log("exports.checkLine : ", group.checkEnable(), enables, enables.length, disables, disables.length);
            //console.log("exports.checkLine : ", node.data('target'))
            //console.log("exports.checkLine : ", enables, _disableAll(hostnames, null, entry));
            //callback:_batchCheck,回调其实就是保存到本地文件或者localStorage
            //第一个参数:enables.trigger('checkon')
            //第二个参数:disables.trigger('checkoff')
            if(_checkData(entry)) {
                callback(enables, disables);
            }
		}
	};

	/**
	 * 加载数据
	 */
	exports.loadData = function(cacheType) {
        return model.loadData(cacheType);
	};

	/**
	 * 获取需要编辑的表单项
	 */
	exports.editFields = function(data) {
		var fields = [];
		if (data.addr) { // 行
			fields.push({
				label: '{{:olAddr}}',
				name: 'addr',
				value: data.addr,
				check: 'isValidIP'
			});
			fields.push({
				label: '{{:olHost}}',
				name: 'hostname',
				value: data.hostname,
				check: /^[\w\.\-]+$/
			});
			fields.push({
				label: '{{:olComment}}',
				name: 'comment',
				value: data.comment,
				check: /^[^#]*$/
			});
		} else { // 组
			fields.push({
				label: '{{:olGroup}}',
				name: 'line',
				value: data.line,
				check: /^[^@][^#]*$/,
				placeholder: util.i18n('groupNameTpl')
			});
		}
		return fields;
	};

	/**
	 * 获取当前tab的IP
	 */
	exports.getIP = function(tabId) {
		return model.get(tabId);
	};

	/**
	 * 当前系统是否支持写入hosts文件
	 */
	exports.canWrite = function() {
		return model.get('writeStorage') == '1';
	};

	/**
	 * 解析数据
	 */
	exports.parseData = model.parseData;

	/**
	 * 添加组
	 */
	exports.addGroup = model.addGroup;

	/**
	 * 保存数据
	 */
	exports.saveData = model.saveData;

	/**
	 * 获取版本号
	 */
	exports.getVersion = model.getVersion;

	/**
	 * 获取hosts文件路径
	 */
	exports.getHostsPath = model.getHostsPath;
    /*
    * 读取文件内容
    * */
    exports.readFile = model.readFile;
	/**
	 * 设置hosts文件路径
	 */
	exports.setHostsPath = model.setHostsPath;

	/**
	 * 存数据
	 */
	exports.putData = model.put;

	/**
	 * 取数据
	 */
	exports.getData = model.get;

	/**
	 * 取文件内容
	 */
	exports.loadContent = model.loadContent;
});