/**
 * author : wonkzhang
 * date : 20150513
 */
define(function (require, exports, module) {
    'require:nomunge,exports:nomunge,module:nomunge';

    var Drop = function (args) {
        this.args = this.extend({}, {
            elId : 'dropUploadArea',
            uploadFunc : function(resultText, dropTargetEl) {}
        }, args);

        this.build();
        this.initHandlers();
    };

    Drop.prototype.build = function() {
        this.$dropArea = document.getElementById(this.args.elId);
        this.dclass = this.$dropArea.className;
        this.filesList = [];
        this.maxFilesNum = 5;
        //256kb
        this.maxFileSize = '262144';

        this.$canvasW = document.getElementById('_d_canvas_w');
        this.$canvas = this.$canvasW.querySelector('canvas');
        this.context = this.$canvas.getContext('2d');

        this.$dropTarget = null;
    };

    Drop.prototype.initHandlers = function () {
        //鼠标进入
        this.$dropArea.addEventListener('dragenter', this.proxy(this.handlerDragenter, this), false);
        //鼠标移动(over)执行
        this.$dropArea.addEventListener('dragover', this.proxy(this.handlerDragover, this), false);
        //释放鼠标执行
        this.$dropArea.addEventListener('drop', this.proxy(this.handlerDrop, this), false);
    };

    Drop.prototype.handlerDragenter = function(e) {
        e.stopPropagation();
        e.preventDefault();
        //console.log(arguments)//e
        this.$dropTarget = e.target;
        this.$dropArea.className = this.dclass + ' hover';
    };

    Drop.prototype.handlerDragover = function (e) {
        e.stopPropagation();
        e.preventDefault();
    };

    Drop.prototype.handlerDrop = function (e) {
        e.stopPropagation();
        e.preventDefault();
        //console.log('handlerDrop : ', arguments);
        this.$dropArea.className = this.dclass;
        this.process(e.dataTransfer.files);
    };

    Drop.prototype.process = function (filesList) {
        if (!filesList || !filesList.length || this.filesList.length) {
            return;
        }
        for (var i = 0, l = filesList.length, size; i < l; i++) {
            size = filesList[i].size;
            //256kb
            if(size < this.maxFileSize) {
                this.filesList.push(filesList[i]);
                this.totalSize += filesList[i].size;
                if(this.filesList >= this.maxFilesNum) {
                    break;
                }
            }
        }

        this.uploadBegin();
    };

    Drop.prototype.uploadBegin = function() {
        if(!this.filesList.length) {
            return;
        }
        this.showCanvas();
        this.upload(this.filesList.shift());
    };

    Drop.prototype.updateComplete = function(result) {
        this.args.uploadFunc.call(self, result, this.$dropTarget);
        this.filesList.length && this.uploadBegin();
    };

    Drop.prototype.upload = function(file) {
        var reader = new FileReader(),
            self = this;

        //开始读取
        reader.onloadstart = function() {
            //console.log('开始读取文件...');
        };

        //正在读取
        reader.onprogress = function() {
            //console.log(arguments);
        };

        //成功读取
        reader.onload = function() {
            //console.log('读取文件结束...');
            //console.log('上传内容为 : ', this.result);
            self.simulateProgress();
            self.updateComplete(this.result);
        };

        //读取完成:无论成功失败
        reader.onloadend = function() {

        };

        reader.readAsText(file);
    };

    Drop.prototype.proxy = function (fn, context) {
        var args = [].slice.call(arguments, 2);
        return function () {
            return fn.apply(context || this, args.concat([].slice.call(arguments)))
        };
    };

    Drop.prototype.extend = function() {
        var firstObj = arguments[0] || {};
        for(var i = 1, l = arguments.length; i < l; i ++) {
            if(arguments[i]) {
                for(var j in arguments[i]) {
                    firstObj[j] = arguments[i][j];
                }
            }
        }
        return firstObj;
    };

    Drop.prototype.showCanvas = function() {
        this.$canvasW.style.display = 'block';
    };

    Drop.prototype.hideCanvas = function() {
        this.$canvasW.style.display = 'none';
    };

    Drop.prototype.simulateProgress = function() {
        var self = this;
        var i = 0;
        var interval = window.setInterval(function(){
            if(i > 1) {
                window.clearInterval(interval);
                interval = null;
                return;
            }
            i += 0.2;
            self.drawProgress(i);
        }, 100);
    };


    Drop.prototype.drawProgress = function(progress) {
        var self = this,
            context = this.context,
            canvas = this.$canvas,
            totalProgress = Math.floor(progress*100);

        var _clear = function() {
            context.clearRect(0, 0, canvas.width, canvas.height);
        };

        if(totalProgress >= 100) {
            window.setTimeout(function(){
                _clear();
                self.hideCanvas();
            }, 2000);
            totalProgress = 100;
        }

        _clear();

        context.beginPath();
        context.strokeStyle = '#4B9500';
        context.fillStyle = '#4B9500';
        context.fillRect(0, 0, progress * 500, 20);
        context.closePath();
        context.font = '16px Verdana';
        context.fillStyle = '#000';
        context.fillText('上传进度: ' + totalProgress + '%', 180, 15);
    };

    module.exports = Drop;
});