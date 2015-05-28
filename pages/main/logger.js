/**
 * Created by leon.li on 2015/5/28.
 */
var _cache = {};

function logger(level, text) {
    var window = global.window;
    var $ = window.$;
    var times, _html;

    if ( _cache[text] ) {
        _cache[text]["times"]++;
        _cache[text].node.find(".log-times").html( _cache[text]["times"] );
        _cache[text].node.find(".logTime").html( (new Date()).getHours() + ":" + (new Date()).getMinutes() + ":" + (new Date()).getSeconds() );
    }
    else {
        _html = [
                '<p class="' + level + ' logItem">',
                '<span class="log-times">'+ 1 + '</span>',
            '<span class="logText">',
            text,
            '</span>',
            '<span class="logTime">',
            (new Date()).getHours() + ":" + (new Date()).getMinutes() + ":" + (new Date()).getSeconds(),
            '</span></p>'
        ].join('');
        _cache[text] = {
            node: $(_html),
            times: 1
        }

        $(".js-log").append(_cache[text]["node"]);
    }

}

window.logger = logger;