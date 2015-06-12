/**
 * 选项页
 */
define(function(require, exports) {
	'require:nomunge,exports:nomunge,module:nomunge';

	// 后台页数据模型
	var model = chrome.extension.getBackgroundPage().model,

	// 渲染器
	Render = require('./model/render.js'),

	// 选项渲染器
	optionRender = new Render('optionTemp'),

	// 是否显示IP
	showIP = null,

	// 是否允许本地存储
	writeStorage = null;

	// 初始化
	$('body').append(optionRender.render({}));
	showIP = $('#showIP').click(function() {
		model.put('showIP', this.checked ? '1' : '0');
	});
	writeStorage = $('#writeStorage').click(function() {
		model.put('writeStorage', this.checked ? '1' : '0');
	});
	if (model.get('showIP') == '1') {
		showIP.attr('checked', 'checked');
	}
	if (model.get('writeStorage') == '1') {
		writeStorage.attr('checked', 'checked');
	}
	if (model.get('benchmarking') == '0') {
		$('#clearCache').attr('disabled', 'disabled').next().css('opacity', .75);
	}
	$('#' + model.get('method')).attr('checked', 'checked');
	$(':radio,#clearProxy').click(function() {
		if (this.value != 'useProxy') { // 清理proxy
			chrome.proxy.settings.clear({
				scope: 'regular'
			}, $.noop);
		}
		this.value && model.put('method', this.value);
	});
	$('#clearStorage').click(function() {
		model.clearStorage();
	});
});
