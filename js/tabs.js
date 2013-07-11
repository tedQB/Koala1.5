  /* 以下为TOM效果常用函数..
    参数说明：
 
    id: 大容器，默认为focus
    tabId: 按钮容器的id,默认为大容器
    tabTn: 按钮的标签名，默认为li
    tabCn: 按钮的类名
    conId: 切换内容块的容器id,默认为大容器
    conTn: 切换内容块的标签，默认为div
    conCn: 切换内容块的类名
    bns: 额外按钮支持，为数组，例如：['prev','next']
    extra: 需要在当前按钮上附加的结构代码，0为前，1为后，例如[0，'<span />']
    auto: 是否自动播放,默认为不自动0
    current: 显示当前内容，默认为第一个0
    eType: 事件类型，默认为点击click
    interval: 间隔，默认为3秒3000
    curCn: 当前状态类名,默认为 current
    effect: 切换效果，默认为直接切换,被选中滑动(slide)或者渐隐(fade)
    vertical: 切换方向,仅对slide有效，默认为垂直1
    z:设置当前内容块的z轴值，默认为100
 
    调用方法示意：tabs({conId:'fcon',effect:'fade',auto:1,extra:[0,'<span></span>'],bns:['prev','next']})

    */

var tabs = function (JSON) {
    return new tabs.init(JSON);
}
tabs.init = function (JSON) {
    this.opt = {
        id: 'focus',
        tabTn: 'li',
        conTn: 'div',
        current: 0,
        auto: 0,
        vertical: 1,
        eType: 'click',
        interval: 3000,
        curCn: 'current',
        z: 100,
        tempCn: []
        }
        var opt = this.opt; /*默认参数*/
        for (var x in JSON) opt[x] = JSON[x];
        this.current = opt.current;
        this.mousecurrent=opt.mousecurrent;
        this.slidecurrent=opt.slidecurrent; 
        this.conId = opt.conId ? opt.conId : opt.id; //不存在li,div,等定位卡，只给定位到focus..//div|#focus6
	//判断切换块是否有类名，conCn:'con'，默认为'div',返回数组o.cons,切换块
     //opt.conCn:'div' ,o.cont:#focus6
        this.mbox=id(opt.id);
        this.tabId = opt.tabId ? opt.tabId : opt.id;
        this.cont = id(this.conId);  //把focus转到cont.
        this.cons = opt.conCn ? getByCn(opt.conCn, id(this.conId)) : id(this.conId).getElementsByTagName(opt.conTn);
        this.levels=this.cons.length; 
        var tr=this.mbox.getElementsByTagName("ul")[0];
        //special
        if(!this.mbox.getElementsByTagName("ul")[0]) 
        {
            var triggers=document.createElement("ul");
            triggers.className='triggers';
            for(var i=1;i<this.levels+1;i++)
            {
                (function(n){
                        var trigger=document.createElement("li");
                        trigger.innerHTML=n.toString();
                        triggers.appendChild(trigger);
                })(i)
            }
            this.mbox.appendChild(triggers);
        }
        this.tabs=triggers;
        this.tabs = opt.tabCn ? getByCn(opt.tabCn, id(this.tabId)) : id(this.tabId).getElementsByTagName(opt.tabTn);

        //which effect to use
        this.effectFn = opt.conId && opt.effect && this.effects[opt.effect] ? this.effects[opt.effect] : this.effects['def'];//设置效果参数,默认为第一个def切换..
       if (opt.effect == 'slide') {
            this.mbox.style.overflow='hidden';
            this.cont.style.position='absolute';
            this.Tol = opt.vertical ? 'top' : 'left'; /*控制垂直向左走,还是向右走..*/
            this.ml = this.cons[0][opt.vertical ? 'offsetHeight' : 'offsetWidth'];
        }
       if(opt.effect=='fade')
	   for(var i=0,l=this.levels;i<l;i++)
        {
               this.cons[i].style.position="absolute";
               this.cons[i].style.top=0;
        }

        //handle extra htmlstring
        this.nd = opt.extra ? parseHtmlStr(opt.extra[1]) : null;
        // check if the number of tabs equals of the cons's
        if (this.tabs.length != this.cons.length) {
            throw new Error("Match Failed");
            return;
        } 
        else
            this.levels = this.tabs.length;
        //bind events
        var o = this;
        for (var i = 0; i < this.levels; i++)
            (function (n) {
                opt.tempCn[n] = o.tabs[n].className;
                addEvent(o.tabs[n], opt.eType, function () {
                    o.moveTo(n); //o.tab按钮触发函数moveTo函数..
                })
            })(i)//我靠，这样传参解决赋值问题..牛..
        //handle bns
        if (opt.bns && opt.bns.length == 2) {
            addEvent(id(opt.bns[0]), 'click', function () {
                o.prev()
            });
            addEvent(id(opt.bns[1]), 'click', function () {
                o.next()
            })
        }
        this.moveTo(this.current);
    }
    tabs.init.prototype = {
        effects: {
            def: function (o, n) {
                for (var i = 0; i < o.levels; i++) {
                    o.cons[i].style.display = (n == i) ? 'block' : 'none';
                }                    
                addEvent(o.cons[n],'mouseover',function(){
                            o.runId&&clearTimeout(o.runId); 
                            o.opt.mousecurrent=o.current;  
                })
                addEvent(o.cons[n],'mouseout',function(){
                            o.moveTo(o.opt.mousecurrent);
                })
                o.opt.auto && (o.runId = setTimeout(function () { o.next() }, o.opt.interval))
            },
            slide: function (o, n, to) {
                var y = parseInt(o.cont.style[o.Tol] ? o.cont.style[o.Tol] : '0px');                   //-28px
                o.end = (y == to) ? 1 : 0;
//            addEvent(o.cont,'mousemove',function(e){
//                  if(o.y!=to){ 
//                                   //slidess(o,y,to,n);
//                                   stopBubble(e)
//                                   return false; 

//                    } //保证滑动到顶部才会清空线程...
//                   else
//                   {
//                         //o.opt.auto=0; 
//                        //o.runId&&(o.opt.interval=30000000); 
//                        o.opt.mousecurrent=n;  
//                        stopBubble(e)
//                     }
//                })
//////如何触发一个事件后其他事件默认都给remove掉,或者所在程序集不再执行，跳出程序..
////               addEvent(o.cont,'mouseout',function(e){
////                        if(o.y!=to)
////                        {
////                            stopBubble(e)
////                            return false; 
////                        }
////                        else{
////                                o.opt.interval=1000; 
////                                o.moveTo(o.opt.mousecurrent);
////                                stopBubble(e)
////                        }
////              })

                if (!o.end) 
               {
                    if (y < to)
                        y += Math.ceil((to - y) / 10);
                    if (y > to) //0>-271
                        y -= Math.ceil((y - to) / 10); //-28
                        o.cont.style[o.Tol] = y + "px"; 

                        o.runId = setTimeout(function () {
                            o.effectFn(o, n, to) //
                        }, 10)                  
                } 
                else{
                    o.opt.auto && (o.runId = setTimeout(function () { o.next() }, o.opt.interval))
                    }
            },
            fade: function (o, n) {
                var cur = 0;
                addEvent(o.cons[n],'mouseover',function(){
                       setOpacity(o.cons[n],100);
                       o.runId&&clearTimeout(o.runId); 
                       o.opt.mousecurrent=o.current;  
                })
                addEvent(o.cons[n],'mouseout',function(){
                       o.moveTo(o.opt.mousecurrent);
                })

                for (var i = 0; i < o.levels; i++) {
                    o.cons[i].style.display = (n == i) ? 'block' : 'none';
                    //o.cons[i].style.zIndex = (n == i) ? o.opt.z : i; //100; 以那个图为背景曝光图
                }
                (function () {
                    if (cur < 100)
                    {
                        cur += Math.ceil((100 - cur) / 10); 
    					setOpacity(o.cons[n],cur);
                        o.runId=setTimeout(arguments.callee,10)
                    }
                    else 
                        o.opt.auto && (o.runId = setTimeout(function () { o.next() }, o.opt.interval))
                })()
            }
        },
        addNd: [function (e, nd) {
            e.insertBefore(nd, e.firstChild);
        }, function (e, nd) {
            e.appendChild(nd);
        } ],
 /*
    描述：设置类名,嫁接改变切换块函数effctFn(n,to);
    参数：n:传入点击的按钮..
    返回值：返回带有类名的切换块,
*/
        moveTo: function (n) {
            this.runId && clearTimeout(this.runId)
            var o=this; 
            var to = 0, n;//用o接住otabs按钮对象.
            (n > this.levels - 1) && (n = 0);        //这种方法是第一个返回false就不会去处理第二个,第一个为真才会处理第一个..
            (n < 0) && (n = this.levels - 1);
            if (this.opt.effect == 'slide') {
                to = '-' + n * this.ml; //to=-271px; 
                this.end = 0;
            }
        addEvent(o.cont,'mousemove',function(e){
                  if(!o.end){ 
                                   //slidess(o,y,to,n);
                                   return true;  

                    } //保证滑动到顶部才会清空线程...
                   else
                   {    
                         //o.opt.auto=0; 
                        o.opt.interval=30000000
                        o.opt.mousecurrent=n;  
                        o.runId && clearTimeout(o.runId); 
                     }
                })
               addEvent(o.cont,'mouseout',function(){
                        if(!o.end)
                        {
                            return true; 
                        }
                        else{                        
                                o.runId && clearTimeout(o.runId); 
                                o.opt.interval=3000; 
                                o.opt.auto && (o.runId = setTimeout(function () { o.next();}, o.opt.interval))
                        }

              })
//           if(o.y&&o.y!=to){ 
//                                   //slidess(o,y,to,n);
//                                  return false; 
//             }
            ; //如果已经通过点击激活了一个setTimeout函数，那么再次点击，销毁以前的，重新开始一个setTimeout函数...这可以作为突破口...
            /*设置类名*/
            for (var i = 0; i < this.levels; i++) {
                if (n == i) {
                    this.tabs[i].className = this.tabs[i].className ? this.opt.curCn + ' ' + this.opt.tempCn[i] : this.opt.curCn;
                    this.nd &&
					this.addNd[this.opt.extra[0]](this.tabs[i], this.nd)
                } else {
                    this.tabs[i].className = this.opt.tempCn[i];
                    if (this.nd)
                        try { this.tabs[i].removeChild(this.nd) } catch (e) { }
                }
            }

////如何触发一个事件后其他事件默认都给remove掉,或者所在程序集不再执行，跳出程序..
            this.current = n;
            this.effectFn(this, n, to); 
        },
        prev: function () {
            this.moveTo(--this.current);
        },
        next: function () {
            this.moveTo(++this.current);
        }
    }
    function id(s) {
        return document.getElementById(s);
    }
/*
    描述：遍历带有类名的切换块
    参数：cn:类名，from:母块
    返回值：返回带有类名的切换块,
*/
    function getByCn(cn, from, onlyOne) {
        var re = [], from = from ? ((from.nodeType == 1) ? from.getElementsByTagName('*') : from) : document.getElementsByTagName('*');
        for (var i = 0, l = from.length; i < l; i++) {
            if (hasClass(cn, from[i])) {
                re.push(from[i]);
                if (onlyOne) break;
            }
        }
        return re;
    }
    function hasClass(val, elem) {
        var re = new RegExp("(^|\\s)" + val + "(\\s|$)");
        if (re.test(elem.className))
            return true;
    }
    function addEvent(obj, type, fn) {
        if (obj.addEventListener)
            obj.addEventListener(type, fn, true);
        else if (obj.attachEvent) {
            obj["e" + type + fn] = fn;
            obj.attachEvent("on" + type, function () {
                obj["e" + type + fn]()
            });
        }
    }
    function parseHtmlStr(str) {
        var nd = document.createElement(/<\w+/.exec(str)[0].substr(1)), atts = str.substr(0, str.indexOf('>') + 1).match(/\w+=(['"])[^>]*?\1/g);
        if (atts && atts.length > 0) {
            var i = 0;
            while (atts[i]) {
                var tmp = atts[i].split('=');
                if (tmp[1] = tmp[1].replace(/['"]/g, ''))
                    nd.setAttribute(tmp[0], tmp[1]);
                i++;
            }
        }
        nd.innerHTML = str.substring(str.indexOf('>') + 1, str.lastIndexOf('<')).replace(/^\s+|\s+$/g, '');
        return nd;
    }
    function setOpacity(elem, level) {
        if (elem.filter)
            elem.style.filter = 'alpha(opacity=' + level + ')';
        //  filter:alpha(opacity=50);
        else
            elem.style.opacity = level / 100;
    }
