/**
 * 渲染器
 */
define(function(require, exports, module) {
	'require:nomunge,exports:nomunge,module:nomunge';

	// 工具类
	var util = require('../util/util.js'),

	/**
	 * 构造方法
	 * @param template 模板id
	 */
	Render = function(template) {
		if (template) {
			this.template = document.getElementById(template).innerHTML;
		}
	};

	Render.prototype = {

		/**]\]\
		 * 将对象渲染到模板
		 * 以下几种形式将被变量替换:
		 * {{:text}} 从国际化文件中获取text
		 * {{a.b}} 相当于obj.a.b
		 * {{a.b?1:2}} 相当于obj.a.b?1:2
		 */
		render: function(obj, template) {
			return (template || this.template).replace(/\{\{([:\w\.\?]+)\}\}/g, function(str, p1) {
				if (p1.charAt(0) == ':') {
					return util.i18n(p1.substring(1));
				} else if (obj) {
					var i, j = obj, p = p1.split('?'), q = p[0].split('.');
					for (i = 0; i < q.length; i++) {
						if (q[i] in j) {
							j = j[q[i]];
						} else {
							return '';
						}
					}
					if (p[1]) {
						p = p[1].split(':');
						return j ? p[0] : p[1];
					}
					return j;
				} else {
					return '';
				}
			});
		}
	};

	module.exports = Render;

});
