
(function () {
    var QW = {
        /**
        * @property {string} VERSION 脚本库的版本�?
        * @default 1.0.1
        */
        VERSION: "1.0.1",
        /**
        * @property {string} RELEASE 脚本库的发布号（小版本）
        * @default 2011-08-19
        */
        RELEASE: "2011-08-19",
        /**
        * @property {string} PATH 脚本库的运行路径
        * @type string
        */
        PATH: (function () {
            var sTags = document.getElementsByTagName("script");
            return sTags[sTags.length - 1].src.replace(/(^|\/)[^\/]+\/[^\/]+$/, "$1");
        } ()),

        /**
        * 获得一个命名空�?
        * @method namespace
        * @static
        * @param { String } sSpace 命名空间符符串。如果命名空间不存在，则自动创建�?
        * @param { Object } root (Optional) 命名空间的起点。当没传root时：如果sSpace以�?.”打头，则是默认为QW为根，否则默认为window�?
        * @return {any} 返回命名空间对应的对�? 
        */
        namespace: function (sSpace, root) {
            var arr = sSpace.split('.'),
        i = 0,
        nameI;
            if (sSpace.indexOf('.') == 0) {
                i = 1;
                root = root || QW;
            }
            root = root || window;
            for (; nameI = arr[i++]; ) {
                if (!root[nameI]) {
                    root[nameI] = {};
                }
                root = root[nameI];
            }
            return root;
        },

        /**
        * QW无冲突化，还原可能被抢用的window.QW变量
        * @method noConflict
        * @static
        * @return {json} 返回QW的命名空�? 
        */
        noConflict: (function () {
            var _previousQW = window.QW;
            return function () {
                window.QW = _previousQW;
                return QW;
            }
        } ()),

        /**
        * 异步加载脚本
        * @method loadJs
        * @static
        * @param { String } url Javascript文件路径
        * @param { Function } onsuccess (Optional) Javascript加载后的回调函数
        * @param { Option } options (Optional) 配置选项，例如charset
        */
        loadJs: function (url, onsuccess, options) {
            options = options || {};
            var head = document.getElementsByTagName('head')[0] || document.documentElement,
        script = document.createElement('script'),
        done = false;
            script.src = url;
            if (options.charset) {
                script.charset = options.charset;
            }
            script.onerror = script.onload = script.onreadystatechange = function () {
                if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
                    done = true;
                    if (onsuccess) {
                        onsuccess();
                    }
                    script.onerror = script.onload = script.onreadystatechange = null;
                    head.removeChild(script);
                }
            };
            head.insertBefore(script, head.firstChild);
        },
        /**
        * 加载css样式�?
        * @method loadCss
        * @static
        * @param { String } url Css文件路径
        */
        loadCss: function (url) {
            var head = document.getElementsByTagName('head')[0] || document.documentElement,
        css = document.createElement('link');
            css.rel = 'stylesheet';
            css.type = 'text/css';
            css.href = url;
            head.insertBefore(css, head.firstChild);
        },


        /**
        * 抛出异常
        * @method error
        * @static
        * @param { obj } 异常对象
        * @param { type } Error (Optional) 错误类型，默认为Error
        */
        error: function (obj, type) {
            type = type || Error;
            throw new type(obj);
        }
    };

    /*
    * @class Wrap Wrap包装器。在对象的外面加一个外�?
    * @namespace QW
    * @param {any} core 被包装对�?
    * @return {Wrap}
    */
    /*
    QW.Wrap=function(core) {
    this.core=core;
    };
    */

    window.QW = QW;
} ());
/*
Copyright (c) Baidu Youa Wed QWrap
version: 1.0.1 2011-08-19 released
author: JK
*/

/**
* @class ModuleH 模块管理Helper
* @singleton 
* @namespace QW
* @helper
*/
(function () {

    var modules = {},
    loadJs = QW.loadJs,
    loadingModules = [],
    callbacks = [];
    isLoading = false;

    function mix(des, src, override) {
        for (var i in src) {
            if (override || !(i in des)) {
                des[i] = src[i];
            }
        }
        return des;
    }

    function isPlainObject(obj) {
        return !!obj && obj.constructor == Object;
    }

    function execCallback() {
        for (var i = 0; i < callbacks.length; i++) {
            var callback = callbacks[i].callback,
        moduleNames = callbacks[i].moduleNames.split(/\s*,\s*/g),
        isOk = true;
            for (var j = 0; j < moduleNames.length; j++) {
                var module = modules[moduleNames[j]];
                if (module.loadStatus != 2 && !(module.loadedChecker ? module.loadedChecker() : QW[moduleNames[j]])) {
                    isOk = false;
                    break;
                }
            }
            if (isOk) {
                callback();
                callbacks.splice(i, 1);
                i--;
            }
        }
    }


    function loadsJsInOrder() {
        //浏览器不能保证动态添加的ScriptElement会按顺序执行，所以人为来保证一�?
        //参见：http://www.stevesouders.com/blog/2009/04/27/loading-scripts-without-blocking/
        //测试帮助：http://1.cuzillion.com/bin/resource.cgi?type=js&sleep=3&jsdelay=0&n=1&t=1294649352
        //todo: 目前没有充分利用部分浏览器的并行下载功能，可以改进�?
        //todo: 如果服务器端能combo，则可修改以下内容以适应�?
        var moduleI = loadingModules[0];

        function loadedDone() {
            moduleI.loadStatus = 2;
            execCallback();
            isLoading = false;
            loadsJsInOrder();
        }
        if (!isLoading && moduleI) {
            //alert(moduleI.url);
            isLoading = true;
            loadingModules.splice(0, 1);
            var checker = moduleI.loadedChecker;
            if (checker && checker()) { //如果有loaderChecker，则用loaderChecker判断一下是否已经加载过
                loadedDone();
            }
            else {
                loadJs(moduleI.url.replace(/^\/\//, QW.PATH), loadedDone);
            }
        }
    }


    var ModuleH = {
        /**
        * @property {Array} provideDomains provide方法针对的命名空�?
        */
        provideDomains: [QW],
        /**
        * 向QW这个命名空间里设变量
        * @method provide
        * @static
        * @param {string|Json} moduleName 如果类型为string，则为key，否则为Json，表示将该Json里的值dump到QW命名空间
        * @param {any} value (Optional) �?
        * @return {void} 
        */
        provide: function (moduleName, value) {
            if (typeof moduleName == 'string') {
                var domains = ModuleH.provideDomains;
                for (var i = 0; i < domains.length; i++) {
                    if (!domains[i][moduleName]) {
                        domains[i][moduleName] = value;
                    }
                }
            }
            else if (isPlainObject(moduleName)) {
                for (i in moduleName) {
                    ModuleH.provide(i, moduleName[i]);
                }
            }
        },

        /** 
        * 添加模块配置�?
        * @method addConfig
        * @static
        * @param {string} moduleName 模块名。（如果为json，则是moduleName/details 的键值对json�?
        * @param {json} details 模块的依整配置，目前支持以下�?
        url: string，js路径名。如果以"//"开头，则指相对于QW.PATH�?
        requires: string，本模所依赖的其它模块。多个模块用�?,”分�?
        use: 本模所加载后，需要接着加载的模块。多个模块用�?,”分�?
        loadedChecker: 模块是否已经预加载的判断函数。如果本函数返回true，表示已经加载过�?
        * @example 
        addConfig('Editor',{url:'wed/editor/Editor.js',requires:'Dom',use:'Panel,Drap'});//配置一个模�?
        addConfig({'Editor':{url:'wed/editor/Editor.js',requires:'Dom',use:'Panel,Drap'}});//配置多个模块
        */
        addConfig: function (moduleName, details) {
            if (typeof moduleName == 'string') {
                var json = mix({}, details);
                json.moduleName = moduleName;
                modules[moduleName] = json;
            }
            else if (isPlainObject(moduleName)) {
                for (var i in moduleName) {
                    ModuleH.addConfig(i, moduleName[i]);
                }
            }
        },

        /** 
        * 按需加载模块相关js，加载完后执行callback�?
        * @method use
        * @static
        * @param {string} moduleName 需要接着加载的模块名。多个模块用�?,”分�?
        * @param {Function} callback 需要执行的函数.
        * @return {void} 
        * @remark 
        需要考虑的情况：
        use的module未加�?/加载�?/已加载、二重required或use的文件已加载/加载�?/未加�?
        */
        use: function (moduleName, callback) {
            var modulesJson = {},
            //需要加载的模块Json（用json效率快）
        modulesArray = [],
            //需要加载的模块Array（用array来排序）		
        names = moduleName.split(/\s*,\s*/g),
        i, j, k, len, moduleI;

            while (names.length) { //收集需要排队的模块到modulesJson
                var names2 = {};
                for (i = 0; i < names.length; i++) {
                    var nameI = names[i];
                    if (!nameI || QW[nameI]) { //如果已被预加载，也会忽略
                        continue;
                    }
                    if (!modulesJson[nameI]) { //还没进行收集
                        if (!modules[nameI]) { //还没进行config
                            throw 'Unknown module: ' + nameI;
                        }
                        if (modules[nameI].loadStatus != 2) { //还没被加载过  loadStatus:1:加载中�?2:已加�?
                            var checker = modules[nameI].loadedChecker;
                            if (checker && checker()) { //如果有loaderChecker，则用loaderChecker判断一下是否已经加载过
                                continue;
                            }
                            modulesJson[nameI] = modules[nameI]; //加入队列�?
                        }
                        var refs = ['requires', 'use'];
                        for (j = 0; j < refs.length; j++) { //收集附带需要加载的模块
                            var sRef = modules[nameI][refs[j]];
                            if (sRef) {
                                var refNames = sRef.split(',');
                                for (k = 0; k < refNames.length; k++) {
                                    names2[refNames[k]] = 0;
                                }
                            }
                        }
                    }
                }
                names = [];
                for (i in names2) {
                    names.push(i);
                }
            }
            for (i in modulesJson) { //转化成加载数�?
                modulesArray.push(modulesJson[i]);
            }

            for (i = 0, len = modulesArray.length; i < len; i++) { //排序�? 本排序法节约代码，但牺了性能
                if (!modulesArray[i].requires) {
                    continue;
                }
                for (j = i + 1; j < len; j++) {
                    if (new RegExp('(^|,)' + modulesArray[j].moduleName + '(,|$)').test(modulesArray[i].requires)) {
                        //如果发现前面的模块requires后面的模块，则将被required的模块移到前面来，并重新查它在新位置是否合�?
                        var moduleJ = modulesArray[j];
                        modulesArray.splice(j, 1);
                        modulesArray.splice(i, 0, moduleJ);
                        i--;
                        break;
                    }
                }
            }

            var loadIdx = -1,
            //需要加载并且未加载的最后一个模块的index
        loadingIdx = -1; //需要加载并且正在加载的最后一个模块的index
            for (i = 0; i < modulesArray.length; i++) {
                moduleI = modulesArray[i];
                if (!moduleI.loadStatus && (new RegExp('(^|,)' + moduleI.moduleName + '(,|$)').test(moduleName))) {
                    loadIdx = i;
                }
                if (moduleI.loadStatus == 1 && (new RegExp('(^|,)' + moduleI.moduleName + '(,|$)').test(moduleName))) {
                    loadingIdx = i;
                }
            }
            if (loadIdx != -1 || loadingIdx != -1) { //还有未开始加载的，或还有正在加载�?
                callbacks.push({
                    callback: callback,
                    moduleNames: moduleName
                });
            }
            else {
                callback();
                return;
            }

            for (i = 0; i < modulesArray.length; i++) {
                moduleI = modulesArray[i];
                if (!moduleI.loadStatus) { //需要load的js。todo: 模块combo加载
                    moduleI.loadStatus = 1;
                    loadingModules.push(moduleI);
                }
            }
            loadsJsInOrder();
        }
    };

    QW.ModuleH = ModuleH;
    QW.use = ModuleH.use;
    QW.provide = ModuleH.provide;

} ());
/*
Copyright (c) Baidu Youa Wed QWrap
version: 1.0.1 2011-08-19 released
author: JK
*/


/**
* @class Browser js的运行环境，浏览器以及版本信息。（Browser仅基于userAgent进行嗅探，存在不严谨的缺陷。）移动的useragent信息参考自http://mo.wed.ivershuo.com/�?
* @singleton 
* @namespace QW 
*/
QW.Browser = (function () {
    var na = window.navigator,
    ua = na.userAgent.toLowerCase(),
    browserTester = /(msie|webkit|gecko|presto|opera|safari|firefox|chrome|maxthon|android|ipad|iphone|webos|hpwos)[ \/os]*([\d_.]+)/ig,
    Browser = {
        platform: na.platform
    };
    ua.replace(browserTester, function (a, b, c) {
        var bLower = b.toLowerCase();
        if (!Browser[bLower]) {
            Browser[bLower] = c;
        }
    });
    if (Browser.opera) { //Opera9.8后版本号位置变化
        ua.replace(/opera.*version\/([\d.]+)/, function (a, b) {
            Browser.opera = b;
        });
    }
    if (Browser.msie) {
        Browser.ie = Browser.msie;
        var v = parseInt(Browser.msie, 10);
        Browser['ie' + v] = true;
    }
    return Browser;
} ());
if (QW.Browser.ie) {
    try {
        document.execCommand("BackgroundImageCache", false, true);
    }
    catch (e) { }
}
/*
Copyright (c) Baidu Youa Wed QWrap
version: 1.0.1 2011-08-19 released
author: JK
*/

/**
* @class StringH 核心对象String的扩�?
* @singleton
* @namespace QW
* @helper
*/

(function () {

    var StringH = {
        /** 
        * 除去字符串两边的空白字符
        * @method trim
        * @static
        * @param {String} s 需要处理的字符�?
        * @return {String}  除去两端空白字符后的字符�?
        * @remark 如果字符串中间有很多连续tab,会有有严重效率问�?,相应问题可以用下一句话来解�?.
        return s.replace(/^[\s\xa0\u3000]+/g,"").replace(/([^\u3000\xa0\s])[\u3000\xa0\s]+$/g,"$1");
        */
        trim: function (s) {
            return s.replace(/^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g, "");
        },
        /** 
        * 对一个字符串进行多次replace
        * @method mulReplace
        * @static
        * @param {String} s  需要处理的字符�?
        * @param {array} arr  数组，每一个元素都是由replace两个参数组成的数�?
        * @return {String} 返回处理后的字符�?
        * @example alert(mulReplace("I like aa and bb. JK likes aa.",[[/aa/g,"�?"],[/bb/g,"�?"]]));
        */
        mulReplace: function (s, arr) {
            for (var i = 0; i < arr.length; i++) {
                s = s.replace(arr[i][0], arr[i][1]);
            }
            return s;
        },
        /** 
        * 字符串简易模�?
        * @method format
        * @static
        * @param {String} s 字符串模板，其中变量以{0} {1}表示
        * @param {String} arg0 (Optional) 替换的参�?
        * @return {String}  模板变量被替换后的字符串
        * @example alert(format("{0} love {1}.",'I','You'))
        */
        format: function (s, arg0) {
            var args = arguments;
            return s.replace(/\{(\d+)\}/ig, function (a, b) {
                var ret = args[(b | 0) + 1];
                return ret == null ? '' : ret;
            });
        },

        /*
        * 字符串简易模�?
        * @method tmpl
        * @static
        * @param {String} sTmpl 字符串模板，其中变量以｛$aaa｝表�?
        * @param {Object} opts 模板参数
        * @return {String}  模板变量被替换后的字符串
        * @example alert(tmpl("{$a} love {$b}.",{a:"I",b:"you"}))
        tmpl:function(sTmpl,opts){
        return sTmpl.replace(/\{\$(\w+)\}/g,function(a,b){return opts[b]});
        },
        */

        /** 
        * 字符串模�?
        * @method tmpl
        * @static
        * @param {String} sTmpl 字符串模板，其中变量以{$aaa}表示。模板语法：
        分隔符为{xxx}�?"}"之前没有空格字符�?
        js表达�?/js语句里的'}', 需使用' }'，即前面有空格字�?
        {strip}...{/strip}里的所有\r\n打头的空白都会被清除�?
        {}里只能使用表达式，不能使用语句，除非使用以下标签
        {js ...}		－－任意js语句, 里面如果需要输出到模板，用print("aaa");
        {if(...)}		－－if语句，写法为{if($a>1)},需要自带括�?
        {elseif(...)}	－－elseif语句，写法为{elseif($a>1)},需要自带括�?
        {else}			－－else语句，写法为{else}
        {/if}			－－endif语句，写法为{/if}
        {for(...)}		－－for语句，写法为{for(var i=0;i<1;i++)}，需要自带括�?
        {/for}			－－endfor语句，写法为{/for}
        {while(...)}	－－while语句,写法为{while(i-->0)},需要自带括�?
        {/while}		－－endwhile语句, 写法为{/while}
        * @param {Object} opts (Optional) 模板参数
        * @return {String|Function}  如果调用时传了opts参数，则返回字符串；如果没传，则返回一个function（相当于把sTmpl转化成一个函数）
		 
        * @example alert(tmpl("{$a} love {$b}.",{a:"I",b:"you"}));
        * @example alert(tmpl("{js print('I')} love {$b}.",{b:"you"}));
        */
        tmpl: (function () {
            /*
            sArrName 拼接字符串的变量名�?
            */
            var sArrName = "sArrCMX",
        sLeft = sArrName + '.push("';
            /*
            tag:模板标签,各属性含义：
            tagG: tag系列
            isBgn: 是开始类型的标签
            isEnd: 是结束类型的标签
            cond: 标签条件
            rlt: 标签结果
            sBgn: 开始字符串
            sEnd: 结束字符�?
            */
            var tags = {
                'js': {
                    tagG: 'js',
                    isBgn: 1,
                    isEnd: 1,
                    sBgn: '");',
                    sEnd: ';' + sLeft
                },
                //任意js语句, 里面如果需要输出到模板，用print("aaa");
                'if': {
                    tagG: 'if',
                    isBgn: 1,
                    rlt: 1,
                    sBgn: '");if',
                    sEnd: '{' + sLeft
                },
                //if语句，写法为{if($a>1)},需要自带括�?
                'elseif': {
                    tagG: 'if',
                    cond: 1,
                    rlt: 1,
                    sBgn: '");} else if',
                    sEnd: '{' + sLeft
                },
                //if语句，写法为{elseif($a>1)},需要自带括�?
                'else': {
                    tagG: 'if',
                    cond: 1,
                    rlt: 2,
                    sEnd: '");}else{' + sLeft
                },
                //else语句，写法为{else}
                '/if': {
                    tagG: 'if',
                    isEnd: 1,
                    sEnd: '");}' + sLeft
                },
                //endif语句，写法为{/if}
                'for': {
                    tagG: 'for',
                    isBgn: 1,
                    rlt: 1,
                    sBgn: '");for',
                    sEnd: '{' + sLeft
                },
                //for语句，写法为{for(var i=0;i<1;i++)},需要自带括�?
                '/for': {
                    tagG: 'for',
                    isEnd: 1,
                    sEnd: '");}' + sLeft
                },
                //endfor语句，写法为{/for}
                'while': {
                    tagG: 'while',
                    isBgn: 1,
                    rlt: 1,
                    sBgn: '");while',
                    sEnd: '{' + sLeft
                },
                //while语句,写法为{while(i-->0)},需要自带括�?
                '/while': {
                    tagG: 'while',
                    isEnd: 1,
                    sEnd: '");}' + sLeft
                } //endwhile语句, 写法为{/while}
            };

            return function (sTmpl, opts) {
                var N = -1,
          NStat = []; //语句堆栈;
                var ss = [
          [/\{strip\}([\s\S]*?)\{\/strip\}/g, function (a, b) {
              return b.replace(/[\r\n]\s*\}/g, " }").replace(/[\r\n]\s*/g, "");
          } ],
          [/\\/g, '\\\\'],
          [/"/g, '\\"'],
          [/\r/g, '\\r'],
          [/\n/g, '\\n'], //为js作转�?.
                          [
          /\{[\s\S]*?\S\}/g, //js里使用}时，前面要加空格�?
                          function (a) {
                              a = a.substr(1, a.length - 2);
                              for (var i = 0; i < ss2.length; i++) {
                                  a = a.replace(ss2[i][0], ss2[i][1]);
                              }
                              var tagName = a;
                              if (/^(.\w+)\W/.test(tagName)) {
                                  tagName = RegExp.$1;
                              }
                              var tag = tags[tagName];
                              if (tag) {
                                  if (tag.isBgn) {
                                      var stat = NStat[++N] = {
                                          tagG: tag.tagG,
                                          rlt: tag.rlt
                                      };
                                  }
                                  if (tag.isEnd) {
                                      if (N < 0) {
                                          throw new Error("Unexpected Tag: " + a);
                                      }
                                      stat = NStat[N--];
                                      if (stat.tagG != tag.tagG) {
                                          throw new Error("Unmatch Tags: " + stat.tagG + "--" + tagName);
                                      }
                                  }
                                  else if (!tag.isBgn) {
                                      if (N < 0) {
                                          throw new Error("Unexpected Tag:" + a);
                                      }
                                      stat = NStat[N];
                                      if (stat.tagG != tag.tagG) {
                                          throw new Error("Unmatch Tags: " + stat.tagG + "--" + tagName);
                                      }
                                      if (tag.cond && !(tag.cond & stat.rlt)) {
                                          throw new Error("Unexpected Tag: " + tagName);
                                      }
                                      stat.rlt = tag.rlt;
                                  }
                                  return (tag.sBgn || '') + a.substr(tagName.length) + (tag.sEnd || '');
                              }
                              else {
                                  return '",(' + a + '),"';
                              }
                          }
        ]
          ];
                var ss2 = [
          [/\\n/g, '\n'],
          [/\\r/g, '\r'],
          [/\\"/g, '"'],
          [/\\\\/g, '\\'],
          [/\$(\w+)/g, 'opts["$1"]'],
          [/print\(/g, sArrName + '.push(']
          ];
                for (var i = 0; i < ss.length; i++) {
                    sTmpl = sTmpl.replace(ss[i][0], ss[i][1]);
                }
                if (N >= 0) {
                    throw new Error("Lose end Tag: " + NStat[N].tagG);
                }
                sTmpl = 'var ' + sArrName + '=[];' + sLeft + sTmpl + '");return ' + sArrName + '.join("");';
                //alert('转化结果\n'+sTmpl);
                var fun = new Function('opts', sTmpl);
                if (arguments.length > 1) {
                    return fun(opts);
                }
                return fun;
            };
        } ()),

        /** 
        * 判断一个字符串是否包含另一个字符串
        * @method contains
        * @static
        * @param {String} s 字符�?
        * @param {String} opts 子字符串
        * @return {String} 模板变量被替换后的字符串
        * @example alert(contains("aaabbbccc","ab"))
        */
        contains: function (s, subStr) {
            return s.indexOf(subStr) > -1;
        },

        /** 
        * 全角字符转半角字�?
        全角空格�?12288，转化成" "�?
        全角句号�?12290，转化成"."�?
        其他字符半角(33-126)与全�?(65281-65374)的对应关系是：均相差65248 
        * @method dbc2sbc
        * @static
        * @param {String} s 需要处理的字符�?
        * @return {String}  返回转化后的字符�?
        * @example 
        var s="发票号是ＢＢＣ１２３４５６，发票金额是１�?.３５�?";
        alert(dbc2sbc(s));
        */
        dbc2sbc: function (s) {
            return StringH.mulReplace(s, [
        [/[\uff01-\uff5e]/g, function (a) {
            return String.fromCharCode(a.charCodeAt(0) - 65248);
        } ],
        [/\u3000/g, ' '],
        [/\u3002/g, '.']
        ]);
        },

        /** 
        * 得到字节长度
        * @method byteLen
        * @static
        * @param {String} s 字符�?
        * @return {number}  返回字节长度
        */
        byteLen: function (s) {
            return s.replace(/[^\x00-\xff]/g, "--").length;
        },

        /** 
        * 得到指定字节长度的子字符�?
        * @method subByte
        * @static
        * @param {String} s 字符�?
        * @param {number} len 字节长度
        * @param {string} tail (Optional) 结尾字符�?
        * @return {string}  返回指定字节长度的子字符�?
        */
        subByte: function (s, len, tail) {
            if (StringH.byteLen(s) <= len) {
                return s;
            }
            tail = tail || '';
            len -= StringH.byteLen(tail);
            return s.substr(0, len).replace(/([^\x00-\xff])/g, "$1 ") //双字节字符替换成两个
      .substr(0, len) //截取长度
      .replace(/[^\x00-\xff]$/, "") //去掉临界双字节字�?
      .replace(/([^\x00-\xff]) /g, "$1") + tail; //还原
        },

        /** 
        * 驼峰化字符串。将“ab-cd”转化为“abCd�?
        * @method camelize
        * @static
        * @param {String} s 字符�?
        * @return {String}  返回转化后的字符�?
        */
        camelize: function (s) {
            return s.replace(/\-(\w)/ig, function (a, b) {
                return b.toUpperCase();
            });
        },

        /** 
        * 反驼峰化字符串。将“abCd”转化为“ab-cd”�?
        * @method decamelize
        * @static
        * @param {String} s 字符�?
        * @return {String} 返回转化后的字符�?
        */
        decamelize: function (s) {
            return s.replace(/[A-Z]/g, function (a) {
                return "-" + a.toLowerCase();
            });
        },

        /** 
        * 字符串为javascript转码
        * @method encode4Js
        * @static
        * @param {String} s 字符�?
        * @return {String} 返回转化后的字符�?
        * @example 
        var s="my name is \"JK\",\nnot 'Jack'.";
        window.setTimeout("alert('"+encode4Js(s)+"')",10);
        */
        encode4Js: function (s) {
            return StringH.mulReplace(s, [
        [/\\/g, "\\u005C"],
        [/"/g, "\\u0022"],
        [/'/g, "\\u0027"],
        [/\//g, "\\u002F"],
        [/\r/g, "\\u000A"],
        [/\n/g, "\\u000D"],
        [/\t/g, "\\u0009"]
        ]);
        },

        /**
        * 转义转义字符，用于Object.Stringify
        * 直接用encode4JS会有问题，有时候php等后端脚本不能直接解开
        * 用这个和JSON.Stringify保持一�?
        * @static
        * @param {String} s 字符�?
        * @return {String} 返回转化后的字符�?
        */
        escapeChars: function (s) {
            return StringH.mulReplace(s, [
        ['\b', '\\b'],
        ['\t', '\\t'],
        ['\n', '\\n'],
        ['\f', '\\f'],
        ['\r', '\\r'],
        ['"', '\\"'],
        ['\\', '\\\\']
        ]);
        },

        /** 
        * 为http的不可见字符、不安全字符、保留字符作转码
        * @method encode4Http
        * @static
        * @param {String} s 字符�?
        * @return {String} 返回处理后的字符�?
        */
        encode4Http: function (s) {
            return s.replace(/[\u0000-\u0020\u0080-\u00ff\s"'#\/\|\\%<>\[\]\{\}\^~;\?\:@=&]/, function (a) {
                return encodeURIComponent(a);
            });
        },

        /** 
        * 字符串为Html转码
        * @method encode4Html
        * @static
        * @param {String} s 字符�?
        * @return {String} 返回处理后的字符�?
        * @example 
        var s="<div>dd";
        alert(encode4Html(s));
        */
        encode4Html: function (s) {
            var el = document.createElement('pre'); //这里要用pre，用div有时会丢失换行，例如�?'a\r\n\r\nb'
            var text = document.createTextNode(s);
            el.appendChild(text);
            return el.innerHTML;
        },

        /** 
        * 字符串为Html的value值转�?
        * @method encode4HtmlValue
        * @static
        * @param {String} s 字符�?
        * @return {String} 返回处理后的字符�?
        * @example:
        var s="<div>\"\'ddd";
        alert("<input value='"+encode4HtmlValue(s)+"'>");
        */
        encode4HtmlValue: function (s) {
            return StringH.encode4Html(s).replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        },

        /** 
        * 与encode4Html方法相反，进行反编译
        * @method decode4Html
        * @static
        * @param {String} s 字符�?
        * @return {String} 返回处理后的字符�?
        */
        decode4Html: function (s) {
            var div = document.createElement('div');
            div.innerHTML = StringH.stripTags(s);
            return div.childNodes[0] ? div.childNodes[0].nodeValue || '' : '';
        },
        /** 
        * 将所有tag标签消除，即去除<tag>，以�?</tag>
        * @method stripTags
        * @static
        * @param {String} s 字符�?
        * @return {String} 返回处理后的字符�?
        */
        stripTags: function (s) {
            return s.replace(/<[^>]*>/gi, '');
        },
        /** 
        * eval某字符串。如果叫"eval"，在这里需要加引号，才能不影响YUI压缩。不过其它地方用了也会有问题，所以改名evalJs�?
        * @method evalJs
        * @static
        * @param {String} s 字符�?
        * @param {any} opts 运行时需要的参数�?
        * @return {any} 根据字符结果进行返回�?
        */
        evalJs: function (s, opts) { //如果用eval，在这里需要加引号，才能不影响YUI压缩。不过其它地方用了也会有问题，所以改成evalJs�?
            return new Function("opts", s)(opts);
        },
        /** 
        * eval某字符串，这个字符串是一个js表达式，并返回表达式运行的结�?
        * @method evalExp
        * @static
        * @param {String} s 字符�?
        * @param {any} opts eval时需要的参数�?
        * @return {any} 根据字符结果进行返回�?
        */
        evalExp: function (s, opts) {
            return new Function("opts", "return (" + s + ");")(opts);
        },
        /** 
        * 解析url或search字符串�?
        * @method queryUrl
        * @static
        * @param {String} s url或search字符�?
        * @param {String} key (Optional) 参数名�?
        * @return {Json|String|Array|undefined} 如果key为空，则返回解析整个字符串得到的Json对象；否则返回参数值。有多个参数，或参数名带[]的，参数值为Array�?
        */
        queryUrl: function (url, key) {
            url = url.replace(/^[^?=]*\?/ig, '').split('#')[0]; //去除网址与hash信息
            var json = {};
            //考虑到key中可能有特殊符号如“[].”等，而[]却有是否被编码的可能，所以，牺牲效率以求严谨，就算传了key参数，也是全部解析url�?
            url.replace(/(^|&)([^&=]+)=([^&]*)/g, function (a, b, key, value) {
                key = decodeURIComponent(key);
                value = decodeURIComponent(value);
                if (!(key in json)) {
                    json[key] = /\[\]$/.test(key) ? [value] : value; //如果参数名以[]结尾，则当作数组
                }
                else if (json[key] instanceof Array) {
                    json[key].push(value);
                }
                else {
                    json[key] = [json[key], value];
                }
            });
            return key ? json[key] : json;
        }
    };

    QW.StringH = StringH;

} ());
/*
Copyright (c) Baidu Youa Wed QWrap
version: 1.0.1 2011-08-19 released
author: 月影、JK
*/


/**
* @class ObjectH 核心对象Object的静态扩�?
* @singleton
* @namespace QW
* @helper
*/

(function () {
    var escapeChars = QW.StringH.escapeChars;

    function getConstructorName(o) {
        return o != null && Object.prototype.toString.call(o).slice(8, -1);
    }
    var ObjectH = {

        /** 
        * 判断一个变量是否是string值或String对象
        * @method isString
        * @static
        * @param {any} obj 目标变量
        * @returns {boolean} 
        */
        isString: function (obj) {
            return getConstructorName(obj) == 'String';
        },

        /** 
        * 判断一个变量是否是function对象
        * @method isFunction
        * @static
        * @param {any} obj 目标变量
        * @returns {boolean} 
        */
        isFunction: function (obj) {
            return getConstructorName(obj) == 'Function';
        },

        /** 
        * 判断一个变量是否是Array对象
        * @method isArray
        * @static
        * @param {any} obj 目标变量
        * @returns {boolean} 
        */
        isArray: function (obj) {
            return getConstructorName(obj) == 'Array';
        },

        /** 
        * 判断一个变量是否是typeof 'object'
        * @method isObject
        * @static
        * @param {any} obj 目标变量
        * @returns {boolean} 
        */
        isObject: function (obj) {
            return obj !== null && typeof obj == 'object';
        },

        /** 
        * 判断一个变量是否是Array泛型，即:有length属性并且该属性是数值的对象
        * @method isArrayLike
        * @static
        * @param {any} obj 目标变量
        * @returns {boolean} 
        */
        isArrayLike: function (obj) {
            return !!obj && typeof obj == 'object' && obj.nodeType != 1 && typeof obj.length == 'number';
        },

        /** 
        * 判断一个变量的constructor是否是Object�?---通常可用于判断一个对象是否是{}或由new Object()产生的对象�?
        * @method isPlainObject
        * @static
        * @param {any} obj 目标变量
        * @returns {boolean} 
        */
        isPlainObject: function (obj) {
            return !!obj && obj.constructor === Object;
        },

        /** 
        * 判断一个变量是否是Wrap对象
        * @method isWrap
        * @static
        * @param {any} obj 目标变量
        * @param {string} coreName (Optional) core的属性名，默认为'core'
        * @returns {boolean} 
        */
        isWrap: function (obj, coreName) {
            return !!(obj && obj[coreName || 'core']);
        },

        /** 
        * 判断一个变量是否是Html的Element元素
        * @method isElement
        * @static
        * @param {any} obj 目标变量
        * @returns {boolean} 
        */
        isElement: function (obj) {
            return !!obj && obj.nodeType == 1;
        },

        /** 
        * 为一个对象设置属性，支持以下三种调用方式:
        set(obj, prop, value)
        set(obj, propJson)
        set(obj, props, values)
        ---特别说明propName里带的点，会被当作属性的层次
        * @method set
        * @static
        * @param {Object} obj 目标对象
        * @param {string|Json|Array|setter} prop 如果是string,则当属性名(属性名可以是属性链字符�?,�?"style.display")；如果是function，则当setter函数；如果是Json，则当prop/value对；如果是数组，则当prop数组，第二个参数对应的也是value数组
        * @param {any | Array} value 属性�?
        * @returns {Object} obj 
        * @example 
        var el={style:{},firstChild:{}};
        set(el,"id","aaaa");
        set(el,{className:"cn1", 
        "style.display":"block",
        "style.width":"8px"
        });
        */
        set: function (obj, prop, value) {
            if (ObjectH.isArray(prop)) {
                //set(obj, props, values)
                for (var i = 0; i < prop.length; i++) {
                    ObjectH.set(obj, prop[i], value[i]);
                }
            }
            else if (typeof prop == 'object') {
                //set(obj, propJson)
                for (i in prop) {
                    ObjectH.set(obj, i, prop[i]);
                }
            }
            else if (typeof prop == 'function') { //getter
                var args = [].slice.call(arguments, 1);
                args[0] = obj;
                prop.apply(null, args);
            }
            else {
                //set(obj, prop, value);
                var keys = prop.split(".");
                i = 0;
                for (var obj2 = obj, len = keys.length - 1; i < len; i++) {
                    obj2 = obj2[keys[i]];
                }
                obj2[keys[i]] = value;
            }
            return obj;
        },

        /** 
        * 得到一个对象的相关属性，支持以下三种调用方式:
        get(obj, prop) -> obj[prop]
        get(obj, props) -> propValues
        get(obj, propJson) -> propJson
        * @method get
        * @static
        * @param {Object} obj 目标对象
        * @param {string|Array|getter} prop 如果是string,则当属性名(属性名可以是属性链字符�?,�?"style.display")；如果是function，则当getter函数；如果是array，则当获取的属性名序列�?
        如果是Array，则当props看待
        * @param {boolean} nullSensitive 是否对属性链异常敏感。即，如果属性链中间为空，是否抛出异�?
        * @returns {any|Array} 返回属性�?
        * @example 
        get(obj,"style"); //返回obj["style"];
        get(obj,"style.color"); //返回 obj.style.color;
        get(obj,"styleee.color"); //返回 undefined;
        get(obj,"styleee.color",true); //抛空指针异常，因为obj.styleee.color链条中的obj.styleee为空;
        get(obj,["id","style.color"]); //返回 [obj.id, obj.style.color];
        */
        get: function (obj, prop, nullSensitive) {
            if (ObjectH.isArray(prop)) { //get(obj, props)
                var ret = [],
          i;
                for (i = 0; i < prop.length; i++) {
                    ret[i] = ObjectH.get(obj, prop[i], nullSensitive);
                }
            }
            else if (typeof prop == 'function') { //getter
                var args = [].slice.call(arguments, 1);
                args[0] = obj;
                return prop.apply(null, args);
            }
            else { //get(obj, prop)
                var keys = prop.split(".");
                ret = obj;
                for (i = 0; i < keys.length; i++) {
                    if (!nullSensitive && ret == null) {
                        return;
                    }
                    ret = ret[keys[i]];
                }
            }
            return ret;
        },

        /** 
        * 将源对象的属性并入到目标对象
        * @method mix
        * @static
        * @param {Object} des 目标对象
        * @param {Object|Array} src 源对象，如果是数组，则依次并�?
        * @param {boolean} override (Optional) 是否覆盖已有属�?
        * @returns {Object} des
        */
        mix: function (des, src, override) {
            if (ObjectH.isArray(src)) {
                for (var i = 0, len = src.length; i < len; i++) {
                    ObjectH.mix(des, src[i], override);
                }
                return des;
            }
            for (i in src) {
                if (override || !(des[i] || (i in des))) {
                    des[i] = src[i];
                }
            }
            return des;
        },

        /**
        * <p>输出一个对象里面的内容</p>
        * <p><strong>如果属性被"."分隔，会取出深层次的属�?</strong>，例�?:</p>
        * <p>ObjectH.dump(o, "aa"); //得到 {"aa": o.aa}</p>
        * @method dump
        * @static
        * @param {Object} obj 被操作的对象
        * @param {Array} props 包含要被复制的属性名称的数组
        * @return {Object} 包含被dump出的属性的对象 
        */
        dump: function (obj, props) {
            var ret = {};
            for (var i = 0, len = props.length; i < len; i++) {
                if (i in props) {
                    var key = props[i];
                    if (key in obj) ret[key] = obj[key];
                }
            }
            return ret;
        },
        /**
        * 在对象中的每个属性项上运行一个函数，并将函数返回值作为属性的值�?
        * @method map
        * @static
        * @param {Object} obj 被操作的对象
        * @param {function} fn 迭代计算每个属性的算子，该算子迭代中有三个参数value-属性值，key-属性名，obj，当前对�?
        * @param {Object} thisObj (Optional)迭代计算时的this
        * @return {Object} 返回包含这个对象中所有属性计算结果的对象
        */
        map: function (obj, fn, thisObj) {
            var ret = {};
            for (var key in obj) {
                ret[key] = fn.call(thisObj, obj[key], key, obj);
            }
            return ret;
        },
        /**
        * 得到一个对象中所有可以被枚举出的属性的列表
        * @method keys
        * @static
        * @param {Object} obj 被操作的对象
        * @return {Array} 返回包含这个对象中所有属性的数组
        */
        keys: function (obj) {
            var ret = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    ret.push(key);
                }
            }
            return ret;
        },

        /**
        * 以keys/values数组的方式添加属性到一个对�?<br/>
        * <strong>如果values的长度大于keys的长度，多余的元素将被忽�?</strong>
        * @method fromArray
        * @static
        * @param {Object} obj 被操作的对象
        * @param {Array} keys 存放key的数�?
        * @param {Array} values 存放value的数�?
        * @return {Object} 返回添加了属性的对象
        */
        fromArray: function (obj, keys, values) {
            values = values || [];
            for (var i = 0, len = keys.length; i < len; i++) {
                obj[keys[i]] = values[i];
            }
            return obj;
        },

        /**
        * 得到一个对象中所有可以被枚举出的属性值的列表
        * @method values
        * @static
        * @param {Object} obj 被操作的对象
        * @return {Array} 返回包含这个对象中所有属性值的数组
        */
        values: function (obj) {
            var ret = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    ret.push(obj[key]);
                }
            }
            return ret;
        },
        /**
        * 以某对象为原型创建一个新的对�? （by Ben Newman�?
        * @method create
        * @static 
        * @param {Object} proto 作为原型的对�?
        * @param {Object} props (Optional) 附加属�?
        */
        create: function (proto, props) {
            var ctor = function (ps) {
                if (ps) {
                    ObjectH.mix(this, ps, true);
                }
            };
            ctor.prototype = proto;
            return new ctor(props);
        },
        /** 
        * 序列化一个对�?(只序列化String,Number,Boolean,Date,Array,Json对象和有toJSON方法的对�?,其它的对象都会被序列化成null)
        * @method stringify
        * @static
        * @param {Object} obj 需要序列化的Json、Array对象或其它对�?
        * @returns {String} : 返回序列化结�?
        * @example 
        var card={cardNo:"bbbb1234",history:[{date:"2008-09-16",count:120.0,isOut:true},1]};
        alert(stringify(card));
        */
        stringify: function (obj) {
            if (obj == null) {
                return null;
            }
            if (obj.toJSON) {
                obj = obj.toJSON();
            }
            var type = typeof obj;
            switch (type) {
                case 'string':
                    return '"' + escapeChars(obj) + '"';
                case 'number':
                case 'boolean':
                    return obj.toString();
                case 'object':
                    if (obj instanceof Date) {
                        return 'new Date(' + obj.getTime() + ')';
                    }
                    if (obj instanceof Array) {
                        var ar = [];
                        for (var i = 0; i < obj.length; i++) {
                            ar[i] = ObjectH.stringify(obj[i]);
                        }
                        return '[' + ar.join(',') + ']';
                    }
                    if (ObjectH.isPlainObject(obj)) {
                        ar = [];
                        for (i in obj) {
                            ar.push('"' + escapeChars(i) + '":' + ObjectH.stringify(obj[i]));
                        }
                        return '{' + ar.join(',') + '}';
                    }
            }
            return null; //无法序列化的，返回null;
        },

        /** 
        * encodeURI一个Json对象
        * @method encodeURIJson
        * @static
        * @param {Json} json  Json数据，只有一层json，每一键对应的值可以是字符串或字符串数�?
        * @returns {string} : 返回被encodeURI结果�?
        */
        encodeURIJson: function (json) {
            var s = [];
            for (var p in json) {
                if (json[p] == null) continue;
                if (json[p] instanceof Array) {
                    for (var i = 0; i < json[p].length; i++) s.push(encodeURIComponent(p) + '=' + encodeURIComponent(json[p][i]));
                }
                else s.push(encodeURIComponent(p) + '=' + encodeURIComponent(json[p]));
            }
            return s.join('&');
        }

    };

    QW.ObjectH = ObjectH;
} ());
/*
Copyright (c) Baidu Youa Wed QWrap
version: 1.0.1 2011-08-19 released
author: JK
*/

/**
* @class ArrayH 核心对象Array的扩�?
* @singleton 
* @namespace QW
* @helper
*/
(function () {

    var ArrayH = {
        /** 
        * 在数组中的每个项上运行一个函数，并将全部结果作为数组返回�?
        * @method map
        * @static
        * @param {Array} arr 待处理的数组.
        * @param {Function} callback 需要执行的函数.
        * @param {Object} pThis (Optional) 指定callback的this对象.
        * @return {Array} 返回满足过滤条件的元素组成的新数�? 
        * @example 
        var arr=["aa","ab","bc"];
        var arr2=map(arr,function(a,b){return a.substr(0,1)=="a"});
        alert(arr2);
        */
        map: function (arr, callback, pThis) {
            var len = arr.length;
            var rlt = new Array(len);
            for (var i = 0; i < len; i++) {
                if (i in arr) {
                    rlt[i] = callback.call(pThis, arr[i], i, arr);
                }
            }
            return rlt;
        },

        /** 
        * 对Array的每一个元素运行一个函数�?
        * @method forEach
        * @static
        * @param {Array} arr 待处理的数组.
        * @param {Function} callback 需要执行的函数.
        * @param {Object} pThis (Optional) 指定callback的this对象.
        * @return {void}  
        * @example 
        var arr=["a","b","c"];
        var dblArr=[];
        forEach(arr,function(a,b){dblArr.push(b+":"+a+a);});
        alert(dblArr);
        */
        forEach: function (arr, callback, pThis) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if (i in arr) {
                    callback.call(pThis, arr[i], i, arr);
                }
            }
        },

        /** 
        * 在数组中的每个项上运行一个函数，并将函数返回真值的项作为数组返回�?
        * @method filter
        * @static
        * @param {Array} arr 待处理的数组.
        * @param {Function} callback 需要执行的函数.
        * @param {Object} pThis (Optional) 指定callback的this对象.
        * @return {Array} 返回满足过滤条件的元素组成的新数�? 
        * @example 
        var arr=["aa","ab","bc"];
        var arr2=filter(arr,function(a,b){return a.substr(0,1)=="a"});
        alert(arr2);
        */
        filter: function (arr, callback, pThis) {
            var rlt = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                if ((i in arr) && callback.call(pThis, arr[i], i, arr)) {
                    rlt.push(arr[i]);
                }
            }
            return rlt;
        },

        /** 
        * 判断数组中是否有元素满足条件�?
        * @method some
        * @static
        * @param {Array} arr 待处理的数组.
        * @param {Function} callback 需要执行的函数.
        * @param {Object} pThis (Optional) 指定callback的this对象.
        * @return {boolean} 如果存在元素满足条件，则返回true. 
        * @example 
        var arr=["aa","ab","bc"];
        var arr2=filter(arr,function(a,b){return a.substr(0,1)=="a"});
        alert(arr2);
        */
        some: function (arr, callback, pThis) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if (i in arr && callback.call(pThis, arr[i], i, arr)) {
                    return true;
                }
            }
            return false;
        },

        /** 
        * 判断数组中所有元素都满足条件�?
        * @method every
        * @static
        * @param {Array} arr 待处理的数组.
        * @param {Function} callback 需要执行的函数.
        * @param {Object} pThis (Optional) 指定callback的this对象.
        * @return {boolean} 所有元素满足条件，则返回true. 
        * @example 
        var arr=["aa","ab","bc"];
        var arr2=filter(arr,function(a,b){return a.substr(0,1)=="a"});
        alert(arr2);
        */
        every: function (arr, callback, pThis) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if (i in arr && !callback.call(pThis, arr[i], i, arr)) {
                    return false;
                }
            }
            return true;
        },

        /** 
        * 返回一个元素在数组中的位置（从前往后找）。如果数组里没有该元素，则返�?-1
        * @method indexOf
        * @static
        * @param {Array} arr 待处理的数组.
        * @param {Object} obj 元素，可以是任何类型
        * @param {int} fromIdx (Optional) 从哪个位置开始找起，如果为负，则表示从length+startIdx开始找
        * @return {int} 则返回该元素在数组中的位�?.
        * @example 
        var arr=["a","b","c"];
        alert(indexOf(arr,"c"));
        */
        indexOf: function (arr, obj, fromIdx) {
            var len = arr.length;
            fromIdx |= 0; //取整
            if (fromIdx < 0) {
                fromIdx += len;
            }
            if (fromIdx < 0) {
                fromIdx = 0;
            }
            for (; fromIdx < len; fromIdx++) {
                if (fromIdx in arr && arr[fromIdx] === obj) {
                    return fromIdx;
                }
            }
            return -1;
        },

        /** 
        * 返回一个元素在数组中的位置（从后往前找）。如果数组里没有该元素，则返�?-1
        * @method lastIndexOf
        * @static
        * @param {Array} arr 待处理的数组.
        * @param {Object} obj 元素，可以是任何类型
        * @param {int} fromIdx (Optional) 从哪个位置开始找起，如果为负，则表示从length+startIdx开始找
        * @return {int} 则返回该元素在数组中的位�?.
        * @example 
        var arr=["a","b","a"];
        alert(lastIndexOf(arr,"a"));
        */
        lastIndexOf: function (arr, obj, fromIdx) {
            var len = arr.length;
            fromIdx |= 0; //取整
            if (!fromIdx || fromIdx >= len) {
                fromIdx = len - 1;
            }
            if (fromIdx < 0) {
                fromIdx += len;
            }
            for (; fromIdx > -1; fromIdx--) {
                if (fromIdx in arr && arr[fromIdx] === obj) {
                    return fromIdx;
                }
            }
            return -1;
        },

        /** 
        * 判断数组是否包含某元�?
        * @method contains
        * @static
        * @param {Array} arr 待处理的数组.
        * @param {Object} obj 元素，可以是任何类型
        * @return {boolean} 如果元素存在于数组，则返回true，否则返回false
        * @example 
        var arr=["a","b","c"];
        alert(contains(arr,"c"));
        */
        contains: function (arr, obj) {
            return (ArrayH.indexOf(arr, obj) >= 0);
        },

        /** 
        * 清空一个数�?
        * @method clear
        * @static
        * @param {Array} arr 待处理的数组.
        * @return {void} 
        */
        clear: function (arr) {
            arr.length = 0;
        },

        /** 
        * 将数组里的某(�?)元素移除�?
        * @method remove
        * @static
        * @param {Array} arr 待处理的数组.
        * @param {Object} obj0 待移除元�?
        * @param {Object} obj1 �? 待移除元�?
        * @return {number} 返回第一次被移除的位置。如果没有任何元素被移除，则返回-1.
        * @example 
        var arr=["a","b","c"];
        remove(arr,"a","c");
        alert(arr);
        */
        remove: function (arr, obj) {
            var idx = -1;
            for (var i = 1; i < arguments.length; i++) {
                var oI = arguments[i];
                for (var j = 0; j < arr.length; j++) {
                    if (oI === arr[j]) {
                        if (idx < 0) {
                            idx = j;
                        }
                        arr.splice(j--, 1);
                    }
                }
            }
            return idx;
        },

        /** 
        * 数组元素除重，得到新数据
        * @method unique
        * @static
        * @param {Array} arr 待处理的数组.
        * @return {void} 数组元素除重，得到新数据
        * @example 
        var arr=["a","b","a"];
        alert(unique(arr));
        */
        unique: function (arr) {
            var rlt = [],
        oI = null,
        indexOf = Array.indexOf || ArrayH.indexOf;
            for (var i = 0, len = arr.length; i < len; i++) {
                if (indexOf(rlt, oI = arr[i]) < 0) {
                    rlt.push(oI);
                }
            }
            return rlt;
        },

        /** 
        * 为数组元素进行递推操作�?
        * @method reduce
        * @static
        * @param {Array} arr 待处理的数组.
        * @param {Function} callback 需要执行的函数�?
        * @param {any} initial (Optional) 初始值，如果没有这初始，则从第一个有效元素开始。没有初始值，并且没有有效元素，会抛异�?
        * @return {any} 返回递推结果. 
        * @example 
        var arr=[1,2,3];
        alert(reduce(arr,function(a,b){return Math.max(a,b);}));
        */
        reduce: function (arr, callback, initial) {
            var len = arr.length;
            var i = 0;
            if (arguments.length < 3) { //找到第一个有效元素当作初始�?
                var hasV = 0;
                for (; i < len; i++) {
                    if (i in arr) {
                        initial = arr[i++];
                        hasV = 1;
                        break;
                    }
                }
                if (!hasV) {
                    throw new Error("No component to reduce");
                }
            }
            for (; i < len; i++) {
                if (i in arr) {
                    initial = callback(initial, arr[i], i, arr);
                }
            }
            return initial;
        },

        /** 
        * 为数组元素进行逆向递推操作�?
        * @method reduceRight
        * @static
        * @param {Array} arr 待处理的数组.
        * @param {Function} callback 需要执行的函数�?
        * @param {any} initial (Optional) 初始值，如果没有这初始，则从第一个有效元素开始。没有初始值，并且没有有效元素，会抛异�?
        * @return {any} 返回递推结果. 
        * @example 
        var arr=[1,2,3];
        alert(reduceRight(arr,function(a,b){return Math.max(a,b);}));
        */
        reduceRight: function (arr, callback, initial) {
            var len = arr.length;
            var i = len - 1;
            if (arguments.length < 3) { //逆向找到第一个有效元素当作初始�?
                var hasV = 0;
                for (; i > -1; i--) {
                    if (i in arr) {
                        initial = arr[i--];
                        hasV = 1;
                        break;
                    }
                }
                if (!hasV) {
                    throw new Error("No component to reduceRight");
                }
            }
            for (; i > -1; i--) {
                if (i in arr) {
                    initial = callback(initial, arr[i], i, arr);
                }
            }
            return initial;
        },

        /**
        * 将一个数组扁平化
        * @method expand
        * @static
        * @param arr {Array} 要扁平化的数�?
        * @return {Array} 扁平化后的数�?
        */
        expand: function (arr) {
            return [].concat.apply([], arr);
        },

        /** 
        * 将一个泛Array转化成一个Array对象�?
        * @method toArray
        * @static
        * @param {Array} arr 待处理的Array的泛型对�?.
        * @return {Array}  
        */
        toArray: function (arr) {
            var ret = [];
            for (var i = 0; i < arr.length; i++) {
                ret[i] = arr[i];
            }
            return ret;
        },


        /** 
        * 对数组进行包装�?
        * @method wrap
        * @static
        * @param {Array} arr 待处理的数组.
        * @param {Class} constructor 构造器
        * @returns {Object}: 返回new constructor(arr)
        */
        wrap: function (arr, constructor) {
            return new constructor(arr);
        }
    };

    QW.ArrayH = ArrayH;

} ());
/*
Copyright (c) Baidu Youa Wed QWrap
version: 1.0.1 2011-08-19 released
author: 月影
*/


/**
* @class HashsetH HashsetH是对不含有重复元素的数组进行操作的Helper
* @singleton 
* @namespace QW
* @helper 
*/

(function () {
    var contains = QW.ArrayH.contains;

    var HashsetH = {
        /** 
        * 合并两个已经uniquelize过的数组，相当于两个数组concat起来，再uniquelize，不过效率更�?
        * @method union
        * @static
        * @param {Array} arr 待处理的数组.
        * @param {Array} arr2 待处理的数组.
        * @return {Array} 返回一个新数组
        * @example 
        var arr=["a","b"];
        var arr2=["b","c"];
        alert(union(arr,arr2));
        */
        union: function (arr, arr2) {
            var ra = [];
            for (var i = 0, len = arr2.length; i < len; i++) {
                if (!contains(arr, arr2[i])) {
                    ra.push(arr2[i]);
                }
            }
            return arr.concat(ra);
        },
        /** 
        * 求两个已经uniquelize过的数组的交�?
        * @method intersect
        * @static
        * @param {Array} arr 待处理的数组.
        * @param {Array} arr2 待处理的数组.
        * @return {Array} 返回一个新数组
        * @example 
        var arr=["a","b"];
        var arr2=["b","c"];
        alert(intersect(arr,arr2));
        */
        intersect: function (arr, arr2) {
            var ra = [];
            for (var i = 0, len = arr2.length; i < len; i++) {
                if (contains(arr, arr2[i])) {
                    ra.push(arr2[i]);
                }
            }
            return ra;
        },
        /** 
        * 求两个已经uniquelize过的数组的差�?
        * @method minus
        * @static
        * @param {Array} arr 待处理的数组.
        * @param {Array} arr2 待处理的数组.
        * @return {Array} 返回一个新数组
        * @example 
        var arr=["a","b"];
        var arr2=["b","c"];
        alert(minus(arr,arr2));
        */
        minus: function (arr, arr2) {
            var ra = [];
            for (var i = 0, len = arr2.length; i < len; i++) {
                if (!contains(arr, arr2[i])) {
                    ra.push(arr2[i]);
                }
            }
            return ra;
        },
        /** 
        * 求两个已经uniquelize过的数组的补�?
        * @method complement
        * @static
        * @param {Array} arr 待处理的数组.
        * @param {Array} arr2 待处理的数组.
        * @return {Array} 返回一个新数组
        * @example 
        var arr=["a","b"];
        var arr2=["b","c"];
        alert(complement(arr,arr2));
        */
        complement: function (arr, arr2) {
            return HashsetH.minus(arr, arr2).concat(HashsetH.minus(arr2, arr));
        }
    };

    QW.HashsetH = HashsetH;

} ());
/*
Copyright (c) Baidu Youa Wed QWrap
version: 1.0.1 2011-08-19 released
author: JK
*/

/**
* @class DateH 核心对象Date的扩�?
* @singleton 
* @namespace QW
* @helper
*/

(function () {

    var DateH = {
        /** 
        * 格式化日�?
        * @method format
        * @static
        * @param {Date} d 日期对象
        * @param {string} pattern 日期格式(y年M月d天h时m分s�?)，默认为"yyyy-MM-dd"
        * @return {string}  返回format后的字符�?
        * @example
        var d=new Date();
        alert(format(d," yyyy年M月d日\n yyyy-MM-dd\n MM-dd-yy\n yyyy-MM-dd hh:mm:ss"));
        */
        format: function (d, pattern) {
            pattern = pattern || 'yyyy-MM-dd';
            var y = d.getFullYear().toString(),
        o = {
            M: d.getMonth() + 1,
            //month
            d: d.getDate(),
            //day
            h: d.getHours(),
            //hour
            m: d.getMinutes(),
            //minute
            s: d.getSeconds() //second
        };
            pattern = pattern.replace(/(y+)/ig, function (a, b) {
                return y.substr(4 - Math.min(4, b.length));
            });
            for (var i in o) {
                pattern = pattern.replace(new RegExp('(' + i + '+)', 'g'), function (a, b) {
                    return (o[i] < 10 && b.length > 1) ? '0' + o[i] : o[i];
                });
            }
            return pattern;
        }
    };

    QW.DateH = DateH;

} ());
/*
Copyright (c) Baidu Youa Wed QWrap
version: 1.0.1 2011-08-19 released
author: 月影、JK
*/

/**
* @class FunctionH 核心对象Function的扩�?
* @singleton 
* @namespace QW
* @helper
*/
(function () {

    var FunctionH = {
        /**
        * 函数包装�? methodize，对函数进行methodize化，使其的第一个参数为this，或this[attr]�?
        * @method methodize
        * @static
        * @param {function} func要方法化的函�?
        * @param {string} attr (Optional) 属�?
        * @return {function} 已方法化的函�?
        */
        methodize: function (func, attr) {
            if (attr) {
                return function () {
                    return func.apply(null, [this[attr]].concat([].slice.call(arguments)));
                };
            }
            return function () {
                return func.apply(null, [this].concat([].slice.call(arguments)));
            };
        },
        /** 对函数进行集化，使其第一个参数可以是数组
        * @method mul
        * @static
        * @param {function} func
        * @param {bite} opt 操作配置项，缺省表示默认�?
        1 表示getFirst将只操作第一个元素，
        2 表示joinLists，如果第一个参数是数组，将操作的结果扁平化返回
        * @return {Object} 已集化的函数
        */
        mul: function (func, opt) {
            var getFirst = opt == 1,
        joinLists = opt == 2;

            if (getFirst) {
                return function () {
                    var list = arguments[0];
                    if (!(list instanceof Array)) {
                        return func.apply(this, arguments);
                    }
                    if (list.length) {
                        var args = [].slice.call(arguments, 0);
                        args[0] = list[0];
                        return func.apply(this, args);
                    }
                };
            }

            return function () {
                var list = arguments[0];
                if (list instanceof Array) {
                    var moreArgs = [].slice.call(arguments, 0),
            ret = [],
            i = 0,
            len = list.length,
            r;
                    for (; i < len; i++) {
                        moreArgs[0] = list[i];
                        r = func.apply(this, moreArgs);
                        if (joinLists) {
                            if (r != null) {
                                ret = ret.concat(r);
                            }
                        }
                        else {
                            ret.push(r);
                        }
                    }
                    return ret;
                }
                else {
                    return func.apply(this, arguments);
                }
            };
        },
        /**
        * 函数包装变换
        * @method rwrap
        * @static
        * @param {func} 
        * @return {Function}
        */
        rwrap: function (func, wrapper, idx) {
            idx |= 0;
            return function () {
                var ret = func.apply(this, arguments);
                if (idx >= 0) {
                    ret = arguments[idx];
                }
                return wrapper ? new wrapper(ret) : ret;
            };
        },
        /**
        * 绑定
        * @method bind
        * @via https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
        * @compatibile ECMA-262, 5th (JavaScript 1.8.5)
        * @static
        * @param {func} 要绑定的函数
        * @obj {object} this_obj
        * @param {any} arg1 (Optional) 预先确定的参�?
        * @param {any} arg2 (Optional) 预先确定的参�?
        * @return {Function}
        */
        bind: function (func, obj) {
            var slice = [].slice,
        args = slice.call(arguments, 2),
        nop = function () { },
        bound = function () {
            return func.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
        };

            nop.prototype = func.prototype;

            bound.prototype = new nop();

            return bound;
        },
        /**
        * 懒惰执行某函数：一直到不得不执行的时候才执行�?
        * @method lazyApply
        * @static
        * @param {Function} fun  调用函数
        * @param {Object} thisObj  相当于apply方法的thisObj参数
        * @param {Array} argArray  相当于apply方法的argArray参数
        * @param {int} ims  interval毫秒数，即window.setInterval的第二个参数.
        * @param {Function} checker  定期运行的判断函数�?<br/>
        对于不同的返回值，得到不同的结果：<br/>
        返回true�?1，表示需要立即执�?<br/>
        返回-1，表示成功偷懒，不用再执�?<br/>
        返回其它值，表示暂时不执�?<br/>
        * @return {int}  返回interval的timerId
        */
        lazyApply: function (fun, thisObj, argArray, ims, checker) {
            checker = checker ||
      function () {
          return true;
      };
            var timer = function () {
                var verdict = checker();
                if (verdict == 1) {
                    fun.apply(thisObj, argArray || []);
                }
                if (verdict == 1 || verdict == -1) {
                    clearInterval(timerId);
                }
            },
        timerId = setInterval(timer, ims);
            return timerId;
        },

        toggle: function () {
            var i = 0,
        funlist = Array.prototype.slice.call(arguments, 0);
            return function () {
                return funlist[i++ % funlist.length].apply(this, arguments);
            }
        }
    };


    QW.FunctionH = FunctionH;

} ());
/*
Copyright (c) Baidu Youa Wed QWrap
version: 1.0.1 2011-08-19 released
author: 月影
*/

/**
* @class ClassH 为function提供强化的原型继承能�?
* @singleton 
* @namespace QW
* @helper
*/
(function () {
    var mix = QW.ObjectH.mix,
    create = QW.ObjectH.create;

    var ClassH = {
        /**
        * <p>为类型动态创建一个实例，它和直接new的区别在于instanceof的�?</p>
        * <p><strong>第二范式：new T <=> T.apply(T.getPrototypeObject())</strong></p>
        * @method createInstance
        * @static
        * @prarm {function} cls 要构造对象的类型（构造器�?
        * @return {object} 这个类型的一个实�?
        */
        createInstance: function (cls) {
            var p = create(cls.prototype);
            cls.apply(p, [].slice.call(arguments, 1));
            return p;
        },

        /**
        * 函数包装�? extend
        * <p>改进的对象原型继承，延迟执行参数构造，并在子类的实例中添加�?$super引用</p>
        * @method extend
        * @static
        * @param {function} cls 产生子类的原始类�?
        * @param {function} p 父类�?
        * @return {function} 返回以自身为构造器继承了p的类�?
        * @throw {Error} 不能对继承返回的类型再使用extend
        */
        extend: function (cls, p) {

            var T = function () { }; //构造prototype-chain
            T.prototype = p.prototype;

            var cp = cls.prototype;

            cls.prototype = new T();
            cls.$super = p; //在构造器内可以通过arguments.callee.$super执行父类构�?
            //如果原始类型的prototype上有方法，先copy
            mix(cls.prototype, cp, true);

            return cls;
        }
    };

    QW.ClassH = ClassH;

} ());
/*
Copyright (c) Baidu Youa Wed QWrap
version: 1.0.1 2011-08-19 released
author: 月影、JK
*/

/**
* Helper管理器，核心模块中用来管理Helper的子模块
* @module core
* @beta
* @submodule core_HelperH
*/

/**
* @class HelperH
* <p>一个Helper是指同时满足如下条件的一个对象：</p>
* <ol><li>Helper是一个不带有可枚举proto属性的简单对象（这意味着你可以用for...in...枚举一个Helper中的所有属性和方法�?</li>
* <li>Helper可以拥有属性和方法，但Helper对方法的定义必须满足如下条件�?</li>
* <div> 1). Helper的方法必须是静态方法，即内部不能使用this�?</div>
* <div> 2). 同一个Helper中的方法的第一个参数必须是相同类型或相同泛型�?</div>
* <li> Helper类型的名字必须以Helper或大写字母H结尾�? </li>
* <li> 对于只满足第一条的JSON，也算是泛Helper，通常以“U”（util）结尾�? </li>
* <li> 本来Util和Helper应该是继承关系，但是JavaScript里我们把继承关系简化了�?</li>
* </ol>
* @singleton
* @namespace QW
* @helper
*/

(function () {

    var FunctionH = QW.FunctionH,
    create = QW.ObjectH.create,
    Methodized = function () { };

    var HelperH = {
        /**
        * 对于需要返回wrap对象的helper方法，进行结果包�?
        * @method rwrap
        * @static
        * @param {Helper} helper Helper对象
        * @param {Class} wrapper 将返回值进行包装时的包装器(WrapClass)
        * @param {Object} wrapConfig 需要返回Wrap对象的方法的配置
        * @return {Object} 方法已rwrap化的<strong>新的</strong>Helper
        */
        rwrap: function (helper, wrapper, wrapConfig) {
            var ret = create(helper);
            wrapConfig = wrapConfig || 'operator';

            for (var i in helper) {
                var wrapType = wrapConfig,
          fn = helper[i];
                if (fn instanceof Function) {
                    if (typeof wrapType != 'string') {
                        wrapType = wrapConfig[i] || '';
                    }
                    if ('queryer' == wrapType) { //如果方法返回查询结果，对返回值进行包�?
                        ret[i] = FunctionH.rwrap(fn, wrapper, -1);
                    }
                    else if ('operator' == wrapType || 'methodized' == wrapType) { //如果方法只是执行一个操�?
                        if (helper instanceof Methodized || 'methodized' == wrapType) { //如果是methodized后的,对this直接返回
                            ret[i] = (function (fn) {
                                return function () {
                                    fn.apply(this, arguments);
                                    return this;
                                };
                            } (fn));
                        }
                        else {
                            ret[i] = FunctionH.rwrap(fn, wrapper, 0); //否则对第一个参数进行包装，针对getter系列
                        }
                    }
                }
                else {
                    ret[i] = fn;
                }
            }
            return ret;
        },
        /**
        * 根据配置，产生gsetter新方法，它根椐参数的长短来决定调用getter还是setter
        * @method gsetter
        * @static
        * @param {Helper} helper Helper对象
        * @param {Object} gsetterConfig 需要返回Wrap对象的方法的配置
        * @return {Object} 方法已gsetter化的<strong>新的</strong>helper
        */
        gsetter: function (helper, gsetterConfig) {
            var ret = create(helper);
            gsetterConfig = gsetterConfig || {};

            for (var i in gsetterConfig) {
                if (helper instanceof Methodized) {
                    ret[i] = (function (config) {
                        return function () {
                            return ret[config[Math.min(arguments.length, config.length - 1)]].apply(this, arguments);
                        };
                    } (gsetterConfig[i]));
                }
                else {
                    ret[i] = (function (config) {
                        return function () {
                            return ret[config[Math.min(arguments.length, config.length) - 1]].apply(null, arguments);
                        };
                    } (gsetterConfig[i]));
                }
            }
            return ret;
        },

        /**
        * 对helper的方法，进行mul化，使其可以处理第一个参数是数组的情�?
        * @method mul
        * @static
        * @param {Helper} helper Helper对象
        * @param {json|string} mulConfig 如果某个方法的mulConfig类型和含义如下：
        getter 或getter_first_all //同时生成get--(返回fist)、getAll--(返回all)
        getter_first	//生成get--(返回first)
        getter_all	//生成get--(返回all)
        queryer		//生成get--(返回concat all结果)
        * @return {Object} 方法已mul化的<strong>新的</strong>Helper
        */
        mul: function (helper, mulConfig) {
            var ret = create(helper);
            mulConfig = mulConfig || {};

            for (var i in helper) {
                var fn = helper[i];
                if (fn instanceof Function) {
                    var mulType = mulConfig;
                    if (typeof mulType != 'string') {
                        mulType = mulConfig[i] || '';
                    }

                    if ("getter" == mulType || "getter_first" == mulType || "getter_first_all" == mulType) {
                        //如果是配置成gettter||getter_first||getter_first_all，那么需要用第一个参�?
                        ret[i] = FunctionH.mul(fn, 1);
                    }
                    else if ("getter_all" == mulType) {
                        ret[i] = FunctionH.mul(fn, 0);
                    }
                    else {
                        ret[i] = FunctionH.mul(fn, 2); //operator、queryer的话需要join返回值，把返回值join起来的说
                    }
                    if ("getter" == mulType || "getter_first_all" == mulType) {
                        //如果配置成getter||getter_first_all，那么还会生成一个带All后缀的方�?
                        ret[i + "All"] = FunctionH.mul(fn, 0);
                    }
                }
                else {
                    ret[i] = fn;
                }
            }
            return ret;
        },
        /**
        * 对helper的方法，进行methodize化，使其的第一个参数为this，或this[attr]�?
        * @method methodize
        * @static
        * @param {Helper} helper Helper对象，如DateH
        * @param {optional} attr (Optional)属�?
        * @return {Object} 方法已methodize化的对象
        */
        methodize: function (helper, attr) {
            var ret = new Methodized(); //因为 methodize 之后gsetter和rwrap的行为不一�?  
            for (var i in helper) {
                var fn = helper[i];

                if (fn instanceof Function) {
                    ret[i] = FunctionH.methodize(fn, attr);
                }
                else {
                    ret[i] = fn;
                }
            }
            return ret;
        }

    };

    QW.HelperH = HelperH;
} ());
/*
Copyright (c) Baidu Youa Wed QWrap
version: 1.0.1 2011-08-19 released
author: JK
*/


(function () {
    var mix = QW.ObjectH.mix,
    indexOf = QW.ArrayH.indexOf;

    //----------QW.CustEvent----------
    /**
    * @class CustEvent 自定义事�?
    * @namespace QW
    * @param {object} target 事件所属对象，即：是哪个对象的事件�?
    * @param {string} type 事件类型。备用�?
    * @param {object} eventArgs (Optional) 自定义事件参�?
    * @returns {CustEvent} 自定义事�?
    */
    var CustEvent = function (target, type, eventArgs) {
        this.target = target;
        this.type = type;
        mix(this, eventArgs || {}, true); //支持自定义类型的覆盖
    };

    mix(CustEvent.prototype, {
        /**
        * @property {Object} target CustEvent的target
        */
        target: null,
        /**
        * @property {Object} currentTarget CustEvent的currentTarget，即事件派发�?
        */
        currentTarget: null,
        /**
        * @property {String} type CustEvent的类�?
        */
        type: null,
        /**
        * @property {boolean} returnValue fire方法执行后的遗留产物�?(建议规则:对于onbeforexxxx事件，如果returnValue===false，则不执行该事件)�?
        */
        returnValue: undefined,
        /**
        * 设置event的返回值为false�?
        * @method preventDefault
        * @returns {void} 无返回�?
        */
        preventDefault: function () {
            this.returnValue = false;
        }
    });
    /**
    * 为一个对象添加一系列事件，并添加on/un/fire三个方法，参见：QW.CustEventTarget.createEvents
    * @static
    * @method createEvents
    * @param {Object} obj 事件所属对象，即：是哪个对象的事件�?
    * @param {String|Array} types 事件名称�?
    * @returns {void} 无返回�?
    */


    /**
    * @class CustEventTargetH  CustEventTarget的Helper
    * @singleton 
    * @namespace QW
    */

    var CustEventTargetH = {
        /**
        * 添加监控
        * @method on 
        * @param {string} sEvent 事件名称�?
        * @param {Function} fn 监控函数，在CustEvent fire时，this将会指向oScope，而第一个参数，将会是一个CustEvent对象�?
        * @return {boolean} 是否成功添加监控。例如：重复添加监控，会导致返回false.
        * @throw {Error} 如果没有对事件进行初始化，则会抛�?
        */
        on: function (target, sEvent, fn) {
            var cbs = (target.__custListeners && target.__custListeners[sEvent]) || QW.error("unknown event type", TypeError);
            if (indexOf(cbs, fn) > -1) {
                return false;
            }
            cbs.push(fn);
            return true;
        },
        /**
        * 取消监控
        * @method un
        * @param {string} sEvent 事件名称�?
        * @param {Function} fn 监控函数
        * @return {boolean} 是否有效执行un.
        * @throw {Error} 如果没有对事件进行初始化，则会抛�?
        */
        un: function (target, sEvent, fn) {
            var cbs = (target.__custListeners && target.__custListeners[sEvent]) || QW.error("unknown event type", TypeError);
            if (fn) {
                var idx = indexOf(cbs, fn);
                if (idx < 0) {
                    return false;
                }
                cbs.splice(idx, 1);
            }
            else {
                cbs.length = 0;
            }
            return true;

        },
        /**
        * 事件触发。触发事件时，在监控函数里，this将会指向oScope，而第一个参数，将会是一个CustEvent对象，与Dom3的listener的参数类似�?<br/>
        如果this.target['on'+this.type],则也会执行该方法,与HTMLElement的独占模式的事件(如el.onclick=function(){alert(1)})类似.<br/>
        如果createEvents的事件类型中包含"*"，则所有事件最终也会落到on("*").
        * @method fire 
        * @param {string | sEvent} sEvent 自定义事件，或事件名称�? 如果是事件名称，相当于传new CustEvent(this,sEvent,eventArgs).
        * @param {object} eventArgs (Optional) 自定义事件参�?
        * @return {boolean} 以下两种情况返回false，其它情况下返回true.
        1. 所有callback(包括独占模式的onxxx)执行完后，custEvent.returnValue===false
        2. 所有callback(包括独占模式的onxxx)执行完后，custEvent.returnValue===undefined，并且独占模式的onxxx()的返回值为false.
        */
        fire: function (target, sEvent, eventArgs) {
            if (sEvent instanceof CustEvent) {
                var custEvent = mix(sEvent, eventArgs, true);
                sEvent = sEvent.type;
            }
            else {
                custEvent = new CustEvent(target, sEvent, eventArgs);
            }

            var cbs = (target.__custListeners && target.__custListeners[sEvent]) || QW.error("unknown event type", TypeError);
            if (sEvent != "*") {
                cbs = cbs.concat(target.__custListeners["*"] || []);
            }

            custEvent.returnValue = undefined; //去掉本句，会导致静态CustEvent的returnValue向后污染
            custEvent.currentTarget = target;
            var obj = custEvent.currentTarget;
            if (obj && obj['on' + custEvent.type]) {
                var retDef = obj['on' + custEvent.type].call(obj, custEvent); //对于独占模式的返回值，会弱影响event.returnValue
            }

            for (var i = 0; i < cbs.length; i++) {
                cbs[i].call(obj, custEvent);
            }
            return custEvent.returnValue !== false || (retDef === false && custEvent.returnValue === undefined);
        },
        /**
        * 为一个对象添加一系列事件，并添加on/un/fire三个方法<br/>
        * 添加的事件中自动包含一个特殊的事件类型"*"，这个事件类型没有独占模式，所有事件均会落到on("*")事件对应的处理函数中
        * @static
        * @method createEvents
        * @param {Object} obj 事件所属对象，即：是哪个对象的事件�?
        * @param {String|Array} types 事件名称�?
        * @returns {any} target
        */
        createEvents: function (target, types) {
            types = types || [];
            if (typeof types == "string") {
                types = types.split(",");
            }
            var listeners = target.__custListeners;
            if (!listeners) {
                listeners = target.__custListeners = {};
            }
            for (var i = 0; i < types.length; i++) {
                listeners[types[i]] = listeners[types[i]] || []; //可以重复create，而不影响之前的listerners.
            }
            listeners['*'] = listeners["*"] || [];
            return target;
        }
    };

    /**
    * @class CustEventTarget  自定义事件Target，有以下序列方法：createEvents、on、un、fire；参见CustEventTargetH
    * @namespace QW
    */

    var CustEventTarget = function () {
        this.__custListeners = {};
    };
    var methodized = QW.HelperH.methodize(CustEventTargetH);
    mix(CustEventTarget.prototype, methodized);

    CustEvent.createEvents = function (target, types) {
        CustEventTargetH.createEvents(target, types);
        return mix(target, methodized); //尊重对象本身的on�?
    };

    /*
    * 输出到QW
    */
    QW.CustEvent = CustEvent;
    QW.CustEventTargetH = CustEventTargetH;
    QW.CustEventTarget = CustEventTarget;

} ());
/*
Copyright (c) Baidu Youa Wed QWrap
version: 1.0.1 2011-08-19 released
author: JK
*/


/**
* @class Selector Css Selector相关的几个方�?
* @singleton
* @namespace QW
*/
(function () {
    var trim = QW.StringH.trim,
    encode4Js = QW.StringH.encode4Js;

    var Selector = {
        /**
        * @property {int} queryStamp 最后一次查询的时间戳，扩展伪类时可能会用到，以提�?
        */
        queryStamp: 0,
        /**
        * @property {Json} _operators selector属性运算符
        */
        _operators: { //以下表达式，aa表示attr值，vv表示比较的�?
            '': 'aa',
            //isTrue|hasValue
            '=': 'aa=="vv"',
            //equal
            '!=': 'aa!="vv"',
            //unequal
            '~=': 'aa&&(" "+aa+" ").indexOf(" vv ")>-1',
            //onePart
            '|=': 'aa&&(aa+"-").indexOf("vv-")==0',
            //firstPart
            '^=': 'aa&&aa.indexOf("vv")==0',
            // beginWith
            '$=': 'aa&&aa.lastIndexOf("vv")==aa.length-"vv".length',
            // endWith
            '*=': 'aa&&aa.indexOf("vv")>-1' //contains
        },
        /**
        * @property {Json} _pseudos 伪类逻辑
        */
        _pseudos: {
            "first-child": function (a) {
                return !(a = a.previousSibling) || !a.tagName && !a.previousSibling;
            },
            "last-child": function (a) {
                return !(a = a.nextSibling) || !a.tagName && !a.nextSibling;
            },
            "only-child": function (a) {
                var el;
                return !((el = a.previousSibling) && (el.tagName || el.previousSibling) || (el = a.nextSibling) && (el.tagName || el.nextSibling));
            },
            "nth-child": function (a, nth) {
                return checkNth(a, nth);
            },
            "nth-last-child": function (a, nth) {
                return checkNth(a, nth, true);
            },
            "first-of-type": function (a) {
                var tag = a.tagName;
                var el = a;
                while (el = el.previousSlibling) {
                    if (el.tagName == tag) return false;
                }
                return true;
            },
            "last-of-type": function (a) {
                var tag = a.tagName;
                var el = a;
                while (el = el.nextSibling) {
                    if (el.tagName == tag) return false;
                }
                return true;
            },
            "only-of-type": function (a) {
                var els = a.parentNode.childNodes;
                for (var i = els.length - 1; i > -1; i--) {
                    if (els[i].tagName == a.tagName && els[i] != a) return false;
                }
                return true;
            },
            "nth-of-type": function (a, nth) {
                var idx = 1;
                var el = a;
                while (el = el.previousSibling) {
                    if (el.tagName == a.tagName) idx++;
                }
                return checkNth(idx, nth);
            },
            //JK：懒得为这两个伪类作性能优化
            "nth-last-of-type": function (a, nth) {
                var idx = 1;
                var el = a;
                while (el = el.nextSibling) {
                    if (el.tagName == a.tagName) idx++;
                }
                return checkNth(idx, nth);
            },
            //JK：懒得为这两个伪类作性能优化
            "empty": function (a) {
                return !a.firstChild;
            },
            "parent": function (a) {
                return !!a.firstChild;
            },
            "not": function (a, sSelector) {
                return !s2f(sSelector)(a);
            },
            "enabled": function (a) {
                return !a.disabled;
            },
            "disabled": function (a) {
                return a.disabled;
            },
            "checked": function (a) {
                return a.checked;
            },
            "focus": function (a) {
                return a == a.ownerDocument.activeElement;
            },
            "indeterminate": function (a) {
                return a.indeterminate;
            },
            "input": function (a) {
                return /input|select|textarea|button/i.test(a.nodeName);
            },
            "contains": function (a, s) {
                return (a.textContent || a.innerText || "").indexOf(s) >= 0;
            }
        },
        /**
        * @property {Json} _attrGetters 常用的Element属�?
        */
        _attrGetters: (function () {
            var o = {
                'class': 'el.className',
                'for': 'el.htmlFor',
                'href': 'el.getAttribute("href",2)'
            };
            var attrs = 'name,id,className,value,selected,checked,disabled,type,tagName,readOnly,offsetWidth,offsetHeight,innerHTML'.split(',');
            for (var i = 0, a; a = attrs[i]; i++) o[a] = "el." + a;
            return o;
        } ()),
        /**
        * @property {Json} _relations selector关系运算�?
        */
        _relations: {
            //寻祖
            "": function (el, filter, topEl) {
                while ((el = el.parentNode) && el != topEl) {
                    if (filter(el)) return el;
                }
                return null;
            },
            //寻父
            ">": function (el, filter, topEl) {
                el = el.parentNode;
                return el != topEl && filter(el) ? el : null;
            },
            //寻最小的哥哥
            "+": function (el, filter, topEl) {
                while (el = el.previousSibling) {
                    if (el.tagName) {
                        return filter(el) && el;
                    }
                }
                return null;
            },
            //寻所有的哥哥
            "~": function (el, filter, topEl) {
                while (el = el.previousSibling) {
                    if (el.tagName && filter(el)) {
                        return el;
                    }
                }
                return null;
            }
        },
        /** 
        * 把一个selector字符串转化成一个过滤函�?.
        * @method selector2Filter
        * @static
        * @param {string} sSelector 过滤selector，这个selector里没有关系运算符�?", >+~"�?
        * @returns {function} : 返回过滤函数�?
        * @example: 
        var fun=selector2Filter("input.aaa");alert(fun);
        */
        selector2Filter: function (sSelector) {
            return s2f(sSelector);
        },
        /** 
        * 判断一个元素是否符合某selector.
        * @method test 
        * @static
        * @param {HTMLElement} el: 被考察参数
        * @param {string} sSelector: 过滤selector，这个selector里没有关系运算符�?", >+~"�?
        * @returns {function} : 返回过滤函数�?
        */
        test: function (el, sSelector) {
            return s2f(sSelector)(el);
        },
        /** 
        * 用一个css selector来过滤一个数�?.
        * @method filter 
        * @static
        * @param {Array|Collection} els: 元素数组
        * @param {string} sSelector: 过滤selector，这个selector里的第一个关系符不可以是�?+”“~”�?
        * @param {Element} pEl: 父节点。默认是document
        * @returns {Array} : 返回满足过滤条件的元素组成的数组�?
        */
        filter: function (els, sSelector, pEl) {
            var pEl = pEl || document,
        groups = trim(sSelector).split(",");
            if (groups.length < 2) {
                return filterByRelation(pEl || document, els, splitSelector(sSelector));
            }
            else { //如果有逗号关系符，则满足其中一个selector就通过筛选。以下代码，需要考虑：“尊重els的原顺序”�?
                var filteredEls = filterByRelation(pEl || document, els, splitSelector(groups[0]));
                if (filteredEls.length == els.length) { //如果第一个过滤筛完，则直接返�?
                    return filteredEls;
                }
                for (var j = 0, el; el = els[j++]; ) {
                    el.__QWSltFlted = 0;
                }
                for (j = 0, el; el = filteredEls[j++]; ) {
                    el.__QWSltFlted = 1;
                }
                var leftEls = els,
          tempLeftEls;
                for (var i = 1; i < groups.length; i++) {
                    tempLeftEls = [];
                    for (j = 0, el; el = leftEls[j++]; ) {
                        if (!el.__QWSltFlted) tempLeftEls.push(el);
                    }
                    leftEls = tempLeftEls;
                    filteredEls = filterByRelation(pEl || document, leftEls, splitSelector(groups[i]));
                    for (j = 0, el; el = filteredEls[j++]; ) {
                        el.__QWSltFlted = 1;
                    }
                }
                var ret = [];
                for (j = 0, el; el = els[j++]; ) {
                    if (el.__QWSltFlted) ret.push(el);
                }
                return ret;
            }
        },
        /** 
        * 以refEl为参考，得到符合过滤条件的HTML Elements. refEl可以是element或者是document
        * @method query
        * @static
        * @param {HTMLElement} refEl: 参考对�?
        * @param {string} sSelector: 过滤selector,
        * @returns {array} : 返回elements数组�?
        * @example: 
        var els=query(document,"li input.aaa");
        for(var i=0;i<els.length;i++ )els[i].style.backgroundColor='red';
        */
        query: function (refEl, sSelector) {
            Selector.queryStamp = queryStamp++;
            refEl = refEl || document;
            var els = nativeQuery(refEl, sSelector);
            if (els) return els; //优先使用原生�?
            var groups = trim(sSelector).split(",");
            els = querySimple(refEl, groups[0]);
            for (var i = 1, gI; gI = groups[i]; i++) {
                var els2 = querySimple(refEl, gI);
                els = els.concat(els2);
                //els=union(els,els2);//除重有负作用，例如效率或污染，放弃除�?
            }
            return els;
        },
        /** 
        * 以refEl为参考，得到符合过滤条件的一个元�?. refEl可以是element或者是document
        * @method one
        * @static
        * @param {HTMLElement} refEl: 参考对�?
        * @param {string} sSelector: 过滤selector,
        * @returns {HTMLElement} : 返回element，如果获取不到，则反回null�?
        * @example: 
        var els=query(document,"li input.aaa");
        for(var i=0;i<els.length;i++ )els[i].style.backgroundColor='red';
        */
        one: function (refEl, sSelector) {
            var els = Selector.query(refEl, sSelector);
            return els[0];
        }


    };

    window.__SltPsds = Selector._pseudos; //JK 2010-11-11：为提高效率
    /*
    retTrue 一个返回为true的函�?
    */

    function retTrue() {
        return true;
    }

    /*
    arrFilter(arr,callback) : 对arr里的元素进行过滤
    */

    function arrFilter(arr, callback) {
        var rlt = [],
      i = 0;
        if (callback == retTrue) {
            if (arr instanceof Array) {
                return arr.slice(0);
            }
            else {
                for (var len = arr.length; i < len; i++) {
                    rlt[i] = arr[i];
                }
            }
        }
        else {
            for (var oI; oI = arr[i++]; ) {
                callback(oI) && rlt.push(oI);
            }
        }
        return rlt;
    }

    var elContains, hasNativeQuery;

    function getChildren(pEl) { //需要剔除textNode与�?<!--xx-->”节�?
        var els = pEl.children || pEl.childNodes,
      len = els.length,
      ret = [],
      i = 0;
        for (; i < len; i++) if (els[i].nodeType == 1) ret.push(els[i]);
        return ret;
    }

    function findId(id) {
        return document.getElementById(id);
    }

    (function () {
        var div = document.createElement('div');
        div.innerHTML = '<div class="aaa"></div>';
        hasNativeQuery = (div.querySelectorAll && div.querySelectorAll('.aaa').length == 1); //部分浏览器不支持原生querySelectorAll()，例如IE8-
        elContains = div.contains ?
    function (pEl, el) {
        return pEl != el && pEl.contains(el);
    } : function (pEl, el) {
        return (pEl.compareDocumentPosition(el) & 16);
    };
    } ());


    function checkNth(el, nth, reverse) {
        if (nth == 'n') {
            return true;
        }
        if (typeof el == 'number') {
            var idx = el;
        }
        else {
            var pEl = el.parentNode;
            if (pEl.__queryStamp != queryStamp) {
                var nEl = {
                    nextSibling: pEl.firstChild
                },
          n = 1;
                while (nEl = nEl.nextSibling) {
                    if (nEl.nodeType == 1) nEl.__siblingIdx = n++;
                }
                pEl.__queryStamp = queryStamp;
                pEl.__childrenNum = n - 1;
            }
            if (reverse) idx = pEl.__childrenNum - el.__siblingIdx + 1;
            else idx = el.__siblingIdx;
        }
        switch (nth) {
            case 'even':
            case '2n':
                return idx % 2 == 0;
            case 'odd':
            case '2n+1':
                return idx % 2 == 1;
            default:
                if (!(/n/.test(nth))) return idx == nth;
                var arr = nth.replace(/(^|\D+)n/g, "$11n").split("n"),
        k = arr[0] | 0,
        kn = idx - arr[1] | 0;
                return k * kn >= 0 && kn % k == 0;
        }
    }
    /*
    * s2f(sSelector): 由一个selector得到一个过滤函数filter，这个selector里没有关系运算符�?", >+~"�?
    */
    var filterCache = {};

    function s2f(sSelector, isForArray) {
        if (!isForArray && filterCache[sSelector]) return filterCache[sSelector];
        var pseudos = [],
        //伪类数组,每一个元素都是数组，依次为：伪类名／伪类�?
      s = trim(sSelector),
      reg = /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/g,
        //属性选择表达式解�?,thanks JQuery
      sFun = [];
        s = s.replace(/\:([\w\-]+)(\(([^)]+)\))?/g, //伪类

    function (a, b, c, d, e) {
        pseudos.push([b, d]);
        return "";
    }).replace(/^\*/g, function (a) { //任意tagName缩略写法
        sFun.push('el.nodeType==1');
        return '';
    }).replace(/^([\w\-]+)/g, //tagName缩略写法

    function (a) {
        sFun.push('(el.tagName||"").toUpperCase()=="' + a.toUpperCase() + '"');
        return '';
    }).replace(/([\[(].*)|#([\w\-]+)|\.([\w\-]+)/g, //id缩略写法//className缩略写法

    function (a, b, c, d) {
        return b || c && '[id="' + c + '"]' || d && '[className~="' + d + '"]';
    }).replace(reg, //普通写法[foo][foo=""][foo~=""]�?

    function (a, b, c, d, e) {
        var attrGetter = Selector._attrGetters[b] || 'el.getAttribute("' + b + '")';
        sFun.push(Selector._operators[c || ''].replace(/aa/g, attrGetter).replace(/vv/g, e || ''));
        return '';
    });
        if (!(/^\s*$/).test(s)) {
            throw "Unsupported Selector:\n" + sSelector + "\n-" + s;
        }
        for (var i = 0, pI; pI = pseudos[i]; i++) { //伪类过滤
            if (!Selector._pseudos[pI[0]]) throw "Unsupported Selector:\n" + pI[0] + "\n" + s;
            if (/^(nth-|not|contains)/.test(pI[0])) {
                sFun.push('__SltPsds["' + pI[0] + '"](el,"' + encode4Js(pI[1]) + '")');
            }
            else {
                sFun.push('__SltPsds["' + pI[0] + '"](el)');
            }
        }
        if (sFun.length) {
            if (isForArray) {
                return new Function('els', 'var els2=[];for(var i=0,el;el=els[i++];){if(' + sFun.join('&&') + ') els2.push(el);} return els2;');
            }
            else {
                return (filterCache[sSelector] = new Function('el', 'return ' + sFun.join('&&') + ';'));
            }
        }
        else {
            if (isForArray) {
                return function (els) {
                    return arrFilter(els, retTrue);
                };
            }
            else {
                return (filterCache[sSelector] = retTrue);
            }

        }
    }

    /* 
    * {int} xxxStamp: 全局变量查询标记
    */
    var queryStamp = 0,
    nativeQueryStamp = 0,
    querySimpleStamp = 0;

    /*
    * nativeQuery(refEl,sSelector): 如果有原生的querySelectorAll，并且只是简单查询，则调用原生的query，否则返回null. 
    * @param {Element} refEl 参考元�?
    * @param {string} sSelector selector字符�?
    * @returns 
    */

    function nativeQuery(refEl, sSelector) {
        if (hasNativeQuery && /^((^|,)\s*[.\w-][.\w\s\->+~]*)+$/.test(sSelector)) {
            //如果浏览器自带有querySelectorAll，并且本次query的是简单selector，则直接调用selector以加�?
            //部分浏览器不支持�?">~+"开始的关系运算�?
            var oldId = refEl.id,
        tempId, arr = [],
        els;
            if (!oldId && refEl.parentNode) { //标准的querySelectorAll中的selector是相对于:root的，而不是相对于:scope�?
                tempId = refEl.id = '__QW_slt_' + nativeQueryStamp++;
                try {
                    els = refEl.querySelectorAll('#' + tempId + ' ' + sSelector);
                }
                finally {
                    refEl.removeAttribute('id');
                }
            }
            else {
                els = refEl.querySelectorAll(sSelector);
            }
            for (var i = 0, elI; elI = els[i++]; ) arr.push(elI);
            return arr;
        }
        return null;
    }

    /* 
    * querySimple(pEl,sSelector): 得到以pEl为参考，符合过滤条件的HTML Elements. 
    * @param {Element} pEl 参考元�?
    * @param {string} sSelector 里没�?","运算�?
    * @see: query�?
    */

    function querySimple(pEl, sSelector) {
        querySimpleStamp++;
        /*
        为了提高查询速度，有以下优先原则�?
        最优先：原生查�?
        次优先：�?' '�?'>'关系符出现前，优先正向（从左到右）查�?
        次优先：id查询
        次优先：只有一个关系符，则直接查询
        最原始策略，采用关系判断，即：从最底层向最上层连线，能连线成功，则满足条件
        */

        //最优先：原生查�?
        var els = nativeQuery(pEl, sSelector);
        if (els) return els; //优先使用原生�?
        var sltors = splitSelector(sSelector),
      pEls = [pEl],
      i, elI, pElI;

        var sltor0;
        //次优先：�?' '�?'>'关系符出现前，优先正向（从上到下）查�?
        while (sltor0 = sltors[0]) {
            if (!pEls.length) return [];
            var relation = sltor0[0];
            els = [];
            if (relation == '+') { //第一个弟�?
                filter = s2f(sltor0[1]);
                for (i = 0; elI = pEls[i++]; ) {
                    while (elI = elI.nextSibling) {
                        if (elI.tagName) {
                            if (filter(elI)) els.push(elI);
                            break;
                        }
                    }
                }
                pEls = els;
                sltors.splice(0, 1);
            }
            else if (relation == '~') { //所有的弟弟
                filter = s2f(sltor0[1]);
                for (i = 0; elI = pEls[i++]; ) {
                    if (i > 1 && elI.parentNode == pEls[i - 2].parentNode) continue; //除重：如果已经query过兄长，则不必query弟弟
                    while (elI = elI.nextSibling) {
                        if (elI.tagName) {
                            if (filter(elI)) els.push(elI);
                        }
                    }
                }
                pEls = els;
                sltors.splice(0, 1);
            }
            else {
                break;
            }
        }
        var sltorsLen = sltors.length;
        if (!sltorsLen || !pEls.length) return pEls;

        //次优先：idIdx查询
        for (var idIdx = 0, id; sltor = sltors[idIdx]; idIdx++) {
            if ((/^[.\w-]*#([\w-]+)/i).test(sltor[1])) {
                id = RegExp.$1;
                sltor[1] = sltor[1].replace('#' + id, '');
                break;
            }
        }
        if (idIdx < sltorsLen) { //存在id
            var idEl = findId(id);
            if (!idEl) return [];
            for (i = 0, pElI; pElI = pEls[i++]; ) {
                if (!pElI.parentNode || elContains(pElI, idEl)) {
                    els = filterByRelation(pElI, [idEl], sltors.slice(0, idIdx + 1));
                    if (!els.length || idIdx == sltorsLen - 1) return els;
                    return querySimple(idEl, sltors.slice(idIdx + 1).join(',').replace(/,/g, ' '));
                }
            }
            return [];
        }

        //---------------
        var getChildrenFun = function (pEl) {
            return pEl.getElementsByTagName(tagName);
        },
      tagName = '*',
      className = '';
        sSelector = sltors[sltorsLen - 1][1];
        sSelector = sSelector.replace(/^[\w\-]+/, function (a) {
            tagName = a;
            return "";
        });
        if (hasNativeQuery) {
            sSelector = sSelector.replace(/^[\w\*]*\.([\w\-]+)/, function (a, b) {
                className = b;
                return "";
            });
        }
        if (className) {
            getChildrenFun = function (pEl) {
                return pEl.querySelectorAll(tagName + '.' + className);
            };
        }

        //次优先：只剩一�?'>'�?' '关系�?(结合前面的代码，这时不可能出现还只剩'+'�?'~'关系�?)
        if (sltorsLen == 1) {
            if (sltors[0][0] == '>') {
                getChildrenFun = getChildren;
                var filter = s2f(sltors[0][1], true);
            }
            else {
                filter = s2f(sSelector, true);
            }
            els = [];
            for (i = 0; pElI = pEls[i++]; ) {
                els = els.concat(filter(getChildrenFun(pElI)));
            }
            return els;
        }

        //走第一个关系符�?'>'�?' '的万能方�?
        sltors[sltors.length - 1][1] = sSelector;
        els = [];
        for (i = 0; pElI = pEls[i++]; ) {
            els = els.concat(filterByRelation(pElI, getChildrenFun(pElI), sltors));
        }
        return els;
    }


    function splitSelector(sSelector) {
        var sltors = [];
        var reg = /(^|\s*[>+~ ]\s*)(([\w\-\:.#*]+|\([^\)]*\)|\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\6|)\s*\])+)(?=($|\s*[>+~ ]\s*))/g;
        var s = trim(sSelector).replace(reg, function (a, b, c, d) {
            sltors.push([trim(b), c]);
            return "";
        });
        if (!(/^\s*$/).test(s)) {
            throw "Unsupported Selector:\n" + sSelector + "\n--" + s;
        }
        return sltors;
    }

    /*
    判断一个长辈与子孙节点是否满足关系要求�?----特别说明：这里的第一个关系只能是父子关系，或祖孙关系;
    */

    function filterByRelation(pEl, els, sltors) {
        var sltor = sltors[0],
      len = sltors.length,
      needNotTopJudge = !sltor[0],
      filters = [],
      relations = [],
      needNext = [],
      relationsStr = '';

        for (var i = 0; i < len; i++) {
            sltor = sltors[i];
            filters[i] = s2f(sltor[1], i == len - 1); //过滤
            relations[i] = Selector._relations[sltor[0]]; //寻亲函数
            if (sltor[0] == '' || sltor[0] == '~') needNext[i] = true; //是否递归寻亲
            relationsStr += sltor[0] || ' ';
        }
        els = filters[len - 1](els); //自身过滤
        if (relationsStr == ' ') return els;
        if (/[+>~] |[+]~/.test(relationsStr)) { //需要回�?
            //alert(1); //用到这个分支的可能性很小。放弃效率的追求�?

            function chkRelation(el) { //关系人过�?
                var parties = [],
                //中间关系�?
          j = len - 1,
          party = parties[j] = el;
                for (; j > -1; j--) {
                    if (j > 0) { //非最后一步的情况
                        party = relations[j](party, filters[j - 1], pEl);
                    }
                    else if (needNotTopJudge || party.parentNode == pEl) { //最后一步通过判断
                        return true;
                    }
                    else { //最后一步未通过判断
                        party = null;
                    }
                    while (!party) { //回溯
                        if (++j == len) { //cache不通过
                            return false;
                        }
                        if (needNext[j]) {
                            party = parties[j - 1];
                            j++;
                        }
                    }
                    parties[j - 1] = party;
                }
            };
            return arrFilter(els, chkRelation);
        }
        else { //不需回溯
            var els2 = [];
            for (var i = 0, el, elI; el = elI = els[i++]; ) {
                for (var j = len - 1; j > 0; j--) {
                    if (!(el = relations[j](el, filters[j - 1], pEl))) {
                        break;
                    }
                }
                if (el && (needNotTopJudge || el.parentNode == pEl)) els2.push(elI);
            }
            return els2;
        }

    }

    QW.Selector = Selector;
} ());
/*
Copyright (c) Baidu Youa Wed QWrap
author: 好奇、魔力鸟
*/

/** 
* Dom Utils，是Dom模块核心�?
* @class DomU
* @singleton
* @namespace QW
*/
(function () {
    var Selector = QW.Selector;
    var Browser = QW.Browser;
    var DomU = {

        /** 
        * 按cssselector获取元素�? 
        * @method	query
        * @param {String} sSelector cssselector字符�?
        * @param {Element} refEl (Optional) 参考元素，默认为document.documentElement
        * @return {Array}
        */
        query: function (sSelector, refEl) {
            return Selector.query(refEl || document.documentElement, sSelector);
        },
        /** 
        * 获取doc的一些坐标信�? 
        * 参考与YUI3.1.1
        * @refer  https://github.com/yui/yui3/blob/master/build/dom/dom.js
        * @method	getDocRect
        * @param	{object} doc (Optional) document对象/默认为当前宿主的document
        * @return	{object} 包含doc的scrollX,scrollY,width,height,scrollHeight,scrollWidth值的json
        */
        getDocRect: function (doc) {
            doc = doc || document;

            var win = doc.defaultView || doc.parentWindow,
        mode = doc.compatMode,
        root = doc.documentElement,
        h = win.innerHeight || 0,
        w = win.innerWidth || 0,
        scrollX = win.pageXOffset || 0,
        scrollY = win.pageYOffset || 0,
        scrollW = root.scrollWidth,
        scrollH = root.scrollHeight;

            if (mode != 'CSS1Compat') { // Quirks
                root = doc.body;
                scrollW = root.scrollWidth;
                scrollH = root.scrollHeight;
            }

            if (mode && !Browser.opera) { // IE, Gecko
                w = root.clientWidth;
                h = root.clientHeight;
            }

            scrollW = Math.max(scrollW, w);
            scrollH = Math.max(scrollH, h);

            scrollX = Math.max(scrollX, doc.documentElement.scrollLeft, doc.body.scrollLeft);
            scrollY = Math.max(scrollY, doc.documentElement.scrollTop, doc.body.scrollTop);

            return {
                width: w,
                height: h,
                scrollWidth: scrollW,
                scrollHeight: scrollH,
                scrollX: scrollX,
                scrollY: scrollY
            };
        },

        /** 
        * 通过html字符串创建Dom对象 
        * @method	create
        * @param	{string}	html html字符�?
        * @param	{boolean}	rfrag (Optional) 是否返回documentFragment对象
        * @param	{object}	doc	(Optional)	document 默认�? 当前document
        * @return	{element}	返回html字符的element对象或documentFragment对象
        */
        create: (function () {
            var temp = document.createElement('div'),
        wrap = {
            option: [1, '<select multiple="multiple">', '</select>'],
            optgroup: [1, '<select multiple="multiple">', '</select>'],
            legend: [1, '<fieldset>', '</fieldset>'],
            thead: [1, '<table>', '</table>'],
            tbody: [1, '<table>', '</table>'],
            tfoot: [1, '<table>', '</table>'],
            tr: [2, '<table><tbody>', '</tbody></table>'],
            td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
            th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
            col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
            _default: [0, '', '']
        },
        tagName = /<(\w+)/i;
            return function (html, rfrag, doc) {
                var dtemp = (doc && doc.createElement('div')) || temp,
          root = dtemp,
          tag = (tagName.exec(html) || ['', ''])[1],
          wr = wrap[tag] || wrap._default,
          dep = wr[0];
                dtemp.innerHTML = wr[1] + html + wr[2];
                while (dep--) {
                    dtemp = dtemp.firstChild;
                }
                var el = dtemp.firstChild;
                if (!el || !rfrag) {
                    while (root.firstChild) {
                        root.removeChild(root.firstChild);
                    }
                    //root.innerHTML = '';
                    return el;
                }
                else {
                    doc = doc || document;
                    var frag = doc.createDocumentFragment();
                    while (el = dtemp.firstChild) {
                        frag.appendChild(el);
                    }
                    return frag;
                }
            };
        } ()),

        /** 
        * 把NodeCollection转为ElementCollection
        * @method	pluckWhiteNode
        * @param	{NodeCollection|array} list Node的集�?
        * @return	{array}						Element的集�?
        */
        pluckWhiteNode: function (list) {
            var result = [],
        i = 0,
        l = list.length;
            for (; i < l; i++) {
                if (DomU.isElement(list[i])) {
                    result.push(list[i]);
                }
            }
            return result;
        },

        /** 
        * 判断Node实例是否继承了Element接口
        * @method	isElement
        * @param	{object} element Node的实�?
        * @return	{boolean}		 判断结果
        */
        isElement: function (el) {
            return !!(el && el.nodeType == 1);
        },

        /** 
        * 监听Dom树结构初始化完毕事件
        * @method	ready
        * @param	{function} handler 事件处理程序
        * @param	{object}	doc	(Optional)	document 默认�? 当前document
        * @return	{void}
        */
        ready: function (handler, doc) {
            doc = doc || document;

            if (/complete/.test(doc.readyState)) {
                handler();
            }
            else {
                if (doc.addEventListener) {
                    if (!Browser.ie && ('interactive' == doc.readyState)) { // IE9下doc.readyState有些异常
                        handler();
                    }
                    else {
                        doc.addEventListener('DOMContentLoaded', handler, false);
                    }
                }
                else {
                    var fireDOMReadyEvent = function () {
                        fireDOMReadyEvent = new Function();
                        handler();
                    };
                    (function () {
                        try {
                            doc.body.doScroll('left');
                        }
                        catch (exp) {
                            return setTimeout(arguments.callee, 1);
                        }
                        fireDOMReadyEvent();
                    } ());
                    doc.attachEvent('onreadystatechange', function () {
                        ('complete' == doc.readyState) && fireDOMReadyEvent();
                    });
                }
            }
        },


        /** 
        * 判断一个矩形是否包含另一个矩�?
        * @method	rectContains
        * @param	{object} rect1	矩形
        * @param	{object} rect2	矩形
        * @return	{boolean}		比较结果
        */
        rectContains: function (rect1, rect2) {
            return rect1.left <= rect2.left && rect1.right >= rect2.right && rect1.top <= rect2.top && rect1.bottom >= rect2.bottom;
        },

        /** 
        * 判断一个矩形是否和另一个矩形有交集
        * @method	rectIntersect
        * @param	{object} rect1	矩形
        * @param	{object} rect2	矩形
        * @return	{rect}			交集矩形或null
        */
        rectIntersect: function (rect1, rect2) {
            //修正变量�?
            var t = Math.max(rect1.top, rect2.top),
        r = Math.min(rect1.right, rect2.right),
        b = Math.min(rect1.bottom, rect2.bottom),
        l = Math.max(rect1.left, rect2.left);

            if (b >= t && r >= l) {
                return {
                    top: t,
                    right: r,
                    bottom: b,
                    left: l
                };
            }
            else {
                return null;
            }
        },

        /** 
        * 创建一个element
        * @method	createElement
        * @param	{string}	tagName		元素类型
        * @param	{json}		property	属�?
        * @param	{document}	doc	(Optional)		document
        * @return	{element}	创建的元�?
        */
        createElement: function (tagName, property, doc) {
            doc = doc || document;
            var el = doc.createElement(tagName);
            if (property) {
                for (var i in property) {
                    el[i] = property[i];
                }
            }
            return el;
        }

    };

    QW.DomU = DomU;
} ());
/*
Copyright (c) Baidu Youa Wed QWrap
author: 好奇
*/
/** 
* @class NodeH Node Helper，针对element兼容处理和功能扩�?
* @singleton
* @namespace QW
*/
(function () {

    var ObjectH = QW.ObjectH,
    StringH = QW.StringH,
    DomU = QW.DomU,
    Browser = QW.Browser,
    Selector = QW.Selector;


    /** 
    * 获得element对象
    * @method	g
    * @param	{element|string|wrap}	el	id,Element实例或wrap
    * @param	{object}				doc		(Optional)document 默认�? 当前document
    * @return	{element}				得到的对象或null
    */
    var g = function (el, doc) {
        if ('string' == typeof el) {
            if (el.indexOf('<') == 0) {
                return DomU.create(el, false, doc);
            }
            return (doc || document).getElementById(el);
        }
        else {
            return (ObjectH.isWrap(el)) ? arguments.callee(el[0]) : el; //如果NodeW是数组的话，返回第一个元�?(modified by akira)
        }
    };

    var regEscape = function (str) {
        return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
    };

    var getPixel = function (el, value) {
        if (/px$/.test(value) || !value) {
            return parseInt(value, 10) || 0;
        }
        var right = el.style.right,
        runtimeRight = el.runtimeStyle.right;
        var result;

        el.runtimeStyle.right = el.currentStyle.right;
        el.style.right = value;
        result = el.style.pixelRight || 0;

        el.style.right = right;
        el.runtimeStyle.right = runtimeRight;
        return result;
    };

    var NodeH = {

        /** 
        * 获得element对象的outerHTML属�?
        * @method	outerHTML
        * @param	{element|string|wrap}	el	id,Element实例或wrap
        * @param	{object}				doc		(Optional)document 默认�? 当前document
        * @return	{string}				outerHTML属性�?
        */
        outerHTML: (function () {
            var temp = document.createElement('div');
            return function (el, doc) {
                el = g(el);
                if ('outerHTML' in el) {
                    return el.outerHTML;
                }
                else {
                    temp.innerHTML = '';
                    var dtemp = (doc && doc.createElement('div')) || temp;
                    dtemp.appendChild(el.cloneNode(true));
                    return dtemp.innerHTML;
                }
            };
        } ()),

        /** 
        * 判断element是否包含某个className
        * @method	hasClass
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				className	样式�?
        * @return	{void}
        */
        hasClass: function (el, className) {
            el = g(el);
            return new RegExp('(?:^|\\s)' + regEscape(className) + '(?:\\s|$)').test(el.className);
        },

        /** 
        * 给element添加className
        * @method	addClass
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				className	样式�?
        * @return	{void}
        */
        addClass: function (el, className) {
            el = g(el);
            if (!NodeH.hasClass(el, className)) {
                el.className = el.className ? el.className + ' ' + className : className;
            }
        },

        /** 
        * 移除element某个className
        * @method	removeClass
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				className	样式�?
        * @return	{void}
        */
        removeClass: function (el, className) {
            el = g(el);
            if (NodeH.hasClass(el, className)) {
                el.className = el.className.replace(new RegExp('(?:^|\\s)' + regEscape(className) + '(?=\\s|$)', 'ig'), '');
            }
        },

        /** 
        * 替换element的className
        * @method	replaceClass
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				oldClassName	目标样式�?
        * @param	{string}				newClassName	新样式名
        * @return	{void}
        */
        replaceClass: function (el, oldClassName, newClassName) {
            el = g(el);
            if (NodeH.hasClass(el, oldClassName)) {
                el.className = el.className.replace(new RegExp('(^|\\s)' + regEscape(oldClassName) + '(?=\\s|$)', 'ig'), '$1' + newClassName);
            }
            else {
                NodeH.addClass(el, newClassName);
            }
        },

        /** 
        * element的className1和className2切换
        * @method	toggleClass
        * @param	{element|string|wrap}	el			id,Element实例或wrap
        * @param	{string}				className1		样式�?1
        * @param	{string}				className2		(Optional)样式�?2
        * @return	{void}
        */
        toggleClass: function (el, className1, className2) {
            className2 = className2 || '';
            if (NodeH.hasClass(el, className1)) {
                NodeH.replaceClass(el, className1, className2);
            }
            else {
                NodeH.replaceClass(el, className2, className1);
            }
        },

        /** 
        * 显示element对象
        * @method	show
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				value		(Optional)display的�? 默认为空
        * @return	{void}
        */
        show: (function () {
            var store = {};

            function restore(tagName) {
                if (!store[tagName]) {
                    var elem = document.createElement(tagName),
            body = document.body;
                    NodeH.insertSiblingBefore(body.firstChild, elem);
                    display = NodeH.getCurrentStyle(elem, "display");
                    NodeH.removeChild(body, elem);
                    body = elem = null;
                    if (display === "none" || display === "") {
                        display = "block";
                    }
                    store[tagName] = display;
                }
                return store[tagName];
            }
            return function (el, value) {
                el = g(el);
                if (!value) {
                    var display = el.style.display;
                    if (display === "none") {
                        display = el.style.display = "";
                    }
                    if (display === "" && NodeH.getCurrentStyle(el, "display") === "none") {
                        display = restore(el.nodeName);
                    }
                }
                el.style.display = value || display;
            };
        } ()),

        /** 
        * 隐藏element对象
        * @method	hide
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @return	{void}
        */
        hide: function (el) {
            el = g(el);
            el.style.display = 'none';
        },
        /** 
        * 删除element对象的所有子节点
        * @method	hide
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @return	{void}
        */
        empty: function (el) {
            el = g(el);
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }
        },
        /** 
        * 隐藏/显示element对象
        * @method	toggle
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				value		(Optional)显示时display的�? 默认为空
        * @return	{void}
        */
        toggle: function (el, value) {
            if (NodeH.isVisible(el)) {
                NodeH.hide(el);
            }
            else {
                NodeH.show(el, value);
            }
        },

        /** 
        * 判断element对象是否可见
        * @method	isVisible
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @return	{boolean}				判断结果
        */
        isVisible: function (el) {
            el = g(el);
            //return this.getStyle(el, 'visibility') != 'hidden' && this.getStyle(el, 'display') != 'none';
            //return !!(el.offsetHeight || el.offestWidth);
            return !!((el.offsetHeight + el.offsetWidth) && NodeH.getStyle(el, 'display') != 'none');
        },


        /** 
        * 获取element对象距离doc的xy坐标
        * 参考与YUI3.1.1
        * @refer  https://github.com/yui/yui3/blob/master/build/dom/dom.js
        * @method	getXY
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @return	{array}					x, y
        */
        getXY: (function () {

            var calcBorders = function (node, xy) {
                var t = parseInt(NodeH.getCurrentStyle(node, 'borderTopWidth'), 10) || 0,
            l = parseInt(NodeH.getCurrentStyle(node, 'borderLeftWidth'), 10) || 0;

                if (Browser.gecko) {
                    if (/^t(?:able|d|h)$/i.test(node.tagName)) {
                        t = l = 0;
                    }
                }
                xy[0] += l;
                xy[1] += t;
                return xy;
            };

            return document.documentElement.getBoundingClientRect ?
      function (node) {
          var doc = node.ownerDocument,
          docRect = DomU.getDocRect(doc),
          scrollLeft = docRect.scrollX,
          scrollTop = docRect.scrollY,
          box = node.getBoundingClientRect(),
          xy = [box.left, box.top],
          mode, off1, off2;
          if (Browser.ie) {
              off1 = doc.documentElement.clientLeft;
              off2 = doc.documentElement.clientTop;
              mode = doc.compatMode;

              if (mode == 'BackCompat') {
                  off1 = doc.body.clientLeft;
                  off2 = doc.body.clientTop;
              }

              xy[0] -= off1;
              xy[1] -= off2;

          }

          if (scrollTop || scrollLeft) {
              xy[0] += scrollLeft;
              xy[1] += scrollTop;
          }

          return xy;

      } : function (node) {
          var xy = [node.offsetLeft, node.offsetTop],
          parentNode = node.parentNode,
          doc = node.ownerDocument,
          docRect = DomU.getDocRect(doc),
          bCheck = !!(Browser.gecko || parseFloat(Browser.webkit) > 519),
          scrollTop = 0,
          scrollLeft = 0;

          while ((parentNode = parentNode.offsetParent)) {
              xy[0] += parentNode.offsetLeft;
              xy[1] += parentNode.offsetTop;
              if (bCheck) {
                  xy = calcBorders(parentNode, xy);
              }
          }

          if (NodeH.getCurrentStyle(node, 'position') != 'fixed') {
              parentNode = node;

              while (parentNode = parentNode.parentNode) {
                  scrollTop = parentNode.scrollTop;
                  scrollLeft = parentNode.scrollLeft;

                  if (Browser.gecko && (NodeH.getCurrentStyle(parentNode, 'overflow') !== 'visible')) {
                      xy = calcBorders(parentNode, xy);
                  }

                  if (scrollTop || scrollLeft) {
                      xy[0] -= scrollLeft;
                      xy[1] -= scrollTop;
                  }
              }

          }

          xy[0] += docRect.scrollX;
          xy[1] += docRect.scrollY;

          return xy;

      };

        } ()),

        /** 
        * 设置element对象的xy坐标
        * @method	setXY
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{int}					x			(Optional)x坐标 默认不设�?
        * @param	{int}					y			(Optional)y坐标 默认不设�?
        * @return	{void}
        */
        setXY: function (el, x, y) {
            el = g(el);
            x = parseInt(x, 10);
            y = parseInt(y, 10);
            if (!isNaN(x)) {
                NodeH.setStyle(el, 'left', x + 'px');
            }
            if (!isNaN(y)) {
                NodeH.setStyle(el, 'top', y + 'px');
            }
        },

        /** 
        * 设置element对象的offset宽高
        * @method	setSize
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{int}					w			(Optional)�? 默认不设�?
        * @param	{int}					h			(Optional)�? 默认不设�?
        * @return	{void}
        */
        setSize: function (el, w, h) {
            el = g(el);
            w = parseFloat(w, 10);
            h = parseFloat(h, 10);

            if (isNaN(w) && isNaN(h)) {
                return;
            }

            var borders = NodeH.borderWidth(el);
            var paddings = NodeH.paddingWidth(el);

            if (!isNaN(w)) {
                NodeH.setStyle(el, 'width', Math.max(+w - borders[1] - borders[3] - paddings[1] - paddings[3], 0) + 'px');
            }
            if (!isNaN(h)) {
                NodeH.setStyle(el, 'height', Math.max(+h - borders[0] - borders[2] - paddings[1] - paddings[2], 0) + 'px');
            }
        },

        /** 
        * 设置element对象的宽�?
        * @method	setInnerSize
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{int}					w			(Optional)�? 默认不设�?
        * @param	{int}					h			(Optional)�? 默认不设�?
        * @return	{void}
        */
        setInnerSize: function (el, w, h) {
            el = g(el);
            w = parseFloat(w, 10);
            h = parseFloat(h, 10);

            if (!isNaN(w)) {
                NodeH.setStyle(el, 'width', w + 'px');
            }
            if (!isNaN(h)) {
                NodeH.setStyle(el, 'height', h + 'px');
            }
        },

        /** 
        * 设置element对象的offset宽高和xy坐标
        * @method	setRect
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{int}					x			(Optional)x坐标 默认不设�?
        * @param	{int}					y			(Optional)y坐标 默认不设�?
        * @param	{int}					w			(Optional)�? 默认不设�?
        * @param	{int}					h			(Optional)�? 默认不设�?
        * @return	{void}
        */
        setRect: function (el, x, y, w, h) {
            NodeH.setXY(el, x, y);
            NodeH.setSize(el, w, h);
        },

        /** 
        * 设置element对象的宽高和xy坐标
        * @method	setRect
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{int}					x			(Optional)x坐标 默认不设�?
        * @param	{int}					y			(Optional)y坐标 默认不设�?
        * @param	{int}					w			(Optional)�? 默认不设�?
        * @param	{int}					h			(Optional)�? 默认不设�?
        * @return	{void}
        */
        setInnerRect: function (el, x, y, w, h) {
            NodeH.setXY(el, x, y);
            NodeH.setInnerSize(el, w, h);
        },

        /** 
        * 获取element对象的宽�?
        * @method	getSize
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @return	{object}				width,height
        */
        getSize: function (el) {
            el = g(el);
            return {
                width: el.offsetWidth,
                height: el.offsetHeight
            };
        },

        /** 
        * 获取element对象的宽高和xy坐标
        * @method	setRect
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @return	{object}				width,height,left,top,bottom,right
        */
        getRect: function (el) {
            el = g(el);
            var p = NodeH.getXY(el);
            var x = p[0];
            var y = p[1];
            var w = el.offsetWidth;
            var h = el.offsetHeight;
            return {
                'width': w,
                'height': h,
                'left': x,
                'top': y,
                'bottom': y + h,
                'right': x + w
            };
        },

        /** 
        * 向后获取element对象复合条件的兄弟节�?
        * @method	nextSibling
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				selector	(Optional)简单选择�? 默认为空即最近的兄弟节点
        * @return	{node}					找到的node或null
        */
        nextSibling: function (el, selector) {
            var fcheck = Selector.selector2Filter(selector || '');
            el = g(el);
            do {
                el = el.nextSibling;
            } while (el && !fcheck(el));
            return el;
        },

        /** 
        * 向前获取element对象复合条件的兄弟节�?
        * @method	previousSibling
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				selector	(Optional)简单选择�? 默认为空即最近的兄弟节点
        * @return	{node}					找到的node或null
        */
        previousSibling: function (el, selector) {
            var fcheck = Selector.selector2Filter(selector || '');
            el = g(el);
            do {
                el = el.previousSibling;
            } while (el && !fcheck(el));
            return el;
        },

        /** 
        * 向上获取element对象复合条件的兄弟节�?
        * @method	previousSibling
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				selector	(Optional)简单选择�? 默认为空即最近的兄弟节点
        * @return	{element}					找到的node或null
        */
        ancestorNode: function (el, selector) {
            var fcheck = Selector.selector2Filter(selector || '');
            el = g(el);
            do {
                el = el.parentNode;
            } while (el && !fcheck(el));
            return el;
        },

        /** 
        * 向上获取element对象复合条件的兄弟节�?
        * @method	parentNode
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				selector	(Optional)简单选择�? 默认为空即最近的兄弟节点
        * @return	{element}					找到的node或null
        */
        parentNode: function (el, selector) {
            return NodeH.ancestorNode(el, selector);
        },

        /** 
        * 从element对象内起始位置获取复合条件的节点
        * @method	firstChild
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				selector	(Optional)简单选择�? 默认为空即最近的兄弟节点
        * @return	{node}					找到的node或null
        */
        firstChild: function (el, selector) {
            var fcheck = Selector.selector2Filter(selector || '');
            el = g(el).firstChild;
            while (el && !fcheck(el)) {
                el = el.nextSibling;
            }
            return el;
        },

        /** 
        * 从element对象内结束位置获取复合条件的节点
        * @method	lastChild
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				selector	(Optional)简单选择�? 默认为空即最近的兄弟节点
        * @return	{node}					找到的node或null
        */
        lastChild: function (el, selector) {
            var fcheck = Selector.selector2Filter(selector || '');
            el = g(el).lastChild;
            while (el && !fcheck(el)) {
                el = el.previousSibling;
            }
            return el;
        },

        /** 
        * 判断目标对象是否是element对象的子孙节�?
        * @method	contains
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{element|string|wrap}	target		Element对象
        * @return	{boolean}				判断结果
        */
        contains: function (el, target) {
            el = g(el);
            target = g(target);
            return el.contains ? el != target && el.contains(target) : !!(el.compareDocumentPosition(target) & 16);
        },

        /** 
        * 向element对象�?/后，内起始，内结尾插入html
        * @method	insertAdjacentHTML
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				sWhere		位置类型，可能值有：beforebegin、afterbegin、beforeend、afterend
        * @param	{element|string|wrap}	html		插入的html
        * @return	{void}
        */
        insertAdjacentHTML: function (el, sWhere, html) {
            el = g(el);
            if (el.insertAdjacentHTML) {
                el.insertAdjacentHTML(sWhere, html);
            }
            else {
                var r = el.ownerDocument.createRange(),
          df;

                r.setStartBefore(el);
                df = r.createContextualFragment(html);
                NodeH.insertAdjacentElement(el, sWhere, df);
            }
        },

        /** 
        * 向element对象�?/后，内起始，内结尾插入element对象
        * @method	insertAdjacentElement
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				sWhere		位置类型，可能值有：beforebegin、afterbegin、beforeend、afterend
        * @param	{element|string|html|wrap}	newEl		新对象�?
        * @return	{element}				newEl，新对象
        */
        insertAdjacentElement: function (el, sWhere, newEl) {
            el = g(el);
            newEl = g(newEl);
            if (el.insertAdjacentElement) {
                el.insertAdjacentElement(sWhere, newEl);
            }
            else {
                switch (String(sWhere).toLowerCase()) {
                    case "beforebegin":
                        el.parentNode.insertBefore(newEl, el);
                        break;
                    case "afterbegin":
                        el.insertBefore(newEl, el.firstChild);
                        break;
                    case "beforeend":
                        el.appendChild(newEl);
                        break;
                    case "afterend":
                        el.parentNode.insertBefore(newEl, el.nextSibling || null);
                        break;
                }
            }
            return newEl;
        },

        /** 
        * 向element对象�?/后，内起始，内结尾插入element对象
        * @method	insert
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				sWhere		位置类型，可能值有：beforebegin、afterbegin、beforeend、afterend
        * @param	{element|string|wrap}	newEl		新对�?
        * @return	{void}	
        */
        insert: function (el, sWhere, newEl) {
            NodeH.insertAdjacentElement(el, sWhere, newEl);
        },

        /** 
        * 把一个对象插到另一个对象邻近�?
        * @method	insertTo
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				sWhere		位置类型，可能值有：beforebegin、afterbegin、beforeend、afterend
        * @param	{element|string|wrap}	refEl		位置参考对�?
        * @return	{void}				
        */
        insertTo: function (el, sWhere, refEl) {
            NodeH.insertAdjacentElement(refEl, sWhere, el);
        },

        /** 
        * 向element对象内追加element对象
        * @method	appendChild
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{element|string|wrap}	newEl		新对�?
        * @return	{element}				新对象newEl
        */
        appendChild: function (el, newEl) {
            return g(el).appendChild(g(newEl));
        },

        /** 
        * 向element对象前插入element对象
        * @method	insertSiblingBefore
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{element|string|html|wrap}	newEl	新对�?
        * @return	{element}				新对象newEl
        */
        insertSiblingBefore: function (el, newEl) {
            el = g(el);
            return el.parentNode.insertBefore(g(newEl), el);
        },

        /** 
        * 向element对象后插入element对象
        * @method	insertSiblingAfter
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{element|string|wrap}	newEl	新对象id,Element实例或wrap
        * @return	{element}				新对象newEl
        */
        insertSiblingAfter: function (el, newEl) {
            el = g(el);
            el.parentNode.insertBefore(g(newEl), el.nextSibling || null);
        },

        /** 
        * 向element对象内部的某元素前插入element对象
        * @method	insertBefore
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{element|string|wrap}	newEl	新对象id,Element实例或wrap
        * @param	{element|string|wrap}	refEl	位置参考对�?
        * @return	{element}				新对象newEl
        */
        insertBefore: function (el, newEl, refEl) {
            return g(el).insertBefore(g(newEl), (refEl && g(refEl)) || null);
        },

        /** 
        * 向element对象内部的某元素后插入element对象
        * @method	insertAfter
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{element|string|wrap}	newEl	新对�?
        * @param	{element|string|wrap}	refEl	位置参考对�?
        * @return	{element}				新对象newEl
        */
        insertAfter: function (el, newEl, refEl) {
            return g(el).insertBefore(g(newEl), (refEl && g(refEl).nextSibling) || null);
        },

        /**
        * 为element插入一个外框容器元�?
        * @method insertParent
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{element|string|wrap}	newEl	新对�?
        * @return  {element}				新对象newEl
        */
        insertParent: function (el, newEl) {
            NodeH.insertSiblingBefore(el, newEl);
            return NodeH.appendChild(newEl, el);
        },

        /** 
        * 用一个元素替换自�?
        * @method	replaceNode
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{element|string|wrap}	newEl		新节点id,Element实例或wrap
        * @return	{element}				如替换成功，此方法可返回被替换的节点，如替换失败，则返回 NULL
        */
        replaceNode: function (el, newEl) {
            el = g(el);
            return el.parentNode.replaceChild(g(newEl), el);
        },

        /** 
        * 从element里把relement替换成nelement
        * @method	replaceChild
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{element|string|wrap}	newEl	新节点id,Element实例或wrap
        * @param	{element|string|wrap}	childEl	被替换的id,Element实例或wrap�?
        * @return	{element}				如替换成功，此方法可返回被替换的节点，如替换失败，则返回 NULL
        */
        replaceChild: function (el, newEl, childEl) {
            return g(el).replaceChild(g(newEl), g(childEl));
        },

        /** 
        * 把element移除�?
        * @method	removeNode
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @return	{element}				如删除成功，此方法可返回被删除的节点，如失败，则返回 NULL�?
        */
        removeNode: function (el) {
            el = g(el);
            return el.parentNode.removeChild(el);
        },

        /** 
        * 从element里把childEl移除�?
        * @method	removeChild
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{element|string|wrap}	childEl		需要移除的子对�?
        * @return	{element}				如删除成功，此方法可返回被删除的节点，如失败，则返回 NULL�?
        */
        removeChild: function (el, childEl) {
            return g(el).removeChild(g(childEl));
        },

        /** 
        * 对元素调用ObjectH.get
        * @method	get
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				prop	成员名称
        * @return	{object}				成员引用
        * @see ObjectH.get
        */
        get: function (el, prop) {
            //var args = [g(el)].concat([].slice.call(arguments, 1));
            el = g(el);
            return ObjectH.get.apply(null, arguments);
        },

        /** 
        * 对元素调用ObjectH.set
        * @method	set
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				prop	成员名称
        * @param	{object}				value		成员引用/内容
        * @return	{void}
        * @see ObjectH.set
        */
        set: function (el, prop, value) {
            el = g(el);
            ObjectH.set.apply(null, arguments);
        },

        /** 
        * 获取element对象的属�?
        * @method	getAttr
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				attribute	属性名�?
        * @param	{int}					iFlags		(Optional)ieonly 获取属性值的返回类型 可设�?0,1,2,4 
        * @return	{string}				属性�? ie里有可能不是object
        */
        getAttr: function (el, attribute, iFlags) {
            el = g(el);

            if ((attribute in el) && 'href' != attribute) {
                return el[attribute];
            }
            else {
                return el.getAttribute(attribute, iFlags || (el.nodeName == 'A' && attribute.toLowerCase() == 'href' && 2) || null);
            }
        },

        /** 
        * 设置element对象的属�?
        * @method	setAttr
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				attribute	属性名�?
        * @param	{string}				value		属性的�?
        * @param	{int}					iCaseSensitive	(Optional)
        * @return	{void}
        */
        setAttr: function (el, attribute, value, iCaseSensitive) {
            el = g(el);

            if (attribute in el) {
                el[attribute] = value;
            }
            else {
                el.setAttribute(attribute, value, iCaseSensitive || null);
            }
        },

        /** 
        * 删除element对象的属�?
        * @method	removeAttr
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				attribute	属性名�?
        * @param	{int}					iCaseSensitive	(Optional)
        * @return	{void}
        */
        removeAttr: function (el, attribute, iCaseSensitive) {
            el = g(el);
            return el.removeAttribute(attribute, iCaseSensitive || 0);
        },

        /** 
        * 根据条件查找element内元素组
        * @method	query
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				selector	条件
        * @return	{array}					element元素数组
        */
        query: function (el, selector) {
            el = g(el);
            return Selector.query(el, selector || '');
        },

        /** 
        * 根据条件查找element内元�?
        * @method	one
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				selector	条件
        * @return	{HTMLElement}			element元素
        */
        one: function (el, selector) {
            el = g(el);
            return Selector.one(el, selector || '');
        },

        /** 
        * 查找element内所有包含className的集�?
        * @method	getElementsByClass
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				className	样式�?
        * @return	{array}					element元素数组
        */
        getElementsByClass: function (el, className) {
            el = g(el);
            return Selector.query(el, '.' + className);
        },

        /** 
        * 获取element的value
        * @method	getValue
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @return	{string}				元素value
        */
        getValue: function (el) {
            el = g(el);
            //if(el.value==el.getAttribute('data-placeholder')) return '';
            return el.value;
        },

        /** 
        * 设置element的value
        * @method	setValue
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				value		内容
        * @return	{void}					
        */
        setValue: function (el, value) {
            g(el).value = value;
        },

        /** 
        * 获取element的innerHTML
        * @method	getHTML
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @return	{string}					
        */
        getHtml: function (el) {
            el = g(el);
            return el.innerHTML;
        },

        /** 
        * 设置element的innerHTML
        * @method	setHtml
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				value		内容
        * @return	{void}					
        */
        setHtml: (function () {
            var mustAppend = /<(?:object|embed|option|style)/i,
        append = function (el, value) {
            NodeH.empty(el);
            NodeH.appendChild(el, DomU.create(value, true));
        };
            return function (el, value) {
                el = g(el);
                if (!mustAppend.test(value)) {
                    try {
                        el.innerHTML = value;
                    }
                    catch (ex) {
                        append(el, value);
                    }
                }
                else {
                    append(el, value);
                }
            };
        } ()),

        /** 
        * 获得form的所有elements并把value转换成由'&'连接的键值字符串
        * @method	encodeURIForm
        * @param	{element}	el			form对象
        * @param	{string}	filter	(Optional)	过滤函数,会被循环调用传递给item作参数要求返回布尔值判断是否过�?
        * @return	{string}					�?'&'连接的键值字符串
        */
        encodeURIForm: function (el, filter) {
            el = g(el);
            filter = filter ||
      function (el) {
          return false;
      };
            var result = [],
        els = el.elements,
        l = els.length,
        i = 0,
        push = function (name, value) {
            result.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
        };
            for (; i < l; ++i) {
                el = els[i];
                var name = el.name;
                if (el.disabled || !name || filter(el)) {
                    continue;
                }
                switch (el.type) {
                    case "text":
                    case "hidden":
                    case "password":
                    case "textarea":
                        push(name, el.value);
                        break;
                    case "radio":
                    case "checkbox":
                        if (el.checked) {
                            push(name, el.value);
                        }
                        break;
                    case "select-one":
                        if (el.selectedIndex > -1) {
                            push(name, el.value);
                        }
                        break;
                    case "select-multiple":
                        var opts = el.options;
                        for (var j = 0; j < opts.length; ++j) {
                            if (opts[j].selected) {
                                push(name, opts[j].value);
                            }
                        }
                        break;
                }
            }
            return result.join("&");
        },

        /** 
        * 判断form的内容是否有改变
        * @method	isFormChanged
        * @param	{element}	el			form对象
        * @param	{string}	filter	(Optional)	过滤函数,会被循环调用传递给item作参数要求返回布尔值判断是否过�?
        * @return	{bool}					是否改变
        */
        isFormChanged: function (el, filter) {
            el = g(el);
            filter = filter ||
      function (el) {
          return false;
      };
            var els = el.elements,
        l = els.length,
        i = 0,
        j = 0,
        opts;
            for (; i < l; ++i, j = 0) {
                el = els[i];
                if (filter(el)) {
                    continue;
                }
                switch (el.type) {
                    case "text":
                    case "hidden":
                    case "password":
                    case "textarea":
                        if (el.defaultValue != el.value) {
                            return true;
                        }
                        break;
                    case "radio":
                    case "checkbox":
                        if (el.defaultChecked != el.checked) {
                            return true;
                        }
                        break;
                    case "select-one":
                        j = 1;
                    case "select-multiple":
                        opts = el.options;
                        for (; j < opts.length; ++j) {
                            if (opts[j].defaultSelected != opts[j].selected) {
                                return true;
                            }
                        }
                        break;
                }
            }
            return false;
        },

        /** 
        * 克隆元素
        * @method	cloneNode
        * @param	{element}	el			form对象
        * @param	{bool}		bCloneChildren	(Optional) 是否深度克隆 默认值false
        * @return	{element}					克隆后的元素
        */
        cloneNode: function (el, bCloneChildren) {
            return g(el).cloneNode(bCloneChildren || false);
        },

        /** 
        * 删除element对象的样�?
        * @method	removeStyle
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				attribute	样式�?
        * @return	{void}				
        */
        removeStyle: function (el, attribute) {
            el = g(el);

            var displayAttribute = StringH.camelize(attribute),
        hook = NodeH.cssHooks[displayAttribute];



            if (hook) {
                hook.remove(el);
            }
            else if (el.style.removeProperty) {
                el.style.removeProperty(StringH.decamelize(attribute));
            }
            else {
                el.style.removeAttribute(displayAttribute);
            }
        },

        /** 
        * 获得element对象的样�?
        * @method	getStyle
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				attribute	样式�?
        * @return	{string}				
        */
        getStyle: function (el, attribute) {
            el = g(el);

            attribute = StringH.camelize(attribute);

            var hook = NodeH.cssHooks[attribute],
        result;

            if (hook) {
                result = hook.get(el);
            }
            else {
                result = el.style[attribute];
            }

            return (!result || result == 'auto') ? null : result;
        },

        /** 
        * 获得element对象当前的样�?
        * @method	getCurrentStyle
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				attribute	样式�?
        * @return	{string}				
        */
        getCurrentStyle: function (el, attribute, pseudo) {
            el = g(el);

            var displayAttribute = StringH.camelize(attribute);

            var hook = NodeH.cssHooks[displayAttribute],
        result;

            if (hook) {
                result = hook.get(el, true, pseudo);
            }
            else if (Browser.ie) {
                result = el.currentStyle[displayAttribute];
            }
            else {
                var style = el.ownerDocument.defaultView.getComputedStyle(el, pseudo || null);
                result = style ? style.getPropertyValue(StringH.decamelize(attribute)) : null;
            }

            return (!result || result == 'auto') ? null : result;
        },

        /** 
        * 设置element对象的样�?
        * @method	setStyle
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @param	{string}				attribute	样式�?
        * @param	{string}				value		�?
        * @return	{void}
        */
        setStyle: function (el, attribute, value) {
            el = g(el);
            if ('object' != typeof attribute) {
                var displayAttribute = StringH.camelize(attribute),
          hook = NodeH.cssHooks[displayAttribute];

                if (hook) {
                    hook.set(el, value);
                }
                else {
                    el.style[displayAttribute] = value;
                }

            }
            else {
                for (var prop in attribute) {
                    NodeH.setStyle(el, prop, attribute[prop]);
                }
            }
        },

        /** 
        * 获取element对象的border宽度
        * @method	borderWidth
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @return	{array}					topWidth, rightWidth, bottomWidth, leftWidth
        */
        borderWidth: (function () {
            var map = {
                thin: 2,
                medium: 4,
                thick: 6
            };

            var getWidth = function (el, val) {
                var result = NodeH.getCurrentStyle(el, val);
                result = map[result] || parseFloat(result);
                return result || 0;
            };

            return function (el) {
                el = g(el);

                return [
        getWidth(el, 'borderTopWidth'), getWidth(el, 'borderRightWidth'), getWidth(el, 'borderBottomWidth'), getWidth(el, 'borderLeftWidth')];
            };
        } ()),

        /** 
        * 获取element对象的padding宽度
        * @method	paddingWidth
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @return	{array}					topWidth, rightWidth, bottomWidth, leftWidth
        */
        paddingWidth: function (el) {
            el = g(el);
            return [
      getPixel(el, NodeH.getCurrentStyle(el, 'paddingTop')), getPixel(el, NodeH.getCurrentStyle(el, 'paddingRight')), getPixel(el, NodeH.getCurrentStyle(el, 'paddingBottom')), getPixel(el, NodeH.getCurrentStyle(el, 'paddingLeft'))];
        },

        /** 
        * 获取element对象的margin宽度
        * @method	marginWidth
        * @param	{element|string|wrap}	el		id,Element实例或wrap
        * @return	{array}					topWidth, rightWidth, bottomWidth, leftWidth
        */
        marginWidth: function (el) {
            el = g(el);
            return [
      getPixel(el, NodeH.getCurrentStyle(el, 'marginTop')), getPixel(el, NodeH.getCurrentStyle(el, 'marginRight')), getPixel(el, NodeH.getCurrentStyle(el, 'marginBottom')), getPixel(el, NodeH.getCurrentStyle(el, 'marginLeft'))];
        },

        cssHooks: (function () {
            var hooks = {
                'float': {
                    get: function (el, current, pseudo) {
                        if (current) {
                            var style = el.ownerDocument.defaultView.getComputedStyle(el, pseudo || null);
                            return style ? style.getPropertyValue('cssFloat') : null;
                        }
                        else {
                            return el.style.cssFloat;
                        }
                    },
                    set: function (el, value) {
                        el.style.cssFloat = value;
                    },
                    remove: function (el) {
                        el.style.removeProperty('float');
                    }
                }
            };
            if (Browser.ie) {
                hooks['float'] = {
                    get: function (el, current) {
                        return el[current ? 'currentStyle' : 'style'].styleFloat;
                    },
                    set: function (el, value) {
                        el.style.styleFloat = value;
                    },
                    remove: function (el) {
                        el.style.removeAttribute('styleFloat');
                    }
                };

                hooks.opacity = {
                    get: function (el, current) {
                        var opacity;

                        if (el.filters['alpha']) {
                            opacity = el.filters['alpha'].opacity / 100;
                        }
                        else if (el.filters['DXImageTransform.Microsoft.Alpha']) {
                            opacity = el.filters['DXImageTransform.Microsoft.Alpha'].opacity / 100;
                        }

                        if (isNaN(opacity)) {
                            opacity = 1;
                        }

                        return opacity;
                    },

                    set: function (el, value) {
                        if (el.filters['alpha']) {
                            el.filters['alpha'].opacity = value * 100;
                        }
                        else {
                            el.style.filter += 'alpha(opacity=' + (value * 100) + ')';
                        }
                        el.style.opacity = value;
                    },

                    remove: function (el) {
                        el.style.filter = '';
                        el.style.removeAttribute('opacity');
                    }
                };
            }
            return hooks;
        } ())
    };

    NodeH.g = g;

    QW.NodeH = NodeH;
} ());
/*
Copyright (c) Baidu Youa Wed QWrap
author: JK
author: wangchen
*/
/** 
* @class NodeW HTMLElement对象包装�?
* @namespace QW
*/
(function () {
    var ObjectH = QW.ObjectH,
    mix = ObjectH.mix,
    isString = ObjectH.isString,
    isArray = ObjectH.isArray,
    push = Array.prototype.push,
    NodeH = QW.NodeH,
    g = NodeH.g,
    query = NodeH.query,
    one = NodeH.one,
    create = QW.DomU.create;


    var NodeW = function (core) {
        if (!core) { //用法：var w=NodeW(null);	返回null
            return null;
        }
        var arg1 = arguments[1];
        if (isString(core)) {
            if (/^</.test(core)) { //用法：var w=NodeW(html); 
                var list = create(core, true, arg1).childNodes,
            els = [];
                for (var i = 0, elI; elI = list[i]; i++) {
                    els[i] = elI;
                }
                return new NodeW(els);
            }
            else { //用法：var w=NodeW(sSelector);
                return new NodeW(query(arg1, core));
            }
        }
        else {
            core = g(core, arg1);
            if (this instanceof NodeW) {
                this.core = core;
                if (isArray(core)) { //用法：var w=NodeW(elementsArray); 
                    this.length = 0;
                    push.apply(this, core);
                }
                else { //用法：var w=new NodeW(element)//不推�?; 
                    this.length = 1;
                    this[0] = core;
                }
            }
            else { //用法：var w=NodeW(element); var w2=NodeW(elementsArray); 
                return new NodeW(core);
            }
        }
    };

    NodeW.one = function (core) {
        if (!core) { //用法：var w=NodeW.one(null);	返回null
            return null;
        }
        var arg1 = arguments[1];
        if (isString(core)) { //用法：var w=NodeW.one(sSelector); 
            if (/^</.test(core)) { //用法：var w=NodeW.one(html); 
                return new NodeW(create(core, false, arg1));
            }
            else { //用法：var w=NodeW(sSelector);
                return new NodeW(one(arg1, core));
            }
        }
        else {
            core = g(core, arg1);
            if (isArray(core)) { //用法：var w=NodeW.one(array); 
                return new NodeW(core[0]);
            }
            else { //用法：var w=NodeW.one(element); 
                return new NodeW(core);
            }
        }
    };

    /** 
    * 在NodeW中植入一个针对Node的Helper
    * @method	pluginHelper
    * @static
    * @param	{helper} helper 必须是一个针对Node（元素）的Helper	
    * @param	{string|json} wrapConfig	wrap参数
    * @param	{json} gsetterConfig	(Optional) gsetter 参数
    * @return	{NodeW}	
    */

    NodeW.pluginHelper = function (helper, wrapConfig, gsetterConfig) {
        var HelperH = QW.HelperH;

        helper = HelperH.mul(helper, wrapConfig); //支持第一个参数为array
        var st = HelperH.rwrap(helper, NodeW, wrapConfig); //对返回值进行包装处�?
        if (gsetterConfig) { //如果有gsetter，需要对表态方法gsetter�?
            st = HelperH.gsetter(st, gsetterConfig);
        }

        mix(NodeW, st); //应用于NodeW的静态方�?
        var pro = HelperH.methodize(helper, 'core');
        pro = HelperH.rwrap(pro, NodeW, wrapConfig);
        if (gsetterConfig) {
            pro = HelperH.gsetter(pro, gsetterConfig);
        }
        mix(NodeW.prototype, pro);
    };

    mix(NodeW.prototype, {
        /** 
        * 返回NodeW的第0个元素的包装
        * @method	first
        * @return	{NodeW}	
        */
        first: function () {
            return NodeW(this[0]);
        },
        /** 
        * 返回NodeW的最后一个元素的包装
        * @method	last
        * @return	{NodeW}	
        */
        last: function () {
            return NodeW(this[this.length - 1]);
        },
        /** 
        * 返回NodeW的第i个元素的包装
        * @method	last
        * @param {int}	i 第i个元�?
        * @return	{NodeW}	
        */
        item: function (i) {
            return NodeW(this[i]);
        },
        /** 
        * 在NodeW的每个项上运行一个函数，并将函数返回真值的项组成数组，包装成NodeW返回�?
        * @method filter
        * @param {Function|String} callback 需要执行的函数，也可以是css selector字符�?
        * @param {Object} pThis (Optional) 指定callback的this对象.
        * @return {NodeW}
        */
        filter: function (callback, pThis) {
            if (typeof callback == 'string') {
                callback = QW.Selector.selector2Filter(callback);
            }
            return NodeW(ArrayH.filter(this, callback, pThis));
        }
    });

    QW.NodeW = NodeW;
} ());
/*
Copyright (c) Baidu Youa Wed QWrap
author: 好奇
*/

/** 
* @class EventH Event Helper，处理一些Event对象兼容问题
* @singleton
* @helper
* @namespace QW
*/
(function () {
    function getDoc(e) {
        var target = EventH.getTarget(e),
      doc = document;
        if (target) { //ie unload target is null
            doc = target.ownerDocument || target.document || ((target.defaultView || target.window) && target) || document;
        }
        return doc;
    }

    var EventH = {

        /** 
        * 获取鼠标位于完整页面的X坐标
        * @method	getPageX
        * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
        * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
        * @return	{int}		X坐标
        */
        getPageX: function (e) {
            e = e || EventH.getEvent.apply(EventH, arguments);
            var doc = getDoc(e);
            return ('pageX' in e) ? e.pageX : (e.clientX + (doc.documentElement.scrollLeft || doc.body.scrollLeft) - 2);
        },

        /** 
        * 获取鼠标位于完整页面的Y坐标
        * @method	getPageY
        * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
        * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
        * @return	{int}		Y坐标
        */
        getPageY: function (e) {
            e = e || EventH.getEvent.apply(EventH, arguments);
            var doc = getDoc(e);
            return ('pageY' in e) ? e.pageY : (e.clientY + (doc.documentElement.scrollTop || doc.body.scrollTop) - 2);
        },


        /** 
        * 获取鼠标滚轮方向
        * @method	getDetail
        * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
        * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
        * @return	{int}		大于0向下,小于0向上.
        */
        getDetail: function (e) {
            e = e || EventH.getEvent.apply(EventH, arguments);
            return e.detail || -(e.wheelDelta || 0);
        },

        /** 
        * 获取触发事件的按键对应的ascii�?
        * @method	getKeyCode
        * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
        * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
        * @return	{int}		键盘ascii
        */
        getKeyCode: function (e) {
            e = e || EventH.getEvent.apply(EventH, arguments);
            return ('keyCode' in e) ? e.keyCode : (e.charCode || e.which || 0);
        },

        /** 
        * 阻止事件冒泡
        * @method	stopPropagation
        * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
        * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
        * @return	{void}
        */
        stopPropagation: function (e) {
            e = e || EventH.getEvent.apply(EventH, arguments);
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            else {
                e.cancelBubble = true;
            }
        },

        /** 
        * 阻止事件默认行为
        * @method	preventDefault
        * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
        * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
        * @return	{void}
        */
        preventDefault: function (e) {
            e = e || EventH.getEvent.apply(EventH, arguments);
            if (e.preventDefault) {
                e.preventDefault();
            }
            else {
                e.returnValue = false;
            }
        },

        /** 
        * 获取事件触发时是否持续按住ctrl�?
        * @method	getCtrlKey
        * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
        * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
        * @return	{boolean}	判断结果
        */
        getCtrlKey: function (e) {
            e = e || EventH.getEvent.apply(EventH, arguments);
            return e.ctrlKey;
        },

        /** 
        * 事件触发时是否持续按住shift�?
        * @method	getShiftKey
        * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
        * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
        * @return	{boolean}	判断结果
        */
        getShiftKey: function (e) {
            e = e || EventH.getEvent.apply(EventH, arguments);
            return e.shiftKey;
        },

        /** 
        * 事件触发时是否持续按住alt�?
        * @method	getAltKey
        * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
        * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
        * @return	{boolean}	判断结果
        */
        getAltKey: function (e) {
            e = e || EventH.getEvent.apply(EventH, arguments);
            return e.altKey;
        },

        /** 
        * 触发事件的元�?
        * @method	getTarget
        * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
        * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
        * @return	{element}	node 对象
        */
        getTarget: function (e) {
            e = e || EventH.getEvent.apply(EventH, arguments);
            var node = e.srcElement || e.target;
            if (node && node.nodeType == 3) {
                node = node.parentNode;
            }
            return node;
        },

        /** 
        * 获取元素
        * @method	getRelatedTarget
        * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
        * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
        * @return	{element}	mouseover/mouseout 事件时有�? over时为来源元素,out时为移动到的元素.
        */
        getRelatedTarget: function (e) {
            e = e || EventH.getEvent.apply(EventH, arguments);
            if ('relatedTarget' in e) {
                return e.relatedTarget;
            }
            if (e.type == 'mouseover') {
                return e.fromElement;
            }
            if (e.type == 'mouseout') {
                return e.toElement;
            }
        },

        /** 
        * 获得event对象
        * @method	getEvent
        * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
        * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
        * @return	{event}		event对象
        */
        getEvent: function (event, element) {
            if (event) {
                return event;
            }
            else if (element) {
                if (element.document) {
                    return element.document.parentWindow.event;
                }
                if (element.parentWindow) {
                    return element.parentWindow.event;
                }
            }

            if (window.event) {
                return window.event;
            }
            else {
                var f = arguments.callee;
                do {
                    if (/Event/.test(f.arguments[0])) {
                        return f.arguments[0];
                    }
                } while (f = f.caller);
            }
        },
        _EventPro: {
            stopPropagation: function () {
                this.cancelBubble = true;
            },
            preventDefault: function () {
                this.returnValue = false;
            }
        },
        /** 
        * 为event补齐标准方法
        * @method	standardize
        * @param	{event}		event	event对象
        * @return	{event}		event对象
        */
        standardize: function (e) {
            e = e || EventH.getEvent.apply(EventH, arguments);

            if (!('target' in e)) {
                e.target = EventH.getTarget(e);
            }
            if (!('relatedTarget' in e)) {
                e.relatedTarget = EventH.getRelatedTarget(e);
            }
            if (!('pageX' in e)) {
                e.pageX = EventH.getPageX(e);
                e.pageY = EventH.getPageY(e);
            }
            if (!('detail' in e)) {
                e.detail = EventH.getDetail(e);
            }
            if (!('keyCode' in e)) {
                e.keyCode = EventH.getKeyCode(e);
            }
            for (var i in EventH._EventPro) {
                if (e[i] == null) {
                    e[i] = EventH._EventPro[i];
                }
            }
            return e;
        }
    };


    QW.EventH = EventH;
} ());
/*
Copyright (c) Baidu Youa Wed QWrap
version: 1.0.1 2011-08-19 released
author: WC(好奇)、JK(加宽)
*/

/** 
* @class EventTargetH EventTarget Helper，处理和事件触发目标有关的兼容问�?
* @singleton
* @helper
* @namespace QW
*/

(function () {

    var g = QW.NodeH.g,
    mix = QW.ObjectH.mix,
    standardize = QW.EventH.standardize;


    /*
    *Cache的格式：
    {
    "el.__QWETH_id":{
    'eventType+handler.__QWETH_id': realHandler,
    'eventType+handler.__QWETH_id+selector': realHandler
    }
    }
    */
    var Cache = function () {
        var cacheSeq = 1,
        seqProp = '__QWETH_id';
        return {
            get: function (el, eventName, handler, selector) {
                var data = el[seqProp] && this[el[seqProp]];
                if (data && handler[seqProp]) {
                    return data[eventName + handler[seqProp] + (selector || '')];
                }
            },
            add: function (realHandler, el, eventName, handler, selector) {
                if (!el[seqProp]) el[seqProp] = cacheSeq++;
                if (!handler[seqProp]) handler[seqProp] = cacheSeq++;
                var data = this[el[seqProp]] || (this[el[seqProp]] = {});
                data[eventName + handler[seqProp] + (selector || '')] = realHandler;
            },
            remove: function (el, eventName, handler, selector) {
                var data = el[seqProp] && this[el[seqProp]];
                if (data && handler[seqProp]) {
                    delete data[eventName + handler[seqProp] + (selector || '')];
                }
            },
            removeEvents: function (el, eventName) {
                var data = el[seqProp] && this[el[seqProp]];
                if (data) {
                    var reg = new RegExp('^[a-zA-Z.]*' + (eventName || '') + '\\d+$');
                    for (var i in data) {
                        if (reg.test(i)) {
                            EventTargetH.removeEventListener(el, i.split(/[^a-zA-Z]/)[0], data[i]);
                            delete data[i];
                        }
                    }
                }
            },
            removeDelegates: function (el, eventName, selector) {
                var data = el[seqProp] && this[el[seqProp]];
                if (data) {
                    var reg = new RegExp('^([a-zA-Z]+\\.)?' + (eventName || '') + '\\d+.+');
                    for (var i in data) {
                        if (reg.test(i) && (!selector || i.substr(i.length - selector.length) == selector)) {
                            var name = i.split(/\d+/)[0].split('.'),
                  needCapture = EventTargetH._DelegateCpatureEvents.indexOf(name[1] || name[0]) > -1;
                            EventTargetH.removeEventListener(el, i.split(/[^a-zA-Z]/)[0], data[i], needCapture);
                            delete data[i];
                        }
                    }
                }
            }
        };
    } ();


    /* 
    * 监听方法
    * @method	listener
    * @private
    * @param	{Element}	el		元素
    * @param	{string}	sEvent	事件名称
    * @param	{function}	handler	委托函数
    * @param	{string}	userEventName	原事件名称（被hook的事件）
    * @return	{object}	委托方法执行结果
    */

    function listener(el, sEvent, handler, userEventName) {
        return Cache.get(el, sEvent + (userEventName ? '.' + userEventName : ''), handler) ||
    function (e) {
        if (!userEventName || userEventName && EventTargetH._EventHooks[userEventName][sEvent](el, e)) {
            return fireHandler(el, e, handler, sEvent);
        }
    };
    }

    /* 
    * delegate监听方法
    * @method	delegateListener
    * @private
    * @param	{Element}	el		监听目标
    * @param	{string}	selector	选择�?
    * @param	{string}	sEvent		事件名称
    * @param	{function}	handler		委托函数
    * @param	{string}	userEventName	原事件名称（被hook的事件）
    * @return	{object}	委托方法执行结果
    */

    function delegateListener(el, selector, sEvent, handler, userEventName) {
        return Cache.get(el, sEvent + (userEventName ? '.' + userEventName : ''), handler, selector) ||
    function (e) {
        var elements = [],
        node = e.srcElement || e.target;
        if (!node) {
            return;
        }
        if (node.nodeType == 3) {
            node = node.parentNode;
        }
        while (node && node != el) {
            elements.push(node);
            node = node.parentNode;
        }
        elements = QW.Selector.filter(elements, selector, el);
        for (var i = 0, l = elements.length; i < l; ++i) {
            if (!userEventName || userEventName && EventTargetH._DelegateHooks[userEventName][sEvent](elements[i], e || window.event)) {
                return fireHandler(elements[i], e, handler, sEvent);
            }
            if (elements[i].parentNode && elements[i].parentNode.nodeType == 11) { //fix remove elements[i] bubble bug
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                else {
                    e.cancelBubble = true;
                }
                break;
            }
        }
    };
    }

    /* 
    * 事件执行入口
    * @method	fireHandler
    * @private
    * @param	{Element}	el			触发事件对象
    * @param	{event}		event		事件对象
    * @param	{function}	handler		事件委托
    * @param	{string}	sEvent		处理前事件名�?
    * @return	{object}	事件委托执行结果
    */

    function fireHandler(el, e, handler, sEvent) {
        return EventTargetH.fireHandler.apply(null, arguments);
    }


    var EventTargetH = {
        _EventHooks: {},
        _DelegateHooks: {},
        _DelegateCpatureEvents: 'change,focus,blur',
        /** 
        * 事件执行入口
        * @method	fireHandler
        * @private
        * @param	{Element}	el			触发事件对象
        * @param	{event}		event		事件对象
        * @param	{function}	handler		事件委托
        * @param	{string}	sEvent		处理前事件名�?
        * @return	{object}	事件委托执行结果
        */
        fireHandler: function (el, e, handler, sEvent) {
            e = standardize(e);
            return handler.call(el, e);
        },

        /**
        * 添加事件监听
        * @method	addEventListener
        * @param	{Element}	el	监听目标
        * @param	{string}	sEvent	事件名称
        * @param	{function}	handler	事件处理程序
        * @param	{bool}		capture	(Optional)是否捕获非ie才有�?
        * @return	{void}
        */
        addEventListener: (function () {
            if (document.addEventListener) {
                return function (el, sEvent, handler, capture) {
                    el.addEventListener(sEvent, handler, capture || false);
                };
            }
            else {
                return function (el, sEvent, handler) {
                    el.attachEvent('on' + sEvent, handler);
                };
            }
        } ()),

        /**
        * 移除事件监听
        * @method	removeEventListener
        * @private
        * @param	{Element}	el	监听目标
        * @param	{string}	sEvent	事件名称
        * @param	{function}	handler	事件处理程序
        * @param	{bool}		capture	(Optional)是否捕获非ie才有�?
        * @return	{void}
        */
        removeEventListener: (function () {
            if (document.removeEventListener) {
                return function (el, sEvent, handler, capture) {
                    el.removeEventListener(sEvent, handler, capture || false);
                };
            }
            else {
                return function (el, sEvent, handler) {
                    el.detachEvent('on' + sEvent, handler);
                };
            }
        } ()),

        /** 
        * 添加对指定事件的监听
        * @method	on
        * @param	{Element}	el	监听目标
        * @param	{string}	sEvent	事件名称
        * @param	{function}	handler	事件处理程序
        * @return	{boolean}	事件是否监听成功
        */
        on: function (el, sEvent, handler) {
            el = g(el);
            var hooks = EventTargetH._EventHooks[sEvent];
            if (hooks) {
                for (var i in hooks) {
                    var _listener = listener(el, i, handler, sEvent);
                    EventTargetH.addEventListener(el, i, _listener);
                    Cache.add(_listener, el, i + '.' + sEvent, handler);
                }
            }
            else {
                _listener = listener(el, sEvent, handler);
                EventTargetH.addEventListener(el, sEvent, _listener);
                Cache.add(_listener, el, sEvent, handler);
            }
        },

        /** 
        * 移除对指定事件的监听
        * @method	un
        * @param	{Element}	el	移除目标
        * @param	{string}	sEvent	(Optional)事件名称
        * @param	{function}	handler	(Optional)事件处理程序
        * @return	{boolean}	事件监听是否移除成功
        */
        un: function (el, sEvent, handler) {
            el = g(el);
            if (!handler) { //移除多个临控
                return Cache.removeEvents(el, sEvent);
            }
            var hooks = EventTargetH._EventHooks[sEvent];
            if (hooks) {
                for (var i in hooks) {
                    var _listener = listener(el, i, handler, sEvent);
                    EventTargetH.removeEventListener(el, i, _listener);
                    Cache.remove(el, i + '.' + sEvent, handler);
                }
            }
            else {
                _listener = listener(el, sEvent, handler);
                EventTargetH.removeEventListener(el, sEvent, _listener);
                Cache.remove(el, sEvent, handler);
            }
        },

        /** 
        * 添加事件委托
        * @method	delegate
        * @param	{Element}	el		被委托的目标
        * @param	{string}	selector	委托的目�?
        * @param	{string}	sEvent		事件名称
        * @param	{function}	handler		事件处理程序
        * @return	{boolean}	事件监听是否移除成功
        */
        delegate: function (el, selector, sEvent, handler) {
            el = g(el);
            var hooks = EventTargetH._DelegateHooks[sEvent],
        needCapture = EventTargetH._DelegateCpatureEvents.indexOf(sEvent) > -1;
            if (hooks) {
                for (var i in hooks) {
                    var _listener = delegateListener(el, selector, i, handler, sEvent);
                    EventTargetH.addEventListener(el, i, _listener, needCapture);
                    Cache.add(_listener, el, i + '.' + sEvent, handler, selector);
                }
            }
            else {
                _listener = delegateListener(el, selector, sEvent, handler);
                EventTargetH.addEventListener(el, sEvent, _listener, needCapture);
                Cache.add(_listener, el, sEvent, handler, selector);
            }
        },

        /** 
        * 移除事件委托
        * @method	undelegate
        * @param	{Element}	el		被委托的目标
        * @param	{string}	selector	(Optional)委托的目�?
        * @param	{string}	sEvent		(Optional)事件名称
        * @param	{function}	handler		(Optional)事件处理程序
        * @return	{boolean}	事件监听是否移除成功
        */
        undelegate: function (el, selector, sEvent, handler) {
            el = g(el);
            if (!handler) { //移除多个临控
                return Cache.removeDelegates(el, sEvent, selector);
            }
            var hooks = EventTargetH._DelegateHooks[sEvent],
        needCapture = EventTargetH._DelegateCpatureEvents.indexOf(sEvent) > -1;
            if (hooks) {
                for (var i in hooks) {
                    var _listener = delegateListener(el, selector, i, handler, sEvent);
                    EventTargetH.removeEventListener(el, i, _listener, needCapture);
                    Cache.remove(el, i + '.' + sEvent, handler, selector);
                }
            }
            else {
                _listener = delegateListener(el, selector, sEvent, handler);
                EventTargetH.removeEventListener(el, sEvent, _listener, needCapture);
                Cache.remove(el, sEvent, handler, selector);
            }
        },

        /** 
        * 触发对象的指定事�?
        * @method	fire
        * @param	{Element}	el	要触发事件的对象
        * @param	{string}	sEvent	事件名称
        * @return	{void}
        */
        fire: (function () {
            if (document.dispatchEvent) {
                return function (el, sEvent) {
                    var evt = null,
            doc = el.ownerDocument || el;
                    if (/mouse|click/i.test(sEvent)) {
                        evt = doc.createEvent('MouseEvents');
                        evt.initMouseEvent(sEvent, true, true, doc.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                    }
                    else {
                        evt = doc.createEvent('Events');
                        evt.initEvent(sEvent, true, true, doc.defaultView);
                    }
                    return el.dispatchEvent(evt);
                };
            }
            else {
                return function (el, sEvent) {
                    return el.fireEvent('on' + sEvent);
                };
            }
        } ())
    };

    EventTargetH._defaultExtend = function () {
        var extend = function (types) {
            function extendType(type) {
                EventTargetH[type] = function (el, handler) {
                    if (handler) {
                        EventTargetH.on(el, type, handler);
                    }
                    else {
                        (el[type] && el[type]()) || EventTargetH.fire(el, type);
                    }
                };
            }
            for (var i = 0, l = types.length; i < l; ++i) {
                extendType(types[i]);
            }
        };

        /** 
        * 绑定对象的click事件或者执行click方法
        * @method	click
        * @param	{Element}	el	要触发事件的对象
        * @param	{function}	handler	(Optional)事件委托
        * @return	{void}
        */


        /** 
        * 绑定对象的submit事件或者执行submit方法
        * @method	submit
        * @param	{Element}	el	要触发事件的对象
        * @param	{function}	handler	(Optional)事件委托
        * @return	{void}
        */

        /** 
        * 绑定对象的focus事件或者执行focus方法
        * @method	focus
        * @param	{Element}	el	要触发事件的对象
        * @param	{function}	handler	(Optional)事件委托
        * @return	{void}
        */

        /** 
        * 绑定对象的blur事件或者执行blur方法
        * @method	blur
        * @param	{Element}	el	要触发事件的对象
        * @param	{function}	handler	(Optional)事件委托
        * @return	{void}
        */

        extend('submit,reset,click,focus,blur,change'.split(','));
        EventTargetH.hover = function (el, enter, leave) {
            el = g(el);
            EventTargetH.on(el, 'mouseenter', enter);
            EventTargetH.on(el, 'mouseleave', leave || enter);
        };


        var UA = navigator.userAgent;
        if (/firefox/i.test(UA)) {
            EventTargetH._EventHooks.mousewheel = EventTargetH._DelegateHooks.mousewheel = {
                'DOMMouseScroll': function (e) {
                    return true;
                }
            };
        }
        mix(EventTargetH._EventHooks, {
            'mouseenter': {
                'mouseover': function (el, e) {
                    var relatedTarget = e.relatedTarget || e.fromElement;
                    if (!relatedTarget || !(el.contains ? el.contains(relatedTarget) : (el.compareDocumentPosition(relatedTarget) & 17))) {
                        //relatedTarget为空或不被自己包�?
                        return true;
                    }
                }
            },
            'mouseleave': {
                'mouseout': function (el, e) {
                    var relatedTarget = e.relatedTarget || e.toElement;
                    if (!relatedTarget || !(el.contains ? el.contains(relatedTarget) : (el.compareDocumentPosition(relatedTarget) & 17))) {
                        //relatedTarget为空或不被自己包�?
                        return true;
                    }
                }
            }
        });
        mix(EventTargetH._DelegateHooks, EventTargetH._EventHooks);
        if (!document.addEventListener) {
            function getElementVal(el) {
                switch (el.type) {
                    case 'checkbox':
                    case 'radio':
                        return el.checked;
                    case "select-multiple":
                        var vals = [],
            opts = el.options;
                        for (var j = 0; j < opts.length; ++j) {
                            if (opts[j].selected) {
                                vals.push(opts[j].value);
                            }
                        }
                        return vals.join(',');
                    default:
                        return el.value;
                }
            }

            function specialChange(el, e) {
                var target = e.target || e.srcElement;
                //if(target.tagName == 'OPTION') target = target.parentNode;
                if (getElementVal(target) != target.__QWETH_pre_val) {
                    return true;
                }
            }
            mix(EventTargetH._DelegateHooks, {
                'change': {
                    'focusin': function (el, e) {
                        var target = e.target || e.srcElement;
                        target.__QWETH_pre_val = getElementVal(target);

                    },
                    'deactivate': specialChange,
                    'focusout': specialChange,
                    'click': specialChange
                },
                'focus': {
                    'focusin': function (el, e) {
                        return true;
                    }
                },
                'blur': {
                    'focusout': function (el, e) {
                        return true;
                    }
                }
            });
        }
    };

    EventTargetH._defaultExtend(); //JK: 执行默认的渲染。另：solo时如果觉得内容太多，可以去掉本行进行二次solo
    QW.EventTargetH = EventTargetH;

} ());
/*
Copyright (c) Baidu Youa Wed QWrap
author: JK
*/
(function () {
    var mix = QW.ObjectH.mix,
    evalExp = QW.StringH.evalExp;
    /** 
    * @class Jss Jss-Data相关
    * @singleton
    * @namespace QW
    */
    var Jss = {};

    mix(Jss, {
        /** 
        * @property	rules Jss的当前所有rule，相当于css的内�?
        */
        rules: {},
        /** 
        * 添加jss rule
        * @method	addRule
        * @param	{string}	sSelector	selector字符串，目前只支�?#id、@name�?.className、tagName
        * @param	{json}	ruleData json对象，键为arrtibuteName，值为attributeValue，其中attributeValue可以是任何对�?
        * @return	{void}	
        */
        addRule: function (sSelector, ruleData) {
            var data = Jss.rules[sSelector] || (Jss.rules[sSelector] = {});
            mix(data, ruleData, true);
        },

        /** 
        * 添加一系列jss rule
        * @method	addRules
        * @param	{json}	rules json对象，键为selector，值为ruleData（Json对象�?
        * @return	{json}	
        */
        addRules: function (rules) {
            for (var i in rules) {
                Jss.addRule(i, rules[i]);
            }
        },

        /** 
        * 移除jss rule
        * @method	removeRule
        * @param	{string}	sSelector	selector字符串，目前只支�?#id、@name�?.className、tagName
        * @return	{boolean}	是否发生移除操作
        */
        removeRule: function (sSelector) {
            var data = Jss.rules[sSelector];
            if (data) {
                delete Jss.rules[sSelector];
                return true;
            }
            return false;
        },
        /** 
        * 获取jss rule
        * @method	getRuleData
        * @param	{string}	sSelector	selector字符串，目前只支�?#id、@name�?.className、tagName
        * @return	{json}	获取rule的数据内�?
        */
        getRuleData: function (sSelector) {
            return Jss.rules[sSelector];
        },

        /** 
        * 设置rule中某属�?
        * @method	setRuleAttribute
        * @param	{string}	sSelector	selector字符串，目前只支�?#id、@name�?.className、tagName
        * @param	{string}	arrtibuteName (Optional) attributeName
        * @param	{any}	value attributeValue
        * @return	{json}	是否发回移除操作
        */
        setRuleAttribute: function (sSelector, arrtibuteName, value) {
            var data = {};
            data[arrtibuteName] = value;
            Jss.addRule(sSelector, data);
        },

        /** 
        * 移除rule中某属�?
        * @method	removeRuleAttribute
        * @param	{string}	sSelector	selector字符串，目前只支�?#id、@name�?.className、tagName
        * @param	{string}	arrtibuteName (Optional) attributeName
        * @return	{json}	是否发回移除操作
        */
        removeRuleAttribute: function (sSelector, arrtibuteName) {
            var data = Jss.rules[sSelector];
            if (data && (attributeName in data)) {
                delete data[attributeName];
                return true;
            }
            return false;
        },

        /** 
        * 按selector获取jss 属�?
        * @method	getRuleAttribute
        * @param	{string}	sSelector	selector字符串，目前只支�?#id、@name�?.className、tagName
        * @param	{string}	arrtibuteName	属性名
        * @return	{json}	获取rule的内�?
        */
        getRuleAttribute: function (sSelector, arrtibuteName) {
            var data = Jss.rules[sSelector] || {};
            return data[arrtibuteName];
        }
    });
    /** 
    * @class JssTargetH JssTargetH相关
    * @singleton
    * @namespace QW
    */

    /*
    * 获取元素的inline的jssData
    * @method	getOwnJssData
    * @param	{element}	el	元素
    * @return	{json}	获取到的JssData
    */

    function getOwnJssData(el, needInit) {
        var data = el.__jssData;
        if (!data) {
            var s = el.getAttribute('data-jss');
            if (s) {
                data = el.__jssData = evalExp('{' + s + '}');
            }
        }
        else if (needInit) {
            data = el.__jssData = {};
        }
        return data;
    }

    var JssTargetH = {

        /** 
        * 获取元素的inline的jss
        * @method	getOwnJss
        * @param	{element}	el	元素
        * @return	{any}	获取到的jss attribute
        */
        getOwnJss: function (el, attributeName) {
            var data = getOwnJssData(el);
            if (data && (attributeName in data)) {
                return data[attributeName];
            }
            return undefined;
        },

        /** 
        * 获取元素的jss属性，优先度为：inlineJssAttribute > #id > @name > .className > tagName
        * @method	getJss
        * @param	{element}	el	元素
        * @return	{any}	获取到的jss attribute
        */
        getJss: function (el, attributeName) { //为提高性能，本方法代码有点长�?
            var data = getOwnJssData(el);
            if (data && (attributeName in data)) {
                return data[attributeName];
            }
            var getRuleData = Jss.getRuleData,
        id = el.id;
            if (id && (data = getRuleData('#' + id)) && (attributeName in data)) {
                return data[attributeName];
            }
            var name = el.name;
            if (name && (data = getRuleData('@' + name)) && (attributeName in data)) {
                return data[attributeName];
            }
            var className = el.className;
            if (className) {
                var classNames = className.split(' ');
                for (var i = 0; i < classNames.length; i++) {
                    if ((data = getRuleData('.' + classNames[i])) && (attributeName in data)) {
                        return data[attributeName];
                    }
                }
            }
            var tagName = el.tagName;
            if (tagName && (data = getRuleData(tagName)) && (attributeName in data)) {
                return data[attributeName];
            }
            return undefined;
        },
        /** 
        * 设置元素的jss属�?
        * @method	setJss
        * @param	{element}	el	元素
        * @param	{string}	attributeName	attributeName
        * @param	{any}	attributeValue	attributeValue
        * @return	{void}	
        */
        setJss: function (el, attributeName, attributeValue) {
            var data = getOwnJssData(el, true);
            data[attributeName] = attributeValue;
        },

        /** 
        * 移除元素的inline的jss
        * @method	removeJss
        * @param	{element}	el	元素
        * @param	{string}	attributeName	attributeName
        * @return	{boolean}	是否进行remove操作
        */
        removeJss: function (el, attributeName) {
            var data = getOwnJssData(el);
            if (data && (attributeName in data)) {
                delete data[attributeName];
                return true;
            }
            return false;
        }
    };

    QW.Jss = Jss;
    QW.JssTargetH = JssTargetH;
} ());
(function () {
    var queryer = 'queryer',
    operator = 'operator',
    getter_all = 'getter_all',
    getter_first = 'getter_first',
    getter_first_all = 'getter_first_all';

    QW.NodeC = {
        getterType: getter_first,
        arrayMethods: 'map,forEach,toArray'.split(','),
        //部分Array的方法也会集成到NodeW�?
        wrapMethods: {
            //queryer “返回值”的包装结果
            //operator 如果是静态方法，返回第一个参数的包装，如果是原型方法，返回本�?
            //getter_all 如果是array，则每一个执行，并返�?
            //getter_first 如果是array，则返回第一个执行的返回�?
            //getter_first_all 同getter，产出两个方法，一个是getterFirst，一个是getterAll
            //NodeH系列
            g: queryer,
            one: queryer,
            query: queryer,
            getElementsByClass: queryer,
            outerHTML: getter_first,
            hasClass: getter_first,
            addClass: operator,
            removeClass: operator,
            replaceClass: operator,
            toggleClass: operator,
            show: operator,
            hide: operator,
            toggle: operator,
            isVisible: getter_first,
            getXY: getter_first_all,
            setXY: operator,
            setSize: operator,
            setInnerSize: operator,
            setRect: operator,
            setInnerRect: operator,
            getSize: getter_first_all,
            getRect: getter_first_all,
            nextSibling: queryer,
            previousSibling: queryer,
            ancestorNode: queryer,
            parentNode: queryer,
            firstChild: queryer,
            lastChild: queryer,
            contains: getter_first,
            insertAdjacentHTML: operator,
            insertAdjacentElement: operator,
            insert: operator,
            insertTo: operator,
            appendChild: operator,
            insertSiblingBefore: operator,
            insertSiblingAfter: operator,
            insertBefore: operator,
            insertAfter: operator,
            replaceNode: operator,
            replaceChild: operator,
            removeNode: operator,
            empty: operator,
            removeChild: operator,
            get: getter_first_all,
            set: operator,
            getAttr: getter_first_all,
            setAttr: operator,
            removeAttr: operator,
            getValue: getter_first_all,
            setValue: operator,
            getHtml: getter_first_all,
            setHtml: operator,
            encodeURIForm: getter_first,
            isFormChanged: getter_first,
            cloneNode: queryer,
            getStyle: getter_first_all,
            getCurrentStyle: getter_first_all,
            setStyle: operator,
            removeStyle: operator,
            borderWidth: getter_first,
            paddingWidth: getter_first,
            marginWidth: getter_first,

            //TargetH系列
            //…�?
            //JssTargetH系列
            getOwnJss: getter_first_all,
            getJss: getter_first_all,
            setJss: operator,
            removeJss: operator,

            //ArrayH系列
            forEach: operator
        },
        gsetterMethods: { //在此json里的方法，会是一个getter与setter的混合体
            val: ['getValue', 'setValue'],
            html: ['getHtml', 'setHtml'],
            attr: ['', 'getAttr', 'setAttr'],
            css: ['', 'getCurrentStyle', 'setStyle'],
            size: ['getSize', 'setInnerSize'],
            xy: ['getXY', 'setXY']
        }
    };

} ());
(function () {
    var methodize = QW.HelperH.methodize,
    mix = QW.ObjectH.mix;
    /**
    * @class Object 扩展Object，用ObjectH来修饰Object，特别说明，未对Object.prototype作渲染，以保证Object.prototype的纯洁�?
    * @usehelper QW.ObjectH
    */
    mix(Object, QW.ObjectH);

    /**
    * @class Array 扩展Array，用ArrayH/HashsetH来修饰Array
    * @usehelper QW.ArrayH,QW.HashsetH
    */
    mix(QW.ArrayH, QW.HashsetH);
    mix(Array, QW.ArrayH);
    mix(Array.prototype, methodize(QW.ArrayH));

    /**
    * @class Function 扩展Function，用FunctionH/ClassH来修饰Function
    * @usehelper QW.FunctionH
    */
    mix(QW.FunctionH, QW.ClassH);
    mix(Function, QW.FunctionH);
    //	mix(Function.prototype, methodize(QW.FunctionH));
    /**
    * @class Date 扩展Date，用DateH来修饰Date
    * @usehelper QW.DateH
    */
    mix(Date, QW.DateH);
    mix(Date.prototype, methodize(QW.DateH));


    /**
    * @class String 扩展String，用StringH来修饰String
    * @usehelper QW.StringH
    */
    mix(String, QW.StringH);
    mix(String.prototype, methodize(QW.StringH));
} ());
/*
Copyright (c) Baidu Youa Wed QWrap
author: 好奇、JK
*/

(function () {
    var mix = QW.ObjectH.mix,
    methodize = QW.HelperH.methodize,
    rwrap = QW.HelperH.rwrap,
    NodeC = QW.NodeC,
    NodeH = QW.NodeH,
    EventTargetH = QW.EventTargetH,
    JssTargetH = QW.JssTargetH,
    DomU = QW.DomU,
    NodeW = QW.NodeW;
    /*
    * 用NodeH、EventTargetH、JssTargetH、ArrayH渲染NodeW
    */

    NodeW.pluginHelper(NodeH, NodeC.wrapMethods, NodeC.gsetterMethods);
    NodeW.pluginHelper(EventTargetH, 'operator');
    NodeW.pluginHelper(JssTargetH, NodeC.wrapMethods, {
        jss: ['', 'getJss', 'setJss']
    });

    var ah = QW.ObjectH.dump(QW.ArrayH, NodeC.arrayMethods);
    ah = methodize(ah);
    ah = rwrap(ah, NodeW, NodeC.wrapMethods);
    mix(NodeW.prototype, ah); //ArrayH的某些方�?
    /**
    * @class Dom 将QW.DomU与QW.NodeH合并到QW.Dom里，以跟旧的代码保持一�?
    * @singleton 
    * @namespace QW
    */
    var Dom = QW.Dom = {};
    mix(Dom, [DomU, NodeH, EventTargetH, JssTargetH]);
} ());
/*
* 防重复点�?
*/
(function () {
    var F = function (el, e) {
        var ban = (el.getAttribute && el.getAttribute('data--ban')) | 0;
        if (ban) {
            if (!el.__BAN_preTime || (new Date() - el.__BAN_preTime) > ban) {
                setTimeout(function () { //月影：setTimeout来避免“在el上注册多个事件时只能执行第一个”�?
                    el.__BAN_preTime = new Date() * 1;
                });
                return true;
            }
            QW.EventH.preventDefault(e);
            return;
        }
        return true;
    };
    QW.EventTargetH._DelegateHooks.click = QW.EventTargetH._EventHooks.click = {
        'click': F
    };
    QW.EventTargetH._EventHooks.submit = {
        'submit': F
    };
} ());

/*
* 增加别名
*/
QW.g = QW.NodeH.g;
QW.W = QW.NodeW;

/*
* 将直属于QW的方法与命名空间上提一层到window
*/
QW.ObjectH.mix(window, QW);

/*
* 增加provide的产�?
*/
QW.ModuleH.provideDomains.push(window);