/**
 * 编辑层
 */
define(function(require, exports) {
	'require:nomunge,exports:nomunge,module:nomunge';

	// 渲染器
	var Render = require('../model/render.js'),

	// 浮层渲染器
	olRender = new Render('olTemp'),
	
	// 表单域渲染器
	fieldRender = new Render('fieldTemp'),

	// 多行文本域渲染器
	areaFieldRender = new Render('areaFieldTemp'),

	// 工具集
	util = require('../util/util.js'),

	// 遮罩
	mask = $('#mask').hide(),

	// 浮层
	overlay = $('#overlay'),

	// 当前编辑中的表单项
	olFields = null,

	// 当前编辑中的回调方法
	olSave = null;

	/**
	 * 显示编辑层
	 * @param title 标题
	 * @param fields 要编辑的表单项
	 * @param save 保存按钮的回调方法
	 */
	exports.show = function(title, fields, save) {
		var html = '',
		field = null,
		render = null;
		olFields = {};
		olSave = save;
		for (var i = 0; i < fields.length; i++) {
			field = olFields[fields[i].name] = {
				label: olRender.render(null, fields[i].label),
				check: fields[i].check,
				type: fields[i].type
			};
			if (field.type == 'textarea') {
				render = areaFieldRender;
			} else {
				render = fieldRender;
			}
			html += render.render({
				name: fields[i].name,
				label: field.label,
				value: fields[i].value || '',
				placeholder: fields[i].placeholder || ''
			});
		}
		overlay.html(olRender.render({
			title: title,
			fields: html
		}));
		mask.fadeIn();
	};

	/**
	 * 保存数据
	 */
	exports.save = function() {
		if (olSave) {
			var fieldError = false,
			data = {};
			overlay.find('input,textarea').each(function() {
				var value = $.trim(this.value),
				check = olFields[this.name].check;
				if (check) { // 需要校验
					if (typeof check == 'string' ? util[check](value) : check.test(value)) {
						data[this.name] = value;
					} else {
						fieldError = olRender.render(null, olFields[this.name].label);
						return false;
					}
				} else { // 不需要校验
					data[this.name] = value;
				}
			});
			if (fieldError) {
				fieldError =  '[' + fieldError + ']' + util.i18n('fieldError');
			}
			olSave(fieldError, data);
		}
	};

	/**
	 * 隐藏编辑层
	 */
	exports.hide = function() {
		mask.fadeOut();
		olFields = olSave = null;
	};
});