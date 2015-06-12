/**
 * 结点
 */
define(function(require, exports, module) {
	'require:nomunge,exports:nomunge,module:nomunge';

	// 注释的正则
	var regQute = /^#+\s*/,

	// 工具类
	util = require('../util/util.js'),

	/**
	 * 构造方法
	 */
	Entry = function(line) {
		this.addr = ''; // IP
		this.comment = ''; // 注释
		this.enable = false; // 是否启用
		this.hostname = ''; // 域名
		this.line = line; // hosts文件中对应的行
		this.next = this; // 下一条记录
		this.target = null; // 对应的DOM
		this.hide = false; // 是否隐藏(只对组有效)
		if (line && line.charAt(0) == '@') {
			this.hide = true;
			this.line = line.substring(1);
		}
	};

	Entry.prototype = {

		/**
		 * 从当前结点的下一个开始遍历, 返回遍历到的结点个数
		 */
		traverse: function(callback) {
			var c = 0, p = this.next, q;
			while (p != this) {
				c++;
				q = p.next;
				if (callback && callback.call(p) === false) {
					return c;
				}
				p = q;
			}
			return c;
		},

		/**
		 * 定位到组结点
		 */
		findGroup: function() {
			var group = null;
			this.traverse(function() {
				if (!this.addr) {
					group = this;
					return false;
				}
			});
			return group;
		},

		/**
		 * 设置目标结点
		 */
		setTarget: function(target) {
			if (target && (target instanceof $)) {
				this.target = target;
				target.data('target', this);
			}
		},

		/**
		 * 检查是否启用
		 */
		checkEnable: function() {
			var that = this;
			if (!this.addr) {
				this.enable = true;
				this.traverse(function() {
					if (!this.enable) {
						that.enable = false;
						return false;
					}
				});
			}
			return this.enable;
		},

		/**
		 * 链接
		 */
		link: function(entry) {
			var p = entry;
			while (p.next != entry) {
				p = p.next;
			}
			p.next = this.next;
			this.next = entry;
		},

		/**
		 * 断开链接
		 */
		delink: function() {
			var p;
			if (this.addr) { // 行
				this.traverse(function() {
					p = this;
				});
				if (p) { // 前一个结点
					p.next = this.next;
				}
			} else { // 组
				this.traverse(function() {
					this.next = null;
					this.target = null;
				});
			}
			this.next = null;
			this.target = null;
		},

		/**
		 * 解析
		 */
		analysis: function(line) {
            line = $.trim(line);

            var regQute = /^#+/,
                oriLine = line;

            //console.log('line : ', line)
            //console.log('/^#*\s*[0-9A-Za-z:\.]+\s+[^#]+/.test(line)', /^#*\s*[0-9A-Za-z:\.]+\s+[^#]+/.test(line))
			if (/^#*\s*[0-9A-Za-z:\.]+\s+[^#]+/.test(line)) {
				this.enable = !regQute.test(line); // 是否启用
				if (!this.enable) {
					line = line.replace(regQute, '');
				}
				var index = line.indexOf('#');
				if (index != -1) {
					this.comment = $.trim(line.substring(index).replace(regQute, '')); // 注释
					line = $.trim(line.substring(0, index));
				}
				line = line.split(/\s+/);

                //console.log('line.length : ', line, line.length, util.isValidIP(line[0]));
                //if(line.length <= 1) {
                    //console.log(oriLine, '-> ip或者主机名残缺,自动忽略');
                //}
                //if(line.length > 1 && !util.isValidIP(line[0])) {
                    //console.log(oriLine, '-> 注释行,空行,或者不是一个合法的IP地址,自动忽略');
                //}

				if (line.length > 1 && util.isValidIP(line[0])) { // 是合法的IP地址
					this.addr = line[0];
					this.hostname = line[1];
					for (var i = 2; i < line.length; i++) { // 一个IP对应多个域名
						var entry = new Entry();
						entry.addr = this.addr;
						entry.comment = this.comment;
						entry.enable = this.enable;
						entry.hostname = line[i];
						this.link(entry);
					}
					return true;
				}
			}
			if (line instanceof Array) {
				line = line.join(' ');
			}
			this.line = $.trim(line.replace(regQute, ''));
			return false;
		},

		/**
		 * 还原为文字
		 */
		toString: function() {
			var text = '';
			if (this.addr) { // 行
				text += (this.enable ? '' : '#') + this.addr + '\t' + this.hostname;
				text += (this.comment ? '\t# ' + this.comment : '') + '\n';
			} else { // 组(输出组内所有行)
				text += '\n# ' + (this.hide ? '@' : '') + this.line + '\n';
				this.traverse(function() {
					text += this.toString();
				});
			}
			return text;
		},

		/**
		 * 将启用项推到数组中
		 * @param array
		 */
		pushEnables: function(array) {
			if (this.addr) {
				if (this.enable) {
					array.push({
						addr: this.addr,
						hostname: this.hostname
					});
				}
			} else {
				this.traverse(function() {
					this.pushEnables(array);
				});
			}
		}
	};

	module.exports = Entry;

});
