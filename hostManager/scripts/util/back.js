/**
 * add by wonk :
 * 速配node
 * 首先检查是否能直接用node,不能用node的,就用npapi,都不能用,再用localStorage
 * @type {null}
 */
var NodeFs = null;
var path = require("path");
var execPath = path.dirname( process.execPath );

var defaultHost = path.join(execPath , "/hosts");


if (typeof require === 'function') {
    NodeFs = require('fs');
}

/**
 * 首先检查是否能直接用node,不能用node的,就用npapi,都不能用,再用localStorage
 */
define(function (require, exports) {
    'require:nomunge,exports:nomunge,module:nomunge';

    var Config = require('./config.js');
    
    //hosts默认地址
    var HostsAddr = Config.HostsAddr || {};

    //此文件用到的缓存类
    var _CacheData = {};

    //npapi embed对象,在chrome插件中,会用到
    //在node环境下,不会用到
    var _Embed = NodeFs ? null : (function () {
        var embed = document.createElement('embed');
        embed.type = 'application/x-npapi-file-io';
        document.getElementsByTagName('body')[0].appendChild(embed);
        return embed;
    }());


    if(NodeFs) {
        HostsAddr.windows =  localStorage.getItem("hostFilePath") || 'host.txt';
    }

    // 数据模型
    var BackModel = {
        /**
         * 存储数据
         */
        put: function (key, value) {
            if (typeof value == 'string') {
                localStorage.setItem(key, value);
            } else {
                _CacheData[key] = value;
            }
        },

        /**
         * 获取数据
         */
        get: function (key) {
            return _CacheData[key] || localStorage.getItem(key);
        },

        /**
         * 删除数据
         */
        remove: function (key) {
            delete _CacheData[key];
            localStorage.removeItem(key);
        },

        /**
         * 获取hosts文件路径
         */
        getHostsPath: function () {

            try {
                if(_Embed && _Embed.getPlatform) {
                    var _p = _Embed.getPlatform();
                    if(_p == 'windows') {
                        return HostsAddr.windows;
                    }
                    if(_p == 'mac') {
                        return HostsAddr.mac;
                    }
                    return HostsAddr.others;
                }
            } catch (e) {
                if (BackModel.get('writeStorage') == '0') {
                    throw e;
                }
            }

            var path = BackModel.get("hostFilePath") || defaultHost;
            return path;
        },

        /**
         * 保存文件
         * @param file
         * @param content
         */
        saveFile: function (file, content) {
            try {
                if(_Embed && _Embed.saveTextFile) {
                    _Embed.saveTextFile(file, content);
                } else if(NodeFs) {
                    NodeFs.writeFileSync(file, content, 'utf-8');
                }
            } catch (e) {
                if (BackModel.get('writeStorage') == '0') {
                    throw e;
                }
                localStorage.setItem('f:' + file, content);
            }
        },

        /**
         * 读取文件
         * @param file
         */
        readFile: function (file, cacheType) {

            cacheType = cacheType || 'hosts';

            if (cacheType === 'storage' && BackModel.get('writeStorage') == '1' && localStorage.getItem('f:' + file)) {
                return localStorage.getItem('f:' + file);
            }

            try {
                if(_Embed && _Embed.getTextFile) {
                    return _Embed.getTextFile(file);
                }
                if(NodeFs) {
                    return NodeFs.readFileSync(file, "utf-8");
                }
            } catch (e) {
                if (BackModel.get('writeStorage') == '0') {
                    throw e;
                }
                return localStorage.getItem('f:' + file) || '';
            }
        },

        /**
         * 清本地文件存储`
         */
        clearStorage: function () {
            var keys = [], i;
            for (i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (/^f:/.test(key)) {
                    keys.push(key);
                }
            }
            for (i = 0; i < keys.length; i++) {
                localStorage.removeItem(keys[i]);
            }
        }
    };

    // 工具集
    var BackUtil = {

        /**
         * 判断文件是否存在
         */
        fileExists: function (file) {
            try {
                return _Embed.fileExists(file);
            } catch (e) {

                if (NodeFs) {
                    return NodeFs.existsSync(file);
                }

                return true;
            }
        },

        /**
         * 判断文件是否是目录
         */
        isDirectory: function (file) {
            try {
                return _Embed.isDirectory(file);
            } catch (e) {

                if (NodeFs) {
                    var stat = NodeFs.lstatSync(file);
                    return stat.isDirectory();
                }

                return false;
            }
        }
    };

    var _initWhenLoad = function (BackModel, cacheData) {
        // 设置状态的初始值

        var method = BackModel.get('method'),
            openFlag = false;
        if (typeof(chrome) != "undefined" && chrome.benchmarking) {
            BackModel.put('benchmarking', '1');
        } else {
            BackModel.put('benchmarking', '0');
            if (method == 'clearCache') {
                method = null;
            }
        }
        BackModel.put('method', method || 'useProxy');
        if (!BackModel.get('showIP')) {
            BackModel.put('showIP', '1');
            openFlag = true;
        }
        if (!BackModel.get('writeStorage')) {
            BackModel.put('writeStorage', '1');
            openFlag = true;
        }

        if(NodeFs) {
            BackModel.put('writeStorage', '0');
        }

        ////////////////////////////////////////////
        //速配nw
        if (typeof(chrome) != "undefined" && chrome.webRequest && chrome.tabs) {

            if (openFlag) {
                chrome.tabs.create({
                    url: 'option.html'
                });
            }

            // 获取实际访问的IP放入缓存
            chrome.webRequest.onCompleted.addListener(function (details) {
                cacheData[details.tabId] = details.ip;
                if (BackModel.get('showIP') != '1') {
                    return;
                }
                chrome.tabs.executeScript(details.tabId, {
                    code: '(function(ip){\
					if(ip){\
						ip.innerHTML="' + details.ip + '";\
					}else{\
						ip=document.createElement("div");\
						ip.innerHTML="' + details.ip + '";\
						ip.id="chrome-hosts-manager-ipaddr";\
						ip.title="' + chrome.i18n.getMessage('currentTabIP') +
                        chrome.i18n.getMessage('clickToHide') + '";\
						document.body.appendChild(ip);\
						ip.addEventListener("click",function(){\
							\ip.parentNode.removeChild(ip);\
						});\
					}\
				})(document.getElementById("chrome-hosts-manager-ipaddr"))'
                });
                chrome.tabs.insertCSS(details.tabId, {
                    file: '/styles/inject.css'
                });
            }, {
                urls: [ 'http://*/*', 'https://*/*' ],
                types: [ 'main_frame' ]
            });

            // 关闭tab时消除缓存
            chrome.tabs.onRemoved.addListener(function (tabId) {
                delete cacheData[tabId];
            });
        }
    };

    _initWhenLoad(BackModel, _CacheData);

    exports.BackModel = BackModel;
    exports.BackUtil = BackUtil;
});