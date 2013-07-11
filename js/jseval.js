Dom.ready(function () {
    W('textarea.code').forEach(
		function codeHLFun(el) {
		    var w = W(el),
				isJs = w.hasClass('code_js');
		    if (K.B.ie) {
		        w.insertAdjacentHTML('beforebegin', '<div class="example_btn_wrap"><input type=button value="运行实例' + (isJs ? 'JS' : 'HTML') + '" class="code_run" style="width:120px; border: 1px none #000; color: #777; filter: none;  "/> &nbsp; <input type=button value="修改示例" class="code_change" style="width:100px; background:none; border:none"/></div>');
		        w.insertAdjacentHTML('afterend', '<div class="code_highlight" style="background-color:#eee"></div>');
		    } else {
		        w.insertAdjacentHTML('beforebegin', '<div class="example_btn_wrap"><input type=button value="运行实例' + (isJs ? 'JS' : 'HTML') + '" class="code_run" style="width:120px;"/> &nbsp; <input type=button value="修改示例" class="code_change" style="width:120px;"/></div>');
		        w.insertAdjacentHTML('afterend', '<div class="code_highlight" style="background-color:#eee"></div>');
		    }
		    var code = w.val();
		    var _class = new CLASS_HIGHLIGHT(code, (isJs ? 'js' : 'html'));
		    w.nextSibling('div').html(_class.highlight());
		    w.hide();
		}
	);
    W(document.body).delegate('input.code_run', 'click', function () {
        var w = W(this).parentNode().nextSibling('textarea.code');
        if (w.hasClass('code_js')) {
            new Function(w.val())();
        }
        else {
            var win = window.open('about:blank');
            var doc = win.document;
            doc.open();
            var html = '<html>'+ w.val() +'</html>';
            doc.write(html);
            doc.close();
        }
    }).delegate('input.code_change', 'click', function () {
        var w = W(this).parentNode().nextSibling('textarea.code');
        if (this.value == '修改示例') {
            this.value = '还原示例';
            w.show().nextSibling('div').hide();
        }
        else {
            this.value = '修改示例';
            w.hide().val(w.get('defaultValue')).nextSibling('div').show();
        }
    }).delegate('a.method_source', 'click', function (e) {
        e.preventDefault();
        var key = this.innerHTML.replace(/^QW\./, '');
        alert(ObjectH.get(QW, key));
    });


});    