(function (K) {
    var Try = {
        these: function () {
            var returnValue;
            for (var i = 0, length = arguments.length; i < length; i++) {
                var lambda = arguments[i];
                try {
                    returnValue = lambda();
                    break;
                } catch (e) { }
            }
            return returnValue;
        }
    };
    var AjaxBase = KClass.create({
        init: function (options) {
            this.options = {
                //Ä¬ÈÏ´«µÝ
                asynchronous: true,
                //  contentType: 'application/x-www-form-urlencoded',
                contentType: 'text/html', //
                encoding: 'UTF-8',
                url: '',
                readyState: 0,
                parameters: options.parameters,
                requestHeader: [],
                container: null,
                method: 'get',
                send: null
            }
            K.O.Kextend(this.options, options || {});
        }
    });
    var ajax = KClass.create(AjaxBase, {
        init: function (Ksuper, options) {
            Ksuper(options);
            this.container = this.options.container ? document.getElementById(container) : '';
            this.url = this.options.url;
            this.readyState = this.options.readyState;
            this.parameters = this.options.parameters;
            this.requestHeader = this.options.requestHeader;
            this.method = this.options.method;
            this.asy = this.options.asynchronous;
            this.contentType = this.options.contentType;
            this.encoding = this.options.encoding;
            this.options.method = this.options.method.toLowerCase();
            this.send = this.options.send;
            this.core = this;
            if (K.O.isHash(this.parameters))
                this.parameters = this.parameters.toObject();
            this.xhrObject = this.createxhrobject();
            this.doxhr(this.options, this.xhrObject, this.core);
        },
        createxhrobject: function () {
            return Try.these(
                    function () { return new XMLHttpRequest(); },
                    function () { return new ActiveXObject('Microsoft.XMLHTTP'); }
                )
        },
        doxhr: function (options, xhrobject, core) {
            var xhr = xhrobject;
            var opt = options;
            var main = core;
            var params = K.O.isString(this.parameters) ? this.parameters : K.O.toQueryString(this.parameters);
            if (params && this.method === 'get') {
                this.url += (K.S.include(this.url,'?') ? '&' : '?') + params;
            }
            this.parameters = K.S.toQueryParams(this.parameters);
            xhr.onreadystatechange = function () {
                switch (xhr.readyState) {
                    case 1:
                        if (opt.loadListener) {
                            opt.loadListener.apply(xhr, arguments);
                        }
                        break;
                    case 2:
                        if (opt.loadedListener) {
                            opt.loadedListener.apply(xhr, arguments);
                        }
                        break;
                    case 3:
                        if (opt.ineractiveListener) {
                            opt.ineractiveListener.apply(xhr, arguments);
                        }
                        break;
                    case 4:
                        try {
                            if (xhr.status && xhr.status == 200 || xhr.status == 304) {
                                var extensionIndex = opt.url.lastIndexOf('.');
                                var extension = opt.url.substring(extensionIndex, opt.url.length);
                                switch (extension) {
                                    case '.html':
                                        if (opt.htmlResponseListener) {
                                            opt.htmlResponseListener.call(xhr, xhr.responseText);
                                        }
                                        break;
                                    case '.json':
                                        if (opt.url) {
                                            try {
                                                main.LoadJs(opt.url);
                                            } catch (e) {
                                                var json = false;
                                            }
                                        }
                                        break;
                                    case '.xml':
                                        if (opt.xmlResponseListener) {
                                            opt.xmlResponseListener.call(xhr, xhr.responseXML);
                                        }
                                        break;
                                }
                                if (opt.completeListener) {
                                    opt.completeListener.apply(xhr, arguments);
                                }
                            } else {
                                if (opt.errorListener) {
                                    opt.errorListener.apply(xhr, arguments);
                                }
                            }
                        } catch (e) {

                        }
                        break;
                }
            };
            this.xhrObject.open(this.method, this.url, this.asy);
            this.setRequestHeaders();
            this.xhrObject.send(this.send);
            return xhr;
        },
        setRequestHeaders: function () {
            var headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'X-QCOM-Version': K.Version,
                'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
            };
            if (this.method == 'post') {
                headers['Content-type'] = this.contentType + (this.encoding ? '; charset=' + this.encoding : '');
            }
            if (typeof this.requestHeader == 'object') {
                var extras = this.requestHeader;
                if (K.C.isFunction(extras.push))
                    for (var i = 0, length = extras.length; i < length; i += 2)
                        headers[extras[i]] = extras[i + 1];
                else
                    K.H(extras).each(function (pair) { headers[pair.key] = pair.value });
            }
            for (var name in headers)
                this.xhrObject.setRequestHeader(name, headers[name]);
        },
        LoadJs: function (sUrl, fCallback) {
            var _script = document.createElement('script');
            _script.setAttribute('type', 'text/javascript');
            _script.setAttribute('charset', 'gb2312');
            _script.setAttribute('src', sUrl);
            document.getElementsByTagName('head')[0].appendChild(_script);
        },
        parseJSON: function (s, filter) {
            var j;
            function walk(k, v) {
                var i;
                if (v && typeof v === 'object') {
                    for (i in v) {
                        if (v.hasOwnProperty(i)) {
                            v[i] = walk(i, v[i]);
                        }
                    }
                }
                return filter(k, v);
            }

            if (/^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/.
            test(s)) {

                try {
                    j = eval('(' + s + ')');
                } catch (e) {
                    throw new SyntaxError("parseJSON");
                }
            } else {
                throw new SyntaxError("parseJSON");
            }


            if (typeof filter === 'function') {
                j = walk('', j);
            }
            return j;
        }
    })
    K.ajax = function (options) {
        return new ajax(options)
    }
})(K)
