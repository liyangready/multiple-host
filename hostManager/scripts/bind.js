/**
 * 事件绑定
 */
define(function (require, exports) {
    'require:nomunge,exports:nomunge,module:nomunge';

    // 视图逻辑
    var view = require('./handle/view.js');

    $('body')
        //更改hosts地址


        // 组高亮
        .on('mouseenter mouseleave', '.group', function (evt) {
            $(this).parent()[evt.type == 'mouseenter' ? 'addClass' : 'removeClass']('hover');
        })

        // 文字提示
        .on('mousemove mouseout', 'span[data-title]', function (evt) {
            view.showTip(evt);
        })

        // 按钮点击
        .on('click', 'span[data-handle]', function (evt) {
            var target = $(evt.target);
            view[target.data('handle')](target);
        })

        // 对行内非按钮区域的点击绑定到启用按钮上
        .on('click', '.node', function (evt) {
            !evt.target.getAttribute('data-handle') && view.check($(this).find('span[data-handle="check"]'));
        })

        // 编辑取消
        .on('click', '#mask', function (evt) {
            evt.target.id == 'mask' && view.olCancel();
        })

        /********** 以下为自定义事件 **********/

        // "启用/禁用"事件
        .on('checkon checkoff', '.node', function (evt) {
            $(this).find('span[data-handle="check"]').removeClass('checkon checkoff').addClass(evt.type);
        })

        // "删除"事件
        .on('remove', '.node', function (evt) {
            var $this = $(this);
            if ($this.hasClass('group')) {
                $this.closest('.block').remove();
            } else {
                $this.remove();
            }
        })

        // 禁用右键
        .on('contextmenu', function () {
            return false;
        });

    // 滚动特效
    $('#content').bind('scroll', function () {
        if (this.scrollHeight > this.clientHeight) { // 出现滚动条
            view.scroll($(this));
        }
    });

    $("#hostsToUpload").on("change", function(evt){
        if (evt.target.value) {
            $("#hostsPath").val(evt.target.value);
            $("#hostsPath").attr("value", evt.target.value);
        }
    });
});
