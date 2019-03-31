Koala是一个便捷，轻巧的新型面向对象的javascript框架，综合各种主流框架的特点，支持级联代码，面向对象，传统方式的代码风格，
底层代码简单易懂，可扩展，可移植性性强，可以快速的构建简单的页面交互组件，使构建的组件代码适合在各种团队内分发协作。
如果您是一位JSer，或者想成为一名JSer，Koala会辅助您快速上手JS，减少诸多重复而枯燥的原生方法调用，
从而专注于程序应用逻辑的实现，使得代码更加的健壮。另外如果您被各种"$"符号搞的晕头转向的时候，那就尝试一下Koala吧！


Koala cdn http://mat1.gtimg.com/www/js/Koala/Koala.dev.1.5.js

更新日记：

2011年11月17日 Koala1.0正式版发布  
    1.修正loose.dtd下事件绑定的问题  
    2.增加了K.A.each返回方法，K/KK.select, K/KK.getBy,K.getByTagName方法。  
    3.文档样式相关增加了css操作，getStyle，setStyle操作,增加了Kdom属性，Kdoms属性的文档片  
    4.优化了sizzle选择器的文档  
    5.优化文档的查看体验  
2011年12月2日 Koala插件机制完成  
    1.实现了插件功能，并完成插件开发规范文档  
    2.更改了insert方法的使用  
    3.增加了Hash对象和迭代Enumerable对象  
    4.增加了K.String的include包含方法，toQueryParams方法  
    5.优化了快速选择符K的效率，  
    6.调整了K.A.each方法的返回值  
    7.编写了插件K.ajax并完成对应文档  
    8.修正了page.x,page.y,client.x,client.y文档  
12月8日   
    修正了K/KK().append方法的使用  
2012年1月4日  
    1.增加了文档搜索API的功能  
    2.添加了width,height,pageX,pageY,parentX,parentY,html,attr功能和对应文档  
    3.修正个个别api名称过长的问题  
2012年8月27日 发布1.4.1版本  
    1.完成Qfast与Koala整合  
    2.添加顶层窗口K().scrollTop()和K().scrollLeft()的方法  
    3.添加顶层窗口鼠标滚轮:K().bind('mousewheel',function(){}),拖动滚动条的事件:K().bind('scroll',function(){})  
    4.分发了发布系统公共页面片以供使用  
    5.简化了KK多节点到单节点的节点转化形式,解释，若KK(selector)选择为一个节点，则自动转化为单节点kwdom，代替以往KK(selector).item(0)  
    5.修正了部分文档bug  
2012年11月28日 发布1.5版本  
    1.修正IE下调用浏览器私有api console.log出现alert弹层问题  
    2.增加parentWrap,childWrap两个新api  
    3.增加了选择器选择不到页面节点不会报错的功能，应对编辑手动删除HTML,没有删除js的情况  
    4.增加K.debug(1)函数，可精确定位选择器错误。解决bug定位问题  
    5.增加选择器HTML属性，可方便的查看到选择到的HTML节点信息  
    6.修整了若干文档bug  
      
        1.6版本计划:Koala离子CMD模块化  
 ----
 
 2013年1月1日
 
 本项目不再维护，腾讯地方站的开发人员请迁移到其他框架
 
