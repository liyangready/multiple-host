/**
 * 数据模型
     data格式为:
     data = {
        //组名
        "user center" : {
            //组没有地址属性(一律为空)
            addr : "",
            //描述注释
            comment : "",
            //true是启用,false是不启用
            enable : false,
            hide : false,
            //主机名,组时为空
            hostname : "",
            //组名
            line : "user center",
            //下一个元素,如果出现循环,例如this.next==this自身,那就说明没有下一个元素了.
            next : Entry对象
        },
        "dev" : {

        }
     };

 //Entry对象格式为:
 {
    addr : "",
    comment : "",
    enable : false,
    hide : false,
    hostname : "",
    line : "user center",
    next : Entry对象
    }

 导入数据的格式:
     # user center //这是组名
     #192.168.235.63    l-api.user.qunar.com # 单条注释注释注释注释 //注意,这里的#后表示单条注释
     #192.168.235.63    api.user.qunar.com

     # dev //这是组名
     #192.168.237.71    simg2.qunarzz.com
     #192.168.237.71    simg1.qunarzz.com

     # test==@qzz //这是工程名,其中test是工程名,==@是分隔符,分隔符之后为组名
     #127.0.0.2	   qunarzz.com

     # test==@fekit //这是工程名,其中test是工程名,==@是分隔符,分隔符之后为组名
     #127.0.0.2    qunarzz.com
     #192.168.237.73	qunarzz.com
     #192.168.237.74	qunarzz.com
     #192.168.235.63	l-api.user.qunar.com
 **/
define(function (require, exports) {
    'require:nomunge,exports:nomunge,module:nomunge';

    //console.log('model.js --> chrome --> ', chrome);
    //console.log('model.js --> chrome.extension --> ', chrome.extension);

    // 后台页数据模型
    //var model = chrome.extension.getBackgroundPage().model,
    var BackModel = require('../util/back.js').BackModel,

        // 工具集
        util = require('../util/util.js'),

        // 结点
        Entry = require('./entry.js'),

        /**
         * 使用代理让变更立即生效
         */
        _doProxy = function (array) {
            if(chrome && chrome.proxy && chrome.proxy.settings && chrome.proxy.settings.set) {
                var script = '', i;
                for (i = 0; i < array.length; i++) {
                    script += '}else if(host=="' + array[i].hostname + '"){';
                    script += 'return "PROXY ' + array[i].addr + ':80; DIRECT";';
                }
                chrome.proxy.settings.set({
                    value: {
                        mode: 'pac_script',
                        pacScript: {
                            data: 'function FindProxyForURL(url,host){if(shExpMatch(url,"http:*")){if(isPlainHostName(host)){return "DIRECT";' +
                                script + '}else{return "DIRECT";}}else{return "DIRECT";}}'
                        }
                    },
                    scope: 'regular'
                }, $.noop);
            }
        },

        manifest = {
            version : '0.3.5'
        };

    // 加载manifest.json文件
    /**
    $.ajax({
        async: false,
        dataType: 'json',
        success: function (data) {
            manifest = data;
        },
        url: './manifest.json'
    });
     **/

    /**
     * 存储数据
     */
    exports.put = BackModel.put;

    /**
     * 获取数据
     */
    exports.get = BackModel.get;

    /**
     * 删除数据
     */
    exports.remove = BackModel.remove;

    /**
     * 添加组
     */
    exports.addGroup = function (groupData) {
        var data = BackModel.get('data') || exports.loadData(),
            group = data[groupData.line] || new Entry(groupData.line),
            entry = new Entry();
        data[groupData.line] = group;
        group.enable = false;
        entry.enable = false;
        entry.comment = groupData.comment;
        entry.addr = groupData.addr;
        entry.hostname = groupData.hostname;
        group.link(entry);
    };

    /**
     * 从hosts文件加载内容
     */
    exports.loadContent = function (cacheType) {
        var hostPath = exports.getHostsPath(),
            content = BackModel.readFile(hostPath, cacheType);
        return content;
        //C:\Windows\system32\drivers\etc\hosts
        //console.log('exports.loadContent, hostPath : ', hostPath);
        //console.log('exports.loadContent, content : ', content);
    };

    /**
     * 从localStorage或者hosts文件中加载数据
     */
    exports.loadData = function (cacheType) {
        //看exports.loadContent中关于content的定义

        var content = exports.loadContent(cacheType),
            data = {},
            i, c;

        //console.log('exports.loadData content : ', content);
        if (content) {
            for (i = 0; i < content.length; i++) { // 扫描非utf8字符
                c = content.charAt(i);
                if (c == '\ufffc' || c == '\ufffd') {
                    data.error = 'unknownChar';
                    break;
                }
            }
            exports.parseData(content, data);
        } else {
            BackModel.put('data', {});
        }

        return data;
    };

    /**
     * 解析数据
     */
    exports.parseData = function (dataStr, data, group) {
        var content = dataStr.split(/\r?\n/),
            //优先使用传入的data
            //如果没有data,则从model中去取
            //如果没有data,则从hosts文件中导入
            //必须是这个顺序,因为还存在导入,导入是依赖于当前缓存的data基础之上
            data = data || BackModel.get('data') || exports.loadData(),
            i, c, d, entry;

        //类似这样的数组:['# user center', '192.168.235.63 user.qunar.com', '192.168.235.63 headshot.user.qunar.com']
        //console.log('exports.parseData content : ', content, content.join(','));
        for (i = 0; i < content.length; i++) {
            entry = new Entry();
            if (entry.analysis(content[i])) { // 是合法记录
                //组名,例如"# dev",那组名就是"dev"
                c = group || util.i18n('defaultGroup');
                //console.log('c : ' , c);
                //组名的第一位不能是"@"
                d = c.charAt(0) == '@' ? c.substring(1) : c;
                //console.log('d : ' , d);
                data[d] = data[d] || new Entry(c);

                data[d].link(entry);
            } else { // 是注释或空行
                group = entry.line;
            }
        }
        //每个data是名字=Entry对象的键值对
        //console.log('exports.parseData data : ', data);
        for (i in data) {
            if (i != 'error') {
                data[i].checkEnable();
            }
        }
        //执行绑定操作
        BackModel.put('data', data);

        return data;
    };

    /**
     * 保存数据到指定文件
     */
    exports.saveData = function (file) {
        var data = BackModel.get('data'),
            method = BackModel.get('method'),
            array = [],
            content = '', i;

        //console.log('model.js exports.saveData : ', method, data);
        if (method == 'clearCache') {
            for (i in data) {
                //调用的是Entry的toString()
                content += data[i].toString();
            }
            //如果file文件路径为空,则取默认的文件路径
            BackModel.saveFile(file || exports.getHostsPath(), content);

            setTimeout(function () {
                bm.clearCache();
                bm.clearHostResolverCache();
                bm.clearPredictorCache();
                bm.closeConnections();
            }, 0);
        }
        //启用/关闭代理
        else if (method == 'useProxy') {
            //console.log('model.js exports.saveData content : ', data);
            //每个元素都是一个entry
            for (i in data) {
                content += data[i].toString();
                data[i].pushEnables(array);
            }

            //console.log('model.js exports.saveData content : ', content, data);
            //如果file文件路径为空,则取默认的文件路径
            BackModel.saveFile(file || exports.getHostsPath(), content);

            _doProxy(array);

        } else {
            for (i in data) {
                content += data[i].toString();
            }
            BackModel.saveFile(file || exports.getHostsPath(), content);
        }
    };

    /**
     * 设置hosts文件路径
     */
    exports.setHostsPath = function (path) {
        BackModel.put('hostFilePath', path);
    };

    /**
     * 获取hosts文件路径(优先手动设置的值,其次默认值)
     */
    exports.getHostsPath = function () {
        //var hostsPath = BackModel.get('hostsPath') || BackModel.getHostsPath();
        var hostsPath = BackModel.getHostsPath();
        //console.log('exports.getHostsPath hostsPath : ', hostsPath, BackModel.getHostsPath());
        return hostsPath;
    };

    /**
     * 获取版本号
     */
    exports.getVersion = function () {
        return manifest.version;
    };

});