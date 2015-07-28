/**
 * 视图逻辑
 */
define(function(require, exports) {
	'require:nomunge,exports:nomunge,module:nomunge';

	// 业务逻辑
	var biz = require('./biz.js'),

    Drop = require('./drop.js'),
    Entry = require('../model/entry.js'),
	// 工具集
	util = require('../util/util.js'),

	// 弹出消息
	tip = require('../util/tip.js'),

	// 编辑层
	editor = require('../util/editor.js'),

	// 渲染器
	Render = require('../model/render.js'),

	// 组结点渲染器
	groupRender = new Render('groupTemp'),

	// 行结点渲染器
	lineRender = new Render('lineTemp'),

	// 头渲染器
	headRender = new Render('headTemp'),

	// 标记(setter/getter)
	_mark = function(key, value) {
		if (typeof value == 'undefined') {
			return biz.getData(key);
		} else {
			return biz.putData(key, value);
		}
	},

	/**
	 * 保存文件
	 */
	_saveData = function(file) {
        //console.log('view.js _saveData  file : ', file);
		try {
            //如果file文件路径为空,则取默认的文件路径
			biz.saveData(file);
			file && setTimeout(function() {
				tip.showInfoTip(util.i18n('saveSuccess'));
			}, 0);
			return true;
		} catch (e) {
			tip.showErrorTip(util.i18n('cantWriteFile'));
			return false;
		}
	},

    /**
     * 批量启用/禁用
     */
    _batchCheck = function(enables, disables) {
        if (_saveData()) {
            enables && enables.trigger('checkon');
            disables && disables.trigger('checkoff');
        }
    };

	/**
	 * 筛选当前标签页的绑定
	 */
	filterCurrentTab = function() {
		util.getCurrentTab(function(tab) {

			var hostname = util.findHostname(tab.url);
			if (hostname) {
				var data = biz.loadData(),
				i, sum, toHide;
				for (i in data) {
					toHide = $();
					sum = data[i].traverse(function() {
						if (this.hostname != hostname) {
							toHide = toHide.add(this.target);
						}
					});
					if (sum == toHide.length) {
						data[i].target.closest('.block').addClass('hidden');
					} else {
						toHide.addClass('hidden');
					}
				}
				_mark('currentTab', '1');
				data = null;
			}
		});
	},

	/**
	 * 筛选当前工程的组
	 */
	filterCurrentProject = function(project) {
		var data = biz.loadData(), i;
		for (var i in data) {
			if (i.indexOf('==@') != -1
					&& i.split('==@')[1].indexOf(project) != -1) {
				data[i].target.closest('.block').removeClass('hidden');
			} else {
				data[i].target.closest('.block').addClass('hidden');
			}
		}
		_mark('currentProject', project);
	},

	/**
	 * 组筛选初始化
	 */
	groupFilterInit = function(projs) {
		var selected = _mark('currentProject'),
		select, i;
		if (!$.isEmptyObject(projs)) {
			select = $('select');
			if (select.length == 0) {
				select = $('<select>');
				select.change(function() {
					_mark('currentTab', '');
					if (this.selectedIndex) {
						filterCurrentProject(this.options[this.selectedIndex].text);
					} else {
						_mark('currentProject', '');
						$('#content .hidden').removeClass('hidden');
					}
				});
				$('#groupFilter').html(select);
			}
			select.html('<option>' + util.i18n('allProjects') + '</option>');
			for (i in projs) {
				if (selected == i) {
					select.append('<option selected="selected">' + i + '</option>');
				} else {
					select.append('<option>' + i + '</option>');
				}
			}
		} else {
			$('#groupFilter').html(util.i18n('groupFilter'));
		}
	},

	/**
	 * 切换启用/禁用按钮
	 */
	exports.check = function(target) {
		var node = target.closest('.node');
		if (node.hasClass('group')) {
			try {
                //_batchCheck保存到文件
				biz.checkGroup(node, _batchCheck);
			} catch (e) {
				tip.showErrorTip(util.i18n('duplicates'));
			}
		} else {
            //console.log('view.js exports.check : ', node, _batchCheck);
            //_batchCheck保存到文件
            //biz.js中的checkLine:切换行的状态,并且执行回调_batchCheck
            //entry = node.data('target')
			biz.checkLine(node, _batchCheck);
		}
	};

	/**
	 * 添加组
	 */
	exports.addGroup = function(target, line) {

		var fields = biz.editFields({
			addr: '127.0.0.1',
			hostname: '',
			comment: ''
		});
		if (!line) { // 新组
			fields = biz.editFields({
				line: line || util.i18n('newGroup')
			}).concat(fields);
		}
		editor.show(target.data('title'), fields, function(err, data) {
			if (err) { // 输入校验
				tip.showErrorTip(err);
			} else {
				if (line) { // 新项已有所属组
					data.line = line;
				}
				biz.addGroup(data);
				_saveData();
				setTimeout(function() {
					exports.refresh(false);
				}, 0);
				editor.hide();
			}
		});
	};

	/**
	 * 添加行
	 */
	exports.addLine = function(target) {
		var node = target.closest('.node'),
		line = node.data('target').line;
		exports.addGroup(target, line);
	};

	/**
	 * 编辑按钮
	 */
	exports.edit = function(target) {
		var data = target.closest('.node').data('target');
        //console.log('exports.edit data : ', data);
		var fields = biz.editFields(data);

		editor.show(target.data('title'), fields, function(err, nData) {
			if (err) { // 输入校验
				tip.showErrorTip(err);
			} else {
				var render = data.addr ? lineRender : groupRender,
				node = null;
				for (var i in nData) { // 新值覆盖
					data[i] = nData[i];
				}
				node = $(render.render(data));
				data.target.replaceWith(node);
				data.setTarget(node);
				_saveData() && editor.hide();
			}
		});
	};

	/**
	 * 删除按钮
	 */
	exports.remove = function(target) {
		tip.showInfoTip(target.data('title') + '?', function() {
			var data = target.closest('.node').data('target');
			if (!data.addr) {
				delete biz.loadData()[data.line];
			}
			data.delink();
			_saveData();
			target.trigger('remove');
		});
	};

	/**
	 * 展开/收缩按钮
	 */
	exports.expand = function(target) {
		if (!target.hasClass('lock')) {
			target.addClass('lock');
            if (target.hasClass("changeAll")) {
                //展开/收起所有
                var collapse = target.hasClass('collapse');
                var groups = $(".group");;
                if (!collapse) {
                    groups.next().show();
                    target.data("title", "收起所有");
                    $(".expand").removeClass('expand lock').addClass('collapse');
                }
                else {
                    groups.next().hide();
                    target.data("title", "展开所有");
                    $(".collapse").removeClass('collapse lock').addClass('expand');
                }
            }
            else {
                var group = target.closest('.group'),
                    collapse = target.hasClass('collapse');
                group.data('target').hide = collapse;
                if (_saveData()) {
                    if (collapse) { // 收缩已经展开的
                        group.next().slideUp(function() {
                            target.removeClass('collapse lock').addClass('expand');
                        });
                    } else { // 展开已经收缩的
                        group.next().slideDown(function() {
                            target.removeClass('expand lock').addClass('collapse');
                        });
                    }
                }
            }
		}
	};

	/**
	 * 链接按钮
	 */
	exports.link = function() {
		var val = $('#hostsPath').val();
		if (!val) {
			tip.showErrorTip(util.i18n('blankPath'));
		} else if (!util.fileExists(val)) {
			tip.showErrorTip(util.i18n('fileNotExist'));
		} else if (util.isDirectory(val)) {
			tip.showErrorTip(util.i18n('noDirectory'));
		} else {
			chrome.tabs.create({
				url : 'file:///' + val.replace(/\\/g, '/')
			});
		}
	};

	/**
	 * 渲染头
	 */
	exports.renderHead = function() {
		$('#content').before(headRender.render({
			version: biz.getVersion(),
			hostsPath: biz.getHostsPath()
		}));
	};

    /**
     * 文件拖拽上传
     */
    exports.renderDropUpload = function() {
        var _uploadFunc = function(resultText, dropTargetEl) {

            //console.log('view.js resultText : ', resultText);
            resultText = $.trim(resultText) || '';

            if(!resultText) {return;}

            var $target = $(dropTargetEl),
                groupName = '新的host组';

            //判断是否在组内拖拽,如果是,则取组名
            if($target.length) {
                var $group = $target.closest('.j-group-item').find('.group');
                if($group.length) {
                    groupName = $group.data('target') && $group.data('target').line || groupName;
                }
            }

            //解析数据
            biz.parseData(resultText, null, groupName);
            //保存数据
            _saveData();
            //刷新列表
            exports.refresh(false);
        };

        $.each(['dragWrapper'], function(i, v){
            new Drop({
                elId : v,
                uploadFunc : _uploadFunc
            });
        });
    };

	/**
	 * 刷新数据
	 */
	exports.refresh = function(refresh, cacheType) {

        //默认从storage中获取数据
        cacheType = cacheType || 'hosts';

//		var val = $('#hostsPath').val();
//		if (!val) {
//			tip.showErrorTip(util.i18n('blankPath'));
//		} else if (!util.fileExists(val)) {
//			tip.showErrorTip(util.i18n('fileNotExist'));
//		} else if (util.isDirectory(val)) {
//			tip.showErrorTip(util.i18n('noDirectory'));
//		} else {
			try {
				//biz.setHostsPath(val);
                //从hosts文件读取数据或者从model中读取缓存数据
				var data = biz.loadData(cacheType),
                //主要内容的容器
                content = $('#content').html(''),

				blocks = $('<ul class="blocks clearfix"></ul>'),
				projs = {},
				block, lines, i;

                //console.log('view.js exports.refresh data : ', cacheType, data);
				if (data.error) {
					tip.showErrorTip(util.i18n(data.error));
					delete data.error;
				}

				for (i in data) {
					block = $('<li class="block j-group-item"></li>').appendTo(blocks);
					data[i].setTarget($(groupRender.render(data[i])).appendTo(block));
					lines = $('<ul>').appendTo(block);
					data[i].hide && lines.hide();
                    //这步把entry绑定到dom元素上
					data[i].traverse(function() {
						this.setTarget($(lineRender.render(this)).appendTo(lines));
					});
					if (i.indexOf('==@') != -1) {
						projs[$.trim(i.split('==@')[1])] = true;
					}
				}

                //console.log('view.js data is the same : ', data === biz.getData('data'));

				content.append(blocks);
                blocks.css('display', 'block');

				groupFilterInit(projs);
				if (_mark('currentTab')) {
					filterCurrentTab();
				} else if (_mark('currentProject')) {
					filterCurrentProject(_mark('currentProject'));
				}

				if (refresh !== false) {
					tip.showInfoTip(util.i18n('loadSuccess'));
				}
			} catch (e) {
				tip.showErrorTip(util.i18n('cantReadFile'));
			}
//		}
	};

    /**
     * 强制从hosts文件加载
     */
    exports.hostsRefresh = function(refresh) {
        if(window.confirm('确定要从hosts文件中重新载入?\n这个操作会导致当前hosts被覆盖.')){
            exports.refresh(refresh, 'hosts');
        };
    };

    /**
     * 强制从localStorage加载
     * @param refresh
     */
    exports.storageRefresh = function(refresh) {
        exports.refresh(refresh, 'storage');
    }

	/**
	 * 备份数据
	 */
	exports.backup = function(target) {
		if (biz.canWrite()) {
			editor.show(util.i18n('copyMe'), [{
				label: '&nbsp;',
				name: 'copyMe',
				type: 'textarea',
				value: biz.loadContent()
			}], function() {
				editor.hide();
			});
			return;
		}
		editor.show(util.i18n('backupPath'), [ {
			label: '{{:backupPath}}',
			name: 'path',
			value: $('#hostsPath').val()
		} ], function(err, data) {
			if (!data.path) {
				tip.showErrorTip(util.i18n('blankPath'));
			} else if (util.fileExists(data.path)) {
				tip.showInfoTip(util.i18n('overwrite'), function() {
					_saveData(data.path);
					editor.hide();
				});
			} else if (util.isDirectory(data.path)) {
				tip.showErrorTip(util.i18n('noDirectory'));
			} else {
				_saveData(data.path) && editor.hide();
			}
		});
	};

	/**
	 * 滚动阴影效果
	 */
	exports.scroll = function(target) {
		clearTimeout(target.data('timeout'));
		target.data('timeout', setTimeout(function() {
			target.removeClass('scroll-top scroll-bottom');
		}, 1000));
		if (target.scrollTop() < target.data('scroll')) { // top
			target.addClass('scroll-bottom').removeClass('scroll-top');
		} else if (target.scrollTop() > target.data('scroll')) { // bottom
			target.addClass('scroll-top').removeClass('scroll-bottom');
		}
		target.data('scroll', target.scrollTop());
	};

	/**
	 * 显示当前路径的绑定
	 */
	exports.current = function() {

        var data = biz.getData('data'),
            i, sum, toHide;
        var isHiddenDisable = _mark('isHiddenDisable');

        if (!isHiddenDisable) {
            for (i in data) {
                toHide = $();
                sum = data[i].traverse(function() {

                    if (!this.enable) {
                        toHide = toHide.add(this.target);
                        this.toHide = true;
                    }
                });
                if (sum == toHide.length) {
                    data[i].target.closest('.block').addClass('hidden');
                } else {
                    toHide.addClass('hidden');
                }
            }
            _mark('isHiddenDisable', true);
        }
        else {
            exports.refresh(false, 'hosts');
            _mark('isHiddenDisable', false);
        }


        data = null;

	};

	/**
	 * 编辑取消
	 */
	exports.olCancel = function() {
		editor.hide();
		exports.close();
	};

	/**
	 * 显示当前tab的IP
	 */
	exports.showCurrentIP = function() {
		util.getCurrentTab(function(tab) {
			var ip = biz.getIP(tab.id);
			ip && $('#currentIP').html(util.i18n('currentTabIP') + ip);
		});
	};
    /*
    * 批量编辑功能
    * 分两种：一种是编辑所有host，一种是编辑当前分组的host
    * */
    exports.editAsFile = function(target) {

        var node = target.closest('.node');
        var line = '';
        var title = util.i18n('editAsFile');
        var value;
        //如果是组内导入
        if (node.hasClass('group')) {
            var data = biz.loadData();
            line =  node.data('target').line;
            title += "(组" + node.data('target').line + ")";
            value = data[line] && data[line].toString();
        }
        else {

            value = biz.readFile( biz.getHostsPath() );
        }
        editor.show(title, [{
            label: util.i18n('editAsFile'),
            name: 'editAsFile',
            type: 'textarea',
            value: value
        }],function(err, data) {
            //console.log('view.js exports.imports : ', data, err);
            //data.imports就是导入的内容.

            var fragment = $.trim(data.editAsFile) || '';
//            if (fragment) {
                //如果是组内导入
                if (node.hasClass('group')) {
                    var data = biz.getData('data');

                    data[line] =  new Entry(line); //清除原数据
                    biz.parseData(fragment, null, line);
                }
                //如果是全局导入
                else {
                    biz.parseData(fragment, {});
                }

                _saveData();

                exports.refresh(false);
//            }
            editor.hide();
        });
    }
 	/**
	 * 导入功能,多行hosts数据
     * 分两种:一种是页面顶部的全局导入,另外一种是导入到组内
	 */
	exports.imports = function(target) {

		var node = target.closest('.node');
		editor.show(target.data('title'), [{
			label: target.data('title'),
			name: 'imports',
			type: 'textarea'
		}],
        //data : {imports: "127.0.0.3 localhost"}
        function(err, data) {
            //console.log('view.js exports.imports : ', data, err);
            //data.imports就是导入的内容.
			var fragment = $.trim(data.imports) || '';
			if (fragment) {
                //如果是组内导入
				if (node.hasClass('group')) {
					biz.parseData(fragment, null, node.data('target').line);
				}
                //如果是全局导入
                else {
					biz.parseData(fragment);
				}

				_saveData();

				exports.refresh(false);
			}
			editor.hide();
		});
	};

	/**
	 * 编辑保存
	 */
	exports.olSave = editor.save;

	/**
	 * 按钮文字提示
	 */
	exports.showTip = tip.showTip;

	/**
	 * 确认提示
	 */
	exports.confirm = tip.confirm;

	/**
	 * 关闭提示
	 */
	exports.close = tip.close;

});
