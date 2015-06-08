/**
 * add by wonk :
 * 配置文件
 * 把一些常用的配置内容都放到这里来
 * 如果是chrome插件模式,还可以在option页面中去配置
 */
define(function(require, exports, module){
    'require:nomunge,exports:nomunge,module:nomunge';
    var Config = (function(){

        var Config = {};

        //"windows": "E:\\wonkzhang\\workspace\\chrome\\chrome-hosts-manager\\main\\hosts",

        $.ajax({
            url: './config.json',
            async: false,
            dataType: 'json',
            success: function (data) {
                Config = data;
            },
            error : function() {
                console.log(arguments)
            }
        });

        return Config
    }());

    module.exports = Config;
});