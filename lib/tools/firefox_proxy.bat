set port=9393
set ffdir=D:\leon\little-tools\firefox

:: "create profile"
cd /D %ffdir%
firefox -CreateProfile ff_dev
echo  %ffdir%

:: "setting proxy"
cd /D "%APPDATA%\Mozilla\Firefox\Profiles"
cd *.ff_dev
set ffile=%cd%
echo user_pref("network.proxy.http", "127.0.0.1 ");>>"%ffile%\prefs.js"
echo user_pref("network.proxy.http_port", %port%);>>"%ffile%\prefs.js"
echo user_pref("network.proxy.type", 1);>>"%ffile%\prefs.js"
echo user_pref("network.proxy.ssl", "127.0.0.1 ");>>"%ffile%\prefs.js"
echo user_pref("network.proxy.ssl_port", %port%);>>"%ffile%\prefs.js"
set ffile=
cd %windir%

:: "start Firefox"
start /D "%ffdir%" firefox.exe -P ff_dev -no-remote http://wiki.corp.qunar.com/pages/viewpage.action?pageId=77931765