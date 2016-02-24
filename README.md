

# Multiple-host

无论你是开发、QA还是产品，在目前的开发及测试中都离不开host。host为开发和测试带来了诸多便利，但也有很多烦恼：

+ 切换host总是不能立即生效，换一套host环境经常需要重启浏览器。
+ 经常在一套host环境下比如（betaA）想对比一下线上的情况，做不到。
+ 由于经常在多套host环境中切换，导致系统host环境乱七八糟，发现问题都不确定到底在哪套环境下。

multiple-host就是为了解决烦人的host问题而诞生的 , 它采用了 **沙箱机制**，在一个独立的浏览器进程中使用host。



+ [它可以做什么](#doWhat)    
  
+ [如何使用](#how)    
  
  ``` 
  - [开始使用](#startUse)    
  - [代理host设置](#proxySetting)    
  - [日志输出](#log)    
  - [设置](#settings)   
  ```
  
+ [常见问题](#questions)
  
  ``` 
  - [和nginx共存](#nginx)
  - [和fiddler共存](#fiddler)
  - [自动更新](#update)
  ```

## <a name="doWhat" id="doWhat"></a>它可以做什么

+ 打开一个使用虚拟host环境的浏览器，不受系统host影响。
+ 改了host刷新就生效，再也不用重启浏览器了。
+ 实时显示当前页面的host情况，在哪套环境下一清二楚。
+ 正常浏览器不受任何影响，从而轻松实现两个浏览器，一个看线上，一个看beta的功能。

效果图：

![](https://raw.githubusercontent.com/liyangready/multiple-host/master/wiki/resource/1.png)

## <a id="how">如何使用</a>

multiple-host是一个应用程序，解压缩点击运行即可。

1 点击![](https://raw.githubusercontent.com/liyangready/multiple-host/master/wiki/resource/3.png)，mac用户是app应用，windows是exe，得到如下运行界面：

![](https://raw.githubusercontent.com/liyangready/multiple-host/master/wiki/resource/2.png)

程序左侧有四个功能：

分别是 [开始使用](#startUse)、[日志输出](#log) 、[代理host设置](#proxySetting)和[程序设置](#settings)

#### <a name="startUse"></a>开始使用

开始就是唤起浏览器的入口，如下展示，当前提供了唤起chrom、唤起firefox和其他浏览的功能。

*chrome*：

比如点击唤起chrome![](https://raw.githubusercontent.com/liyangready/multiple-host/master/wiki/resource/5.png)，会打开一个chrome，在这个chrome中的所有访问都不受系统host影响，只受虚拟host影响，虚拟host的设置在 代理host一栏。同时，你通过正常手段打开的chrome不受这个影响，只受系统host影响，从而你可以给正常chrome配一套host环境，给从程序中打开的chrome配另一套虚拟的host环境。

*firefox*：

打开firefox和打开chrome同理，可以打开一个只受虚拟host影响的firefox。

*ie及其他*：

由于某些原因，不是所有的浏览器都可以实现打开两个互不影响的实例（如ie），而且其实我们也不需要所有的浏览器都要用两套环境去做对比，但是我们想要测试其他浏览器比如ie的时候，也想用虚拟host怎么办？

可以打开系统代理![](https://raw.githubusercontent.com/liyangready/multiple-host/master/wiki/resource/4.png)，让所有的请求都受这个虚拟host的影响，windows用户我提供了一个快捷的方式，可以一键配置和关闭系统host，mac用户由于权限问题，暂时需要自己去 设置。设置了系统代理之后，所有的浏览器都可以享受到虚拟host的配置，而且是事实生效的。

#### <a name="proxySetting"></a>代理host设置

代理host设置我用react写了一个支持[多环境切换的host工具](https://github.com/liyangready/host-manager)，支持筛选、一键启用等功能，从而可以轻松管理虚拟host。

![](https://raw.githubusercontent.com/liyangready/multiple-host/master/wiki/resource/7_1.png)  

![](https://raw.githubusercontent.com/liyangready/multiple-host/master/wiki/resource/6_1.png)

#### <a name="log"></a>日志输出

日志输出用于实时打印当前的host情况，当请求被host处理过时，就会打印出一条日志显示当前请求被指向了哪个host，从而让你清晰的知道当前处于哪套环境。   

![](https://raw.githubusercontent.com/liyangready/multiple-host/master/wiki/resource/8.png)

#### <a name="settings"></a>设置

设置非常简单，如果你的chrome和firefox没有安装在C盘，需要你在设置中调整一下chrome和firefox的启动路径。

如果9393端口被你的其它程序占用，你也可以在设置中更改代理端口。

![](https://raw.githubusercontent.com/liyangready/multiple-host/master/wiki/resource/9.png)

## <a name="questions"></a>常见问题

### <a name="nginx"></a>Q:使用了multiple-host，还想用nginx怎么办？

A: multiple-host根据host转发请求的时候并没有修改http header中的 *Host name*，只是修改了请求的ip，nginx一般是通过host name设置规则，并不受影响。

### <a name="fiddler"></a>Q:使用了multiple-host，还想用fiddler怎么办？

A： multiple-host和fiddler原理一样，都是起了一个代理server转发请求，想要虚拟host生效的同时fiddler也生效，必须实现multiple-host是fiddler的上游，也就是实现 请求-> multiple-host -> fiddler -> server 的链。好在fiddler提供了这样的功能。

使用步骤： 

+ 打开multiple-host的系统代理。
+ 打开fiddler
+ 使用正常浏览器(不是通过multiple-host唤起的浏览器)访问

你会发现fiddler可以正常记录所有请求，同时虚拟host也会生效。

如果上述步骤没有成功，检查fiddler的 **Tools -> Fiddler Options -> GateWay** 中是否选上了默认的 **Use System Proxy**

### <a name="update"></a>Q:有bug或者出了新功能怎么更新？

A: multiple-host实现了一套自动更新机制，当有更新时会自动推送，用户点击确定更新之后，multiple-host会自动下载和覆盖当前目录的程序。

PS: 如果下载更新失败，可手动下载最新版，由于multiple-host并不需要按照，删除或者覆盖原来的文件夹就行了

**PPS:由于外网还没找到好的服务器，暂时不支持自动更新，只能在百度云下载**

![](https://raw.githubusercontent.com/liyangready/multiple-host/master/wiki/resource/10.png)