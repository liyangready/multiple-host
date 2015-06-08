/**
 * 初始化页面
 */
define(function (require, exports) {
    'require:nomunge,exports:nomunge,module:nomunge';

    // 视图逻辑
    var view = require('./handle/view.js');

    // 渲染头
    view.renderHead();
    view.renderDropUpload();

    // 绑定事件
    require('./bind.js');

    // 刷新数据
    view.refresh(false, 'hosts');

    // 显示当前tab的IP
    view.showCurrentIP();

    require('./util/open.js');
});