(function () {

    /*
    ---
    名称: Selector

    描述: 提供选择工具和库的依赖函数

    依赖: 

    ...
    */

    /*单节点选择器*/
    var localvar = window.K;
    this._win = window;
    this._doc = document;
    this.slice = Array.prototype.slice;
    this._head = document.getElementsByTagName("head")[0];
    var K = this.K = this._K = this.Koala = function (v) {
        if (K.C.isKdom(v)) {
            return v;
        }
		if(K.C.isfun(v)){ 
			addEvent(window,'load',v);
		}
        var node = K.C.node(arguments.length > 0 ? v : _doc.body);
	
        if (node) {
            var ClassK = K.fn.create(Kwdom, {
                init: function (node) {
                    this.isKdom = true; //是否为级联dom
                    this.node = node; //节点
                    this.tag = this.node == _win ? "win" : this.node == _doc ? "doc" : this.node.tagName.toLowerCase(); // tag的名称..
                },
                Version: '1.0',
                author: 'boqiu',
                noConflict: function () {
                    //if(window.K){ console.log("如果存在K,请全局替换大写K以便兼容其他库")}
                    if (this.Version) {
                        window.K = localvar
                    }
                    return _K;
                }

            })
            //对象Object.extend(ClassFirst,DOMEvent);

            var instance = new ClassK(node);
            instance.toString = function () { return "Kdom" };
            return instance;
        }
		function addEvent(node, type, listener) {
			if (node.addEventListener) {
				node.addEventListener(type, listener, false);
				return true;
			} else if (node.attachEvent) {
				node['e' + type + listener] = listener;
				node[type + listener] = function () { node['e' + type + listener](window.event); }
				node.attachEvent('on' + type, node[type + listener]);
				return true;
			}
			return false;
		};			
        return false;
	
    };

    (function () {

        /*多节点选择器*/
        var KK = this.KK = function () {
            var expression = KA(arguments).join(', ');
            return K.Selector.select(expression, document);
        }

        /*
        var paras = KA(document.getElementsByTagName('p')); 
        */
        var KA = this.KA = function (iterable) {
            if (!iterable) return [];
            if ('toArray' in Object(iterable)) return iterable.toArray();
            var length = iterable.length || 0, results = new Array(length);
            while (length--) results[length] = iterable[length];
            return results;

        };
        K.doms = function (v) {
            var a;
            if (arguments.length > 1) {
                a = arguments;
            } else if (K.C.isKdoms(v)) {
                return v;
            } else if (K.C.isarr(v) || K.C.isDoms(v)) {
                a = v;
            } else if (K.C.isstr(v)) {
                a = /^n:(\w+)$/.test(v) ? _doc.getElementsByName(RegExp.$1) : _doc.getElementsByTagName(v);
            }
            if (a && a.length > 0) {
                var data = [];
                for (var l = a.length, i = 0; i < l; i++) {
                    data[i] = K(a[i]);
                    if (!data[i]) return false;
                }
                var methodList = [];
                for (var ii in data[0]) {
                    /^(?:node|init|parent|sibling|child|getBytags)$/.test(ii) || methodList.push(ii);
                }
                var f = function (data) {
                    this.data = data;
                    this.len = data.length;
                    this.isKdoms = true;
                    return this;
                }
                var oo = {
                    //返回对象集合链的第几个
                    item: function (idx) {
                        if (idx < 0) {
                            idx += this.len;
                        }
                        return this.data[idx];
                    },
                    //遍历
                    each: function (fun, scope) {
                        var fdom;
                        for (var idx = 0; idx < this.len; idx++) {
                            fdom = this.data[idx];
                            fun.call(scope || fdom, idx, fdom);
                        }
                        return this;
                    }
                };
                for (var l = methodList.length, i = 0; i < l; i++) {
                    (function (m) {
                        oo[m] = function () {
                            var a = [], fdom;
                            for (var j = 0; j < this.len; j++) {
                                fdom = this.data[j];
                                a[j] = fdom[m].apply(fdom, arguments);
                            }
                            return (a.length == 0 || K.C.isstr(a[0]) || K.C.isnum(a[0])) ? a : this;
                        }
                    })(methodList[i]);
                }

                f.prototype = oo;
                var instance = new f(data);
                instance.toString = function () { return "Kdoms"; };
                return instance;
            }
            return false;
        }

        K.id = function (elem) { return document.getElementById(elem) };
        K.noConflict = function () {
            if (K.id) {
                window.K = localvar;
            }
            return _K;
        };
        K.getByTag = function (tag) {

            var obj = this.node.getElementsByTagName(tag);
            try {
                return [].slice.call(obj);
            }
            catch (e) {
                var j, i = 0, rs = [];
                while (j = obj[i])
                    rs[i++] = j
                return rs;
            }
        }


        K.Selector = (function () {

            function select() {
                throw new Error('Method "K.Selector.select" must be defined.');
            }

            function match() {
                throw new Error('Method "K.Selector.match" must be defined.');
            }

            function find(elements, expression, index) {
                index = index || 0;
                var match = K.Selector.match, length = elements.length, matchIndex = 0, i;

                for (i = 0; i < length; i++) {
                    if (match(elements[i], expression) && index == matchIndex++) {
                        return K(elements[i]);
                    }
                }
            }

            function extendElements(elements) {
                for (var i = 0, length = elements.length; i < length; i++) {
                    K(elements[i]);
                }
                return K.doms(elements);
            }

            return {
                select: select,
                match: match,
                find: find,
                extendElements: (K.extend === K) ? K : extendElements,
                extendElement: K.extend
            }

        })();
        /*Sizzle选择器*/
        K._original_property = K.Sizzle;
        /*!
        * Sizzle CSS Selector Engine
        *  Copyright 2011, The Dojo Foundation
        *  Released under the MIT, BSD, and GPL Licenses.
        *  More information: http://sizzlejs.com/
        */
        (function () {

            var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rNonWord = /\W/;

            // Here we check if the JavaScript engine is using some sort of
            // optimization where it does not always call our comparision
            // function. If that is the case, discard the hasDuplicate value.
            //   Thus far that includes Google Chrome.
            [0, 0].sort(function () {
                baseHasDuplicate = false;
                return 0;
            });

            var Sizzle = function (selector, context, results, seed) {
                results = results || [];
                context = context || document;

                var origContext = context;

                if (context.nodeType !== 1 && context.nodeType !== 9) {
                    return [];
                }

                if (!selector || typeof selector !== "string") {
                    return results;
                }

                var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML(context),
		parts = [],
		soFar = selector;

                // Reset the position of the chunker regexp (start from head)
                do {
                    chunker.exec("");
                    m = chunker.exec(soFar);

                    if (m) {
                        soFar = m[3];

                        parts.push(m[1]);

                        if (m[2]) {
                            extra = m[3];
                            break;
                        }
                    }
                } while (m);

                if (parts.length > 1 && origPOS.exec(selector)) {

                    if (parts.length === 2 && Expr.relative[parts[0]]) {
                        set = posProcess(parts[0] + parts[1], context);

                    } else {
                        set = Expr.relative[parts[0]] ?
				[context] :
				Sizzle(parts.shift(), context);

                        while (parts.length) {
                            selector = parts.shift();

                            if (Expr.relative[selector]) {
                                selector += parts.shift();
                            }

                            set = posProcess(selector, set);
                        }
                    }

                } else {
                    // Take a shortcut and set the context if the root selector is an ID
                    // (but not if it'll be faster if the inner selector is an ID)
                    if (!seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1])) {

                        ret = Sizzle.find(parts.shift(), context, contextXML);
                        context = ret.expr ?
				Sizzle.filter(ret.expr, ret.set)[0] :
				ret.set[0];
                    }

                    if (context) {
                        ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed)} :
				Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);

                        set = ret.expr ?
				Sizzle.filter(ret.expr, ret.set) :
				ret.set;

                        if (parts.length > 0) {
                            checkSet = makeArray(set);

                        } else {
                            prune = false;
                        }

                        while (parts.length) {
                            cur = parts.pop();
                            pop = cur;

                            if (!Expr.relative[cur]) {
                                cur = "";
                            } else {
                                pop = parts.pop();
                            }

                            if (pop == null) {
                                pop = context;
                            }

                            Expr.relative[cur](checkSet, pop, contextXML);
                        }

                    } else {
                        checkSet = parts = [];
                    }
                }

                if (!checkSet) {
                    checkSet = set;
                }

                if (!checkSet) {
                    Sizzle.error(cur || selector);
                }

                if (toString.call(checkSet) === "[object Array]") {
                    if (!prune) {
                        results.push.apply(results, checkSet);

                    } else if (context && context.nodeType === 1) {
                        for (i = 0; checkSet[i] != null; i++) {
                            if (checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i]))) {
                                results.push(set[i]);
                            }
                        }

                    } else {
                        for (i = 0; checkSet[i] != null; i++) {
                            if (checkSet[i] && checkSet[i].nodeType === 1) {
                                results.push(set[i]);
                            }
                        }
                    }

                } else {
                    makeArray(checkSet, results);
                }

                if (extra) {
                    Sizzle(extra, origContext, results, seed);
                    Sizzle.uniqueSort(results);
                }

                return results;
            };

            Sizzle.uniqueSort = function (results) {
                if (sortOrder) {
                    hasDuplicate = baseHasDuplicate;
                    results.sort(sortOrder);

                    if (hasDuplicate) {
                        for (var i = 1; i < results.length; i++) {
                            if (results[i] === results[i - 1]) {
                                results.splice(i--, 1);
                            }
                        }
                    }
                }

                return results;
            };

            Sizzle.matches = function (expr, set) {
                return Sizzle(expr, null, null, set);
            };

            Sizzle.matchesSelector = function (node, expr) {
                return Sizzle(expr, null, null, [node]).length > 0;
            };

            Sizzle.find = function (expr, context, isXML) {
                var set;

                if (!expr) {
                    return [];
                }

                for (var i = 0, l = Expr.order.length; i < l; i++) {
                    var match,
			type = Expr.order[i];

                    if ((match = Expr.leftMatch[type].exec(expr))) {
                        var left = match[1];
                        match.splice(1, 1);

                        if (left.substr(left.length - 1) !== "\\") {
                            match[1] = (match[1] || "").replace(rBackslash, "");
                            set = Expr.find[type](match, context, isXML);

                            if (set != null) {
                                expr = expr.replace(Expr.match[type], "");
                                break;
                            }
                        }
                    }
                }

                if (!set) {
                    set = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName("*") :
			[];
                }

                return { set: set, expr: expr };
            };

            Sizzle.filter = function (expr, set, inplace, not) {
                var match, anyFound,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);

                while (expr && set.length) {
                    for (var type in Expr.filter) {
                        if ((match = Expr.leftMatch[type].exec(expr)) != null && match[2]) {
                            var found, item,
					filter = Expr.filter[type],
					left = match[1];

                            anyFound = false;

                            match.splice(1, 1);

                            if (left.substr(left.length - 1) === "\\") {
                                continue;
                            }

                            if (curLoop === result) {
                                result = [];
                            }

                            if (Expr.preFilter[type]) {
                                match = Expr.preFilter[type](match, curLoop, inplace, result, not, isXMLFilter);

                                if (!match) {
                                    anyFound = found = true;

                                } else if (match === true) {
                                    continue;
                                }
                            }

                            if (match) {
                                for (var i = 0; (item = curLoop[i]) != null; i++) {
                                    if (item) {
                                        found = filter(item, match, i, curLoop);
                                        var pass = not ^ !!found;

                                        if (inplace && found != null) {
                                            if (pass) {
                                                anyFound = true;

                                            } else {
                                                curLoop[i] = false;
                                            }

                                        } else if (pass) {
                                            result.push(item);
                                            anyFound = true;
                                        }
                                    }
                                }
                            }

                            if (found !== undefined) {
                                if (!inplace) {
                                    curLoop = result;
                                }

                                expr = expr.replace(Expr.match[type], "");

                                if (!anyFound) {
                                    return [];
                                }

                                break;
                            }
                        }
                    }

                    // Improper expression
                    if (expr === old) {
                        if (anyFound == null) {
                            Sizzle.error(expr);

                        } else {
                            break;
                        }
                    }

                    old = expr;
                }

                return curLoop;
            };

            Sizzle.error = function (msg) {
                throw "Syntax error, unrecognized expression: " + msg;
            };

            var Expr = Sizzle.selectors = {
                order: ["ID", "NAME", "TAG"],

                match: {
                    ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                    CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                    NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
                    ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
                    TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
                    CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
                    POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
                    PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
                },

                leftMatch: {},

                attrMap: {
                    "class": "className",
                    "for": "htmlFor"
                },

                attrHandle: {
                    href: function (elem) {
                        return elem.getAttribute("href");
                    },
                    type: function (elem) {
                        return elem.getAttribute("type");
                    }
                },

                relative: {
                    "+": function (checkSet, part) {
                        var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test(part),
				isPartStrNotTag = isPartStr && !isTag;

                        if (isTag) {
                            part = part.toLowerCase();
                        }

                        for (var i = 0, l = checkSet.length, elem; i < l; i++) {
                            if ((elem = checkSet[i])) {
                                while ((elem = elem.previousSibling) && elem.nodeType !== 1) { }

                                checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
                            }
                        }

                        if (isPartStrNotTag) {
                            Sizzle.filter(part, checkSet, true);
                        }
                    },

                    ">": function (checkSet, part) {
                        var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

                        if (isPartStr && !rNonWord.test(part)) {
                            part = part.toLowerCase();

                            for (; i < l; i++) {
                                elem = checkSet[i];

                                if (elem) {
                                    var parent = elem.parentNode;
                                    checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
                                }
                            }

                        } else {
                            for (; i < l; i++) {
                                elem = checkSet[i];

                                if (elem) {
                                    checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
                                }
                            }

                            if (isPartStr) {
                                Sizzle.filter(part, checkSet, true);
                            }
                        }
                    },

                    "": function (checkSet, part, isXML) {
                        var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

                        if (typeof part === "string" && !rNonWord.test(part)) {
                            part = part.toLowerCase();
                            nodeCheck = part;
                            checkFn = dirNodeCheck;
                        }

                        checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
                    },

                    "~": function (checkSet, part, isXML) {
                        var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

                        if (typeof part === "string" && !rNonWord.test(part)) {
                            part = part.toLowerCase();
                            nodeCheck = part;
                            checkFn = dirNodeCheck;
                        }

                        checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
                    }
                },

                find: {
                    ID: function (match, context, isXML) {
                        if (typeof context.getElementById !== "undefined" && !isXML) {
                            var m = context.getElementById(match[1]);
                            // Check parentNode to catch when Blackberry 4.6 returns
                            // nodes that are no longer in the document #6963
                            return m && m.parentNode ? [m] : [];
                        }
                    },

                    NAME: function (match, context) {
                        if (typeof context.getElementsByName !== "undefined") {
                            var ret = [],
					results = context.getElementsByName(match[1]);

                            for (var i = 0, l = results.length; i < l; i++) {
                                if (results[i].getAttribute("name") === match[1]) {
                                    ret.push(results[i]);
                                }
                            }

                            return ret.length === 0 ? null : ret;
                        }
                    },

                    TAG: function (match, context) {
                        if (typeof context.getElementsByTagName !== "undefined") {
                            return context.getElementsByTagName(match[1]);
                        }
                    }
                },
                preFilter: {
                    CLASS: function (match, curLoop, inplace, result, not, isXML) {
                        match = " " + match[1].replace(rBackslash, "") + " ";

                        if (isXML) {
                            return match;
                        }

                        for (var i = 0, elem; (elem = curLoop[i]) != null; i++) {
                            if (elem) {
                                if (not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0)) {
                                    if (!inplace) {
                                        result.push(elem);
                                    }

                                } else if (inplace) {
                                    curLoop[i] = false;
                                }
                            }
                        }

                        return false;
                    },

                    ID: function (match) {
                        return match[1].replace(rBackslash, "");
                    },

                    TAG: function (match, curLoop) {
                        return match[1].replace(rBackslash, "").toLowerCase();
                    },

                    CHILD: function (match) {
                        if (match[1] === "nth") {
                            if (!match[2]) {
                                Sizzle.error(match[0]);
                            }

                            match[2] = match[2].replace(/^\+|\s*/g, '');

                            // parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
                            var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test(match[2]) && "0n+" + match[2] || match[2]);

                            // calculate the numbers (first)n+(last) including if they are negative
                            match[2] = (test[1] + (test[2] || 1)) - 0;
                            match[3] = test[3] - 0;
                        }
                        else if (match[2]) {
                            Sizzle.error(match[0]);
                        }

                        // TODO: Move to normal caching system
                        match[0] = done++;

                        return match;
                    },

                    ATTR: function (match, curLoop, inplace, result, not, isXML) {
                        var name = match[1] = match[1].replace(rBackslash, "");

                        if (!isXML && Expr.attrMap[name]) {
                            match[1] = Expr.attrMap[name];
                        }

                        // Handle if an un-quoted value was used
                        match[4] = (match[4] || match[5] || "").replace(rBackslash, "");

                        if (match[2] === "~=") {
                            match[4] = " " + match[4] + " ";
                        }

                        return match;
                    },

                    PSEUDO: function (match, curLoop, inplace, result, not) {
                        if (match[1] === "not") {
                            // If we're dealing with a complex expression, or a simple one
                            if ((chunker.exec(match[3]) || "").length > 1 || /^\w/.test(match[3])) {
                                match[3] = Sizzle(match[3], null, null, curLoop);

                            } else {
                                var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

                                if (!inplace) {
                                    result.push.apply(result, ret);
                                }

                                return false;
                            }

                        } else if (Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0])) {
                            return true;
                        }

                        return match;
                    },

                    POS: function (match) {
                        match.unshift(true);

                        return match;
                    }
                },

                filters: {
                    enabled: function (elem) {
                        return elem.disabled === false && elem.type !== "hidden";
                    },

                    disabled: function (elem) {
                        return elem.disabled === true;
                    },

                    checked: function (elem) {
                        return elem.checked === true;
                    },

                    selected: function (elem) {
                        // Accessing this property makes selected-by-default
                        // options in Safari work properly
                        if (elem.parentNode) {
                            elem.parentNode.selectedIndex;
                        }

                        return elem.selected === true;
                    },

                    parent: function (elem) {
                        return !!elem.firstChild;
                    },

                    empty: function (elem) {
                        return !elem.firstChild;
                    },

                    has: function (elem, i, match) {
                        return !!Sizzle(match[3], elem).length;
                    },

                    header: function (elem) {
                        return (/h\d/i).test(elem.nodeName);
                    },

                    text: function (elem) {
                        var attr = elem.getAttribute("type"), type = elem.type;
                        // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
                        // use getAttribute instead to test this case
                        return elem.nodeName.toLowerCase() === "input" && "text" === type && (attr === type || attr === null);
                    },

                    radio: function (elem) {
                        return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
                    },

                    checkbox: function (elem) {
                        return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
                    },

                    file: function (elem) {
                        return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
                    },

                    password: function (elem) {
                        return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
                    },

                    submit: function (elem) {
                        var name = elem.nodeName.toLowerCase();
                        return (name === "input" || name === "button") && "submit" === elem.type;
                    },

                    image: function (elem) {
                        return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
                    },

                    reset: function (elem) {
                        var name = elem.nodeName.toLowerCase();
                        return (name === "input" || name === "button") && "reset" === elem.type;
                    },

                    button: function (elem) {
                        var name = elem.nodeName.toLowerCase();
                        return name === "input" && "button" === elem.type || name === "button";
                    },

                    input: function (elem) {
                        return (/input|select|textarea|button/i).test(elem.nodeName);
                    },

                    focus: function (elem) {
                        return elem === elem.ownerDocument.activeElement;
                    }
                },
                setFilters: {
                    first: function (elem, i) {
                        return i === 0;
                    },

                    last: function (elem, i, match, array) {
                        return i === array.length - 1;
                    },

                    even: function (elem, i) {
                        return i % 2 === 0;
                    },

                    odd: function (elem, i) {
                        return i % 2 === 1;
                    },

                    lt: function (elem, i, match) {
                        return i < match[3] - 0;
                    },

                    gt: function (elem, i, match) {
                        return i > match[3] - 0;
                    },

                    nth: function (elem, i, match) {
                        return match[3] - 0 === i;
                    },

                    eq: function (elem, i, match) {
                        return match[3] - 0 === i;
                    }
                },
                filter: {
                    PSEUDO: function (elem, match, i, array) {
                        var name = match[1],
				filter = Expr.filters[name];

                        if (filter) {
                            return filter(elem, i, match, array);

                        } else if (name === "contains") {
                            return (elem.textContent || elem.innerText || Sizzle.getText([elem]) || "").indexOf(match[3]) >= 0;

                        } else if (name === "not") {
                            var not = match[3];

                            for (var j = 0, l = not.length; j < l; j++) {
                                if (not[j] === elem) {
                                    return false;
                                }
                            }

                            return true;

                        } else {
                            Sizzle.error(name);
                        }
                    },

                    CHILD: function (elem, match) {
                        var type = match[1],
				node = elem;

                        switch (type) {
                            case "only":
                            case "first":
                                while ((node = node.previousSibling)) {
                                    if (node.nodeType === 1) {
                                        return false;
                                    }
                                }

                                if (type === "first") {
                                    return true;
                                }

                                node = elem;

                            case "last":
                                while ((node = node.nextSibling)) {
                                    if (node.nodeType === 1) {
                                        return false;
                                    }
                                }

                                return true;

                            case "nth":
                                var first = match[2],
						last = match[3];

                                if (first === 1 && last === 0) {
                                    return true;
                                }

                                var doneName = match[0],
						parent = elem.parentNode;

                                if (parent && (parent.sizcache !== doneName || !elem.nodeIndex)) {
                                    var count = 0;

                                    for (node = parent.firstChild; node; node = node.nextSibling) {
                                        if (node.nodeType === 1) {
                                            node.nodeIndex = ++count;
                                        }
                                    }

                                    parent.sizcache = doneName;
                                }

                                var diff = elem.nodeIndex - last;

                                if (first === 0) {
                                    return diff === 0;

                                } else {
                                    return (diff % first === 0 && diff / first >= 0);
                                }
                        }
                    },

                    ID: function (elem, match) {
                        return elem.nodeType === 1 && elem.getAttribute("id") === match;
                    },

                    TAG: function (elem, match) {
                        return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
                    },

                    CLASS: function (elem, match) {
                        return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf(match) > -1;
                    },

                    ATTR: function (elem, match) {
                        var name = match[1],
				result = Expr.attrHandle[name] ?
					Expr.attrHandle[name](elem) :
					elem[name] != null ?
						elem[name] :
						elem.getAttribute(name),
				value = result + "",
				type = match[2],
				check = match[4];

                        return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
                    },

                    POS: function (elem, match, i, array) {
                        var name = match[2],
				filter = Expr.setFilters[name];

                        if (filter) {
                            return filter(elem, i, match, array);
                        }
                    }
                }
            };

            var origPOS = Expr.match.POS,
	fescape = function (all, num) {
	    return "\\" + (num - 0 + 1);
	};

            for (var type in Expr.match) {
                Expr.match[type] = new RegExp(Expr.match[type].source + (/(?![^\[]*\])(?![^\(]*\))/.source));
                Expr.leftMatch[type] = new RegExp(/(^(?:.|\r|\n)*?)/.source + Expr.match[type].source.replace(/\\(\d+)/g, fescape));
            }

            var makeArray = function (array, results) {
                array = Array.prototype.slice.call(array, 0);

                if (results) {
                    results.push.apply(results, array);
                    return results;
                }

                return array;
            };

            // Perform a simple check to determine if the browser is capable of
            // converting a NodeList to an array using builtin methods.
            // Also verifies that the returned array holds DOM nodes
            // (which is not the case in the Blackberry browser)
            try {
                Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType;

                // Provide a fallback method if it does not work
            } catch (e) {
                makeArray = function (array, results) {
                    var i = 0,
			ret = results || [];

                    if (toString.call(array) === "[object Array]") {
                        Array.prototype.push.apply(ret, array);

                    } else {
                        if (typeof array.length === "number") {
                            for (var l = array.length; i < l; i++) {
                                ret.push(array[i]);
                            }

                        } else {
                            for (; array[i]; i++) {
                                ret.push(array[i]);
                            }
                        }
                    }

                    return ret;
                };
            }

            var sortOrder, siblingCheck;

            if (document.documentElement.compareDocumentPosition) {
                sortOrder = function (a, b) {
                    if (a === b) {
                        hasDuplicate = true;
                        return 0;
                    }

                    if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                        return a.compareDocumentPosition ? -1 : 1;
                    }

                    return a.compareDocumentPosition(b) & 4 ? -1 : 1;
                };

            } else {
                sortOrder = function (a, b) {
                    // The nodes are identical, we can exit early
                    if (a === b) {
                        hasDuplicate = true;
                        return 0;

                        // Fallback to using sourceIndex (in IE) if it's available on both nodes
                    } else if (a.sourceIndex && b.sourceIndex) {
                        return a.sourceIndex - b.sourceIndex;
                    }

                    var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

                    // If the nodes are siblings (or identical) we can do a quick check
                    if (aup === bup) {
                        return siblingCheck(a, b);

                        // If no parents were found then the nodes are disconnected
                    } else if (!aup) {
                        return -1;

                    } else if (!bup) {
                        return 1;
                    }

                    // Otherwise they're somewhere else in the tree so we need
                    // to build up a full list of the parentNodes for comparison
                    while (cur) {
                        ap.unshift(cur);
                        cur = cur.parentNode;
                    }

                    cur = bup;

                    while (cur) {
                        bp.unshift(cur);
                        cur = cur.parentNode;
                    }

                    al = ap.length;
                    bl = bp.length;

                    // Start walking down the tree looking for a discrepancy
                    for (var i = 0; i < al && i < bl; i++) {
                        if (ap[i] !== bp[i]) {
                            return siblingCheck(ap[i], bp[i]);
                        }
                    }

                    // We ended someplace up the tree so do a sibling check
                    return i === al ?
			siblingCheck(a, bp[i], -1) :
			siblingCheck(ap[i], b, 1);
                };

                siblingCheck = function (a, b, ret) {
                    if (a === b) {
                        return ret;
                    }

                    var cur = a.nextSibling;

                    while (cur) {
                        if (cur === b) {
                            return -1;
                        }

                        cur = cur.nextSibling;
                    }

                    return 1;
                };
            }

            // Utility function for retreiving the text value of an array of DOM nodes
            Sizzle.getText = function (elems) {
                var ret = "", elem;

                for (var i = 0; elems[i]; i++) {
                    elem = elems[i];

                    // Get the text from text nodes and CDATA nodes
                    if (elem.nodeType === 3 || elem.nodeType === 4) {
                        ret += elem.nodeValue;

                        // Traverse everything else, except comment nodes
                    } else if (elem.nodeType !== 8) {
                        ret += Sizzle.getText(elem.childNodes);
                    }
                }

                return ret;
            };

            // Check to see if the browser returns elements by name when
            // querying by getElementById (and provide a workaround)
            (function () {
                // We're going to inject a fake input element with a specified name
                var form = document.createElement("div"),
		id = "script" + (new Date()).getTime(),
		root = document.documentElement;

                form.innerHTML = "<a name='" + id + "'/>";

                // Inject it into the root element, check its status, and remove it quickly
                root.insertBefore(form, root.firstChild);

                // The workaround has to do additional checks after a getElementById
                // Which slows things down for other browsers (hence the branching)
                if (document.getElementById(id)) {
                    Expr.find.ID = function (match, context, isXML) {
                        if (typeof context.getElementById !== "undefined" && !isXML) {
                            var m = context.getElementById(match[1]);

                            return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
                        }
                    };

                    Expr.filter.ID = function (elem, match) {
                        var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

                        return elem.nodeType === 1 && node && node.nodeValue === match;
                    };
                }

                root.removeChild(form);

                // release memory in IE
                root = form = null;
            })();

            (function () {
                // Check to see if the browser returns only elements
                // when doing getElementsByTagName("*")

                // Create a fake element
                var div = document.createElement("div");
                div.appendChild(document.createComment(""));

                // Make sure no comments are found
                if (div.getElementsByTagName("*").length > 0) {
                    Expr.find.TAG = function (match, context) {
                        var results = context.getElementsByTagName(match[1]);

                        // Filter out possible comments
                        if (match[1] === "*") {
                            var tmp = [];

                            for (var i = 0; results[i]; i++) {
                                if (results[i].nodeType === 1) {
                                    tmp.push(results[i]);
                                }
                            }

                            results = tmp;
                        }

                        return results;
                    };
                }

                // Check to see if an attribute returns normalized href attributes
                div.innerHTML = "<a href='#'></a>";

                if (div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#") {

                    Expr.attrHandle.href = function (elem) {
                        return elem.getAttribute("href", 2);
                    };
                }

                // release memory in IE
                div = null;
            })();

            if (document.querySelectorAll) {
                (function () {
                    var oldSizzle = Sizzle,
			div = document.createElement("div"),
			id = "__sizzle__";

                    div.innerHTML = "<p class='TEST'></p>";

                    // Safari can't handle uppercase or unicode characters when
                    // in quirks mode.
                    if (div.querySelectorAll && div.querySelectorAll(".TEST").length === 0) {
                        return;
                    }

                    Sizzle = function (query, context, extra, seed) {
                        context = context || document;

                        // Only use querySelectorAll on non-XML documents
                        // (ID selectors don't work in non-HTML documents)
                        if (!seed && !Sizzle.isXML(context)) {
                            // See if we find a selector to speed up
                            var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(query);

                            if (match && (context.nodeType === 1 || context.nodeType === 9)) {
                                // Speed-up: Sizzle("TAG")
                                if (match[1]) {
                                    return makeArray(context.getElementsByTagName(query), extra);

                                    // Speed-up: Sizzle(".CLASS")
                                } else if (match[2] && Expr.find.CLASS && context.getElementsByClassName) {
                                    return makeArray(context.getElementsByClassName(match[2]), extra);
                                }
                            }

                            if (context.nodeType === 9) {
                                // Speed-up: Sizzle("body")
                                // The body element only exists once, optimize finding it
                                if (query === "body" && context.body) {
                                    return makeArray([context.body], extra);

                                    // Speed-up: Sizzle("#ID")
                                } else if (match && match[3]) {
                                    var elem = context.getElementById(match[3]);

                                    // Check parentNode to catch when Blackberry 4.6 returns
                                    // nodes that are no longer in the document #6963
                                    if (elem && elem.parentNode) {
                                        // Handle the case where IE and Opera return items
                                        // by name instead of ID
                                        if (elem.id === match[3]) {
                                            return makeArray([elem], extra);
                                        }

                                    } else {
                                        return makeArray([], extra);
                                    }
                                }

                                try {
                                    return makeArray(context.querySelectorAll(query), extra);
                                } catch (qsaError) { }

                                // qSA works strangely on Element-rooted queries
                                // We can work around this by specifying an extra ID on the root
                                // and working up from there (Thanks to Andrew Dupont for the technique)
                                // IE 8 doesn't work on object elements
                            } else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
                                var oldContext = context,
						old = context.getAttribute("id"),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test(query);

                                if (!old) {
                                    context.setAttribute("id", nid);
                                } else {
                                    nid = nid.replace(/'/g, "\\$&");
                                }
                                if (relativeHierarchySelector && hasParent) {
                                    context = context.parentNode;
                                }

                                try {
                                    if (!relativeHierarchySelector || hasParent) {
                                        return makeArray(context.querySelectorAll("[id='" + nid + "'] " + query), extra);
                                    }

                                } catch (pseudoError) {
                                } finally {
                                    if (!old) {
                                        oldContext.removeAttribute("id");
                                    }
                                }
                            }
                        }

                        return oldSizzle(query, context, extra, seed);
                    };

                    for (var prop in oldSizzle) {
                        Sizzle[prop] = oldSizzle[prop];
                    }

                    // release memory in IE
                    div = null;
                })();
            }

            (function () {
                var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

                if (matches) {
                    // Check to see if it's possible to do matchesSelector
                    // on a disconnected node (IE 9 fails this)
                    var disconnectedMatch = !matches.call(document.createElement("div"), "div"),
			pseudoWorks = false;

                    try {
                        // This should fail with an exception
                        // Gecko does not error, returns false instead
                        matches.call(document.documentElement, "[test!='']:sizzle");

                    } catch (pseudoError) {
                        pseudoWorks = true;
                    }

                    Sizzle.matchesSelector = function (node, expr) {
                        // Make sure that attribute selectors are quoted
                        expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

                        if (!Sizzle.isXML(node)) {
                            try {
                                if (pseudoWorks || !Expr.match.PSEUDO.test(expr) && !/!=/.test(expr)) {
                                    var ret = matches.call(node, expr);

                                    // IE 9's matchesSelector returns false on disconnected nodes
                                    if (ret || !disconnectedMatch ||
                                    // As well, disconnected nodes are said to be in a document
                                    // fragment in IE 9, so check for that
								node.document && node.document.nodeType !== 11) {
                                        return ret;
                                    }
                                }
                            } catch (e) { }
                        }

                        return Sizzle(expr, null, null, [node]).length > 0;
                    };
                }
            })();

            (function () {
                var div = document.createElement("div");

                div.innerHTML = "<div class='test e'></div><div class='test'></div>";

                // Opera can't find a second classname (in 9.6)
                // Also, make sure that getElementsByClassName actually exists
                if (!div.getElementsByClassName || div.getElementsByClassName("e").length === 0) {
                    return;
                }

                // Safari caches class attributes, doesn't catch changes (in 3.2)
                div.lastChild.className = "e";

                if (div.getElementsByClassName("e").length === 1) {
                    return;
                }

                Expr.order.splice(1, 0, "CLASS");
                Expr.find.CLASS = function (match, context, isXML) {
                    if (typeof context.getElementsByClassName !== "undefined" && !isXML) {
                        return context.getElementsByClassName(match[1]);
                    }
                };

                // release memory in IE
                div = null;
            })();

            function dirNodeCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
                for (var i = 0, l = checkSet.length; i < l; i++) {
                    var elem = checkSet[i];

                    if (elem) {
                        var match = false;

                        elem = elem[dir];

                        while (elem) {
                            if (elem.sizcache === doneName) {
                                match = checkSet[elem.sizset];
                                break;
                            }

                            if (elem.nodeType === 1 && !isXML) {
                                elem.sizcache = doneName;
                                elem.sizset = i;
                            }

                            if (elem.nodeName.toLowerCase() === cur) {
                                match = elem;
                                break;
                            }

                            elem = elem[dir];
                        }

                        checkSet[i] = match;
                    }
                }
            }

            function dirCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
                for (var i = 0, l = checkSet.length; i < l; i++) {
                    var elem = checkSet[i];

                    if (elem) {
                        var match = false;

                        elem = elem[dir];

                        while (elem) {
                            if (elem.sizcache === doneName) {
                                match = checkSet[elem.sizset];
                                break;
                            }

                            if (elem.nodeType === 1) {
                                if (!isXML) {
                                    elem.sizcache = doneName;
                                    elem.sizset = i;
                                }

                                if (typeof cur !== "string") {
                                    if (elem === cur) {
                                        match = true;
                                        break;
                                    }

                                } else if (Sizzle.filter(cur, [elem]).length > 0) {
                                    match = elem;
                                    break;
                                }
                            }

                            elem = elem[dir];
                        }

                        checkSet[i] = match;
                    }
                }
            }

            if (document.documentElement.contains) {
                Sizzle.contains = function (a, b) {
                    return a !== b && (a.contains ? a.contains(b) : true);
                };

            } else if (document.documentElement.compareDocumentPosition) {
                Sizzle.contains = function (a, b) {
                    return !!(a.compareDocumentPosition(b) & 16);
                };

            } else {
                Sizzle.contains = function () {
                    return false;
                };
            }

            Sizzle.isXML = function (elem) {
                // documentElement is verified for cases where it doesn't yet exist
                // (such as loading iframes in IE - #4833) 
                var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

                return documentElement ? documentElement.nodeName !== "HTML" : false;
            };

            var posProcess = function (selector, context) {
                var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

                // Position selectors must be done after the filter
                // And so must :not(positional) so we move all PSEUDOs to the end
                while ((match = Expr.match.PSEUDO.exec(selector))) {
                    later += match[0];
                    selector = selector.replace(Expr.match.PSEUDO, "");
                }

                selector = Expr.relative[selector] ? selector + "*" : selector;

                for (var i = 0, l = root.length; i < l; i++) {
                    Sizzle(selector, root[i], tmpSet);
                }

                return Sizzle.filter(later, tmpSet);
            };

            // EXPOSE
            window.Sizzle = Sizzle;
        })();
        ; (function (engine) {
            var extendElements = K.Selector.extendElements;
            function select(selector, scope) {
                return extendElements(engine(selector, scope || document));
            }
            function match(element, selector) {
                return engine.matches(selector, [element]).length == 1;
            }
            K.Selector.engine = engine;
            K.Selector.select = select;
            K.Selector.match = match;
        })(Sizzle);
        K.Sizzle = K._original_property;
        delete K._original_property;

    })();


    /*
    core
    提供核心
    依赖: 无
    提供：[Type,Kimplement,Hash]

    */

    (function () {

        // typeOf, instanceOf


        var typeOf = K.typeOf = function (item) {
            if (item == null) return 'null';
            if (typeof item)
                if (item.Kfamily) return item.Kfamily();

            if (item.nodeName) {
                if (item.nodeType == 1) return 'element';
                if (item.nodeType == 3) return (/\S/).test(item.nodeValue) ? 'textnode' : 'whitespace';
            } else if (typeof item.length == 'number') {
                if (item.callee) return 'arguments';
                if ('item' in item) return 'collection';
            }

            return typeof item;
        };

        var instanceOf = K.instanceOf = function (item, object) {
            if (item == null) return false;
            var constructor = item.$constructor || item.constructor;
            while (constructor) {
                if (constructor === object) return true;
                constructor = constructor.parent;
            }
            return item instanceof object;
        };

        // Function overloading

        var Function = this.Function;

        var enumerables = true;
        for (var i in { toString: 1 }) enumerables = null;
        if (enumerables) enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'];

        Function.prototype.KoverloadSetter = function (usePlural) {
            var self = this;
            return function (a, b) {
                if (a == null) return this;
                if (usePlural || typeof a != 'string') {

                    for (var k in a) self.call(this, k, a[k]);

                    if (enumerables) for (var i = enumerables.length; i--; ) {
                        k = enumerables[i];
                        if (a.hasOwnProperty(k)) self.call(this, k, a[k]);
                    }
                } else {
                    self.call(this, a, b);
                }
                return this;
            };
        };

        Function.prototype.KoverloadGetter = function (usePlural) {
            var self = this;
            return function (a) {
                var args, result;
                if (usePlural || typeof a != 'string') args = a;
                else if (arguments.length > 1) args = arguments;
                if (args) {
                    result = {};
                    for (var i = 0; i < args.length; i++) result[args[i]] = self.call(this, args[i]);
                } else {
                    result = self.call(this, a);
                }
                return result;
            };
        };

        Function.prototype.Kextend = function (key, value) {
            this[key] = value;
        } .KoverloadSetter();

        Function.prototype.Kimplement = function (key, value) {
            this.prototype[key] = value;
        } .KoverloadSetter();

        Function.from = function (item) {
            return (typeOf(item) == 'function') ? item : function () {
                return item;
            };
        };

        // From

        var slice = Array.prototype.slice;


        Function.Kimplement({

            Khide: function () {
                this.$hidden = true;
                return this;
            },

            Kprotect: function () {
                this.$protected = true;
                return this;
            }

        });

        // Type

        var KType = K.Type = function (name, object) {
            if (name) {
                var lower = name.toLowerCase();
                var typeCheck = function (item) {
                    return (typeOf(item) == lower);
                };

                KType['is' + name] = typeCheck;
                if (object != null) {
                    object.prototype.Kfamily = (function () {
                        return lower;
                    }).Khide();
                    //<1.2compat>
                    object.type = typeCheck;
                    //</1.2compat>
                }
            }

            if (object == null) return null;

            object.Kextend(this);
            object.$constructor = KType;
            object.prototype.$constructor = object;

            return object;
        };

        var toString = Object.prototype.toString;

        KType.isEnumerable = function (item) {
            return (item != null && typeof item.length == 'number' && toString.call(item) != '[object Function]');
        };

        var hooks = {};

        var hooksOf = function (object) {
            var type = typeOf(object.prototype);
            return hooks[type] || (hooks[type] = []);
        };

        var Kimplement = function (name, method) {

            if (method && method.$hidden) return;

            var hooks = hooksOf(this);

            for (var i = 0; i < hooks.length; i++) {
                var hook = hooks[i];
                if (typeOf(hook) == 'type') Kimplement.call(hook, name, method);
                else hook.call(this, name, method);
            }

            var previous = this.prototype[name];
            if (previous == null || !previous.$protected) this.prototype[name] = method;

            if (this[name] == null && typeOf(method) == 'function') extend.call(this, name, function (item) {
                return method.apply(item, slice.call(arguments, 1));
            });
        };

        var extend = function (name, method) {
            if (method && method.$hidden) return;
            var previous = this[name];
            if (previous == null || !previous.$protected) this[name] = method;
        };

        KType.Kimplement({

            Kimplement: Kimplement.KoverloadSetter(),

            extend: extend.KoverloadSetter(),

            alias: function (name, existing) {
                Kimplement.call(this, name, this.prototype[existing]);
            } .KoverloadSetter(),

            mirror: function (hook) {
                hooksOf(this).push(hook);
                return this;
            }

        });

        new KType('KType', KType);

        RegExp.prototype.Kfamily = function () {
            return "regexp";
        }
        Date.prototype.Kfamily = function () {
            return "date";
        }

    })();



    /*
    Class:
    提供创建对象的功能
    依赖：Function.prototype [Kbind, Kwrap,arguments]
    提供：[create, addEvent, Ksuper]
    */

    var KClass = this.KClass=K.fn = (function () {
        var IS_DONTENUM_BUGGY = (function () {
            for (var p in { toString: 1 }) {
                if (p === 'toString') return false;
            }
            return true;
        })();

        function subclass() { };
        function create() {
            var parent = null, properties = KA(arguments);
            if (K.C.isFunction(properties[0]))
                parent = properties.shift();

            function klass() {
				this.init.apply(this, arguments);
			}

            klass.prototype.Kfamily = function () {
                return "KClass";
            }

            K.C.Kextend(klass, KClass.Methods);
            klass.superclass = parent;
            klass.subclasses = [];

            if (parent) {
                subclass.prototype = parent.prototype;
                klass.prototype = new subclass;
                parent.subclasses.push(klass);
            }

            for (var i = 0, length = properties.length; i < length; i++)
                klass.addMethods(properties[i]);
				
			
            if (!klass.prototype.init)
                klass.prototype.init = function () { };
				
            klass.prototype.constructor = klass;
            return klass;
        }

        function addMethods(source) {
            var ancestor = this.superclass && this.superclass.prototype,
        properties = K.C.keys(source);

            if (IS_DONTENUM_BUGGY) {
                if (source.toString != Object.prototype.toString)
                    properties.push("toString");
                if (source.valueOf != Object.prototype.valueOf)
                    properties.push("valueOf");
            }

            for (var i = 0, length = properties.length; i < length; i++) {
                var property = properties[i], value = source[property];
                if (ancestor && K.C.isFunction(value) &&
          value.KargumentNames()[0] == "Ksuper") {
                    var method = value;
                    value = (function (m) {
                        return function () { return ancestor[m].apply(this, arguments); };
                    })(property).Kwrap(method);

                    value.valueOf = method.valueOf.Kbind(method);
                    value.toString = method.toString.Kbind(method);
                }
                this.prototype[property] = value;
            }

            return this;
        }

        return {
            create: create,
            Methods: {
                addMethods: addMethods
            }
        };
    })();


    /*
    K.C,K.O:
    提供检测对象的功能，对象操作的功能
    依赖：无
    提供：K.C

    */

    (function () {
        K.C = K.O = {};
        var _toString = Object.prototype.toString,
              NULL_TYPE = 'Null',
              UNDEFINED_TYPE = 'Undefined',
              BOOLEAN_TYPE = 'Boolean',
              NUMBER_TYPE = 'Number',
              STRING_TYPE = 'String',
              OBJECT_TYPE = 'Object',
              FUNCTION_CLASS = '[object Function]',
              BOOLEAN_CLASS = '[object Boolean]',
              NUMBER_CLASS = '[object Number]',
              STRING_CLASS = '[object String]',
              ARRAY_CLASS = '[object Array]',
              DATE_CLASS = '[object Date]';
        function isObj(v, flag) {
            var isObj = typeof (v) == "object" && v != null;
            //判断是否空对象
            if (isObj && isset(flag)) {
                for (var name in obj) {
                    return !!flag;
                }
            }
            return isObj;
        }

        //是否存在      
        function isset(v) {
            return v !== undefined;
        }

        //是否不存在
        function unset(v) {
            return v === undefined;
        }

        //判断数据是否为节点对象
        function isnode(v) {
            return isObj(v) && v.nodeType === 1 && !!v.nodeName;
        };

        //判断变量是否为DOM对象
        function isDom(v) {
            return isnode(v) || v == _win || v == _doc;
        };

        //判断数据是否为Fdom对象
        function isKdom(v) {
            return isObj(v) && v.isKdom === true;
        };


        //判断数据是否为Fdoms对象
        function isKdoms(v) {
            return isObj(v) && v.isKdoms === true;
        };

        //判断数据是否为非空集合
        function iscollect(v) {
            return isObj(v) && isset(v.length);
        };

        //判断数据是否为非空集合
        function isDoms(v) {
            return isObj(v) && isset(v.length) && v.length > 0 && isnode(v[0]);
        };

        function node(v) {
            return isDom(v) ? v : isString(v) ? (_doc.getElementById(v) || _doc.getElementsByName(v)[0]) : null;
        };

        function clone(object) {
            return Kextend({}, object);
        }
        function isElement(object) {
            return !!(object && object.nodeType == 1);
        }
        function isArray(object) {
            return _toString.call(object) === ARRAY_CLASS;
        }
        function isFunction(object) { //isfun
            return _toString.call(object) === FUNCTION_CLASS;
        }
        function isString(object) {//isstr
            return _toString.call(object) === STRING_CLASS;
        }
        function toHTML(object) {
            return object && object.toHTML ? object.toHTML() : K.S.interpret(object);
        }
        function isNumber(object) { //isnum
            return _toString.call(object) === NUMBER_CLASS;
        }

        function isDate(object) {
            return _toString.call(object) === DATE_CLASS;
        }

        function isUndefined(object) {
            return typeof object === "undefined";
        }

        function isHash(object) {
            return object instanceof Hash;
        }
        /*
        K(window).bind('load', function () {
        console.log(K.O.keys({ name: 'Prototype', version: 1.5 }));
        })            
        */
        function keys(object) {
            if (_Type(object) !== OBJECT_TYPE) { throw new TypeError(); }
            var results = [];
            for (var property in object) {
                if (object.hasOwnProperty(property)) {
                    results.push(property);
                }
            }
            return results;
        }
        function keyOf(object, value) {
            for (var key in object) {
                if (hasOwnProperty.call(object, key) && object[key] === value) return key;
            }
            return null;
        }

        function _Type(o) {
            switch (o) {
                case null: return NULL_TYPE;
                case (void 0): return UNDEFINED_TYPE;
            }
            var type = typeof o;
            switch (type) {
                case 'boolean': return BOOLEAN_TYPE;
                case 'number': return NUMBER_TYPE;
                case 'string': return STRING_TYPE;
            }
            return OBJECT_TYPE;
        }

        function inspect(object) {
            try {
                if (isUndefined(object)) return 'undefined';
                if (object === null) return 'null';
                return object.inspect ? object.inspect() : String(object);
            } catch (e) {
                if (e instanceof RangeError) return "error";
                throw e
            }
        }
        /*
        K.O.Kextend(d1, {
        ca2:'en3'

        })           
        */
        function Kextend(destination, source) {
            for (var property in source)
                destination[property] = source[property];
            return destination;
        }

        function lambda(fn) {
            return isString(fn) ? new Function("a", "b", "c", "return " + fn) : fn;
        }
        Kextend(K.C, {
            _Type: _Type,
            isObj: isObj,
            isset: isset,
            unset: unset,
            isnode: isnode,
            isDom: isDom,
            isKdom: isKdom,
            isKdoms: isKdoms,
            iscollect: iscollect,
            isDoms: isDoms,
            node: node,
            Kextend: Kextend,
            clone: clone,
            toHTML: toHTML,
            inspect: inspect,
            isElement: isElement,
            isArray: isArray,
            isarr: isArray,
            isHash: isHash,
            isFunction: isFunction,
            isfun: isFunction,
            isString: isString,
            isstr: isString,
            isNumber: isNumber,
            isnum: isNumber,
            isDate: isDate,
            keys: keys,
            keyOf: keyOf,
            isUndefined: isUndefined,
			lambda:lambda
        })
    })();

    /*
    Function.prototype:
    提供函数扩展
    依赖：K.C
    提供：几个扩展的方法
    */
    K.C.Kextend(Function.prototype, (function () {
        var slice = Array.prototype.slice;
        function Kproxy(v1, v2) {
            var args = slice.call(arguments, 2);
            var scope = v2;
            var fun = v1;
            if (K.C.isfun(v2)) {
                scope = v1;
                fun = v2;
            } else if (K.C.isstr(v2)) {
                scope = v1;
                fun = scope[v2];
            }
            return function () {
                return fun.apply(scope, args.concat([].slice.call(arguments)));
            };
        }

        function KargumentNames() {
            var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
            return names.length == 1 && !names[0] ? [] : names;
        }
        function Kbind(context) {
            if (arguments.length < 2 && K.C.isUndefined(arguments[0])) return this;
            var __method = this, args = slice.call(arguments, 1);
            return function () {
                var a = Kmerge(args, arguments);
                return __method.apply(context, a);
            }
        }
        function Kwrap(wrapper) {
            var __method = this;
            return function () {
                var a = Kupdate([__method.Kbind(this)], arguments);
                return wrapper.apply(this, a);
            }
        }
        function Kcurry() {
            if (!arguments.length) return this;
            var __method = this, args = slice.call(arguments, 0);
            return function () {
                var a = Kmerge(args, arguments);
                return __method.apply(this, a);
            }
        }
        function Kupdate(array, args) {
            var arrayLength = array.length, length = args.length;
            while (length--) array[arrayLength + length] = args[length];
            return array;
        }
        function Kmerge(array, args) {
            array = slice.call(array, 0);
            return Kupdate(array, args);
        }
        //延迟执行函数
        //Element.addClassName.delay(1, 'foo', 'bar'); 
        function Kdelay(timeout) {
            var __method = this, args = slice.call(arguments, 1);
            timeout = timeout * 1000;
            return window.setTimeout(function () {
                return __method.apply(__method, args);
            }, timeout); //自己也是可以绑定到自己身上的。
        }
        return {
            Kproxy: Kproxy,
            KargumentNames: KargumentNames,
            KargNames: KargumentNames,
            Kbind: Kbind,
            Kwrap: Kwrap,
            Kcurry: Kcurry,
            Kdelay: Kdelay
        }
    })());

    /*
    K.S:
    提供和原生String对象同样的功能
    依赖：core, class
    提供：

    */
    (function () {
        K.S = K.String = K.fn.create();
        K.S.Kextend({
            interpret: function (value) {
                return value == null ? '' : String(value);
            },
            trim: function (item) {
                return String(item).replace(/^\s+|\s+$/g, '');
            }
        })

    })();

    /*
    K.B:
    提供浏览器检测对象
    依赖：class
    提供：

    */
    (function () {

        var ua = navigator.userAgent.toLowerCase(), platform = navigator.platform.toLowerCase(),
		UA = ua.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/) || [null, 'unknown', 0],
		mode = UA[1] == 'ie' && document.documentMode;
        // K.B.extend({
        // d1:function(){ console.log("en")}
        // })

        var _Browser = K.fn.create({
            name: (UA[1] == 'version') ? UA[3] : UA[1],

            version: mode || parseFloat((UA[1] == 'opera' && UA[4]) ? UA[4] : UA[2]),

            Platform: {
                name: ua.match(/ip(?:ad|od|hone)/) ? 'ios' : (ua.match(/(?:webos|android)/) || platform.match(/mac|win|linux/) || ['other'])[0]
            },

            Features: {
                xpath: !!(document.evaluate),
                air: !!(window.runtime),
                query: !!(document.querySelector),
                json: !!(window.JSON)
            },

            Plugins: {}
        });
        K.B = K.Browser = new _Browser();

        K.B=K.Browser= {

			name: (UA[1] == 'version') ? UA[3] : UA[1],

			version: mode || parseFloat((UA[1] == 'opera' && UA[4]) ? UA[4] : UA[2]),

			Platform: {
			name: ua.match(/ip(?:ad|od|hone)/) ? 'ios' : (ua.match(/(?:webos|android)/) || platform.match(/mac|win|linux/) || ['other'])[0]
			},

			Features: {
				xpath: !!(document.evaluate),
				air: !!(window.runtime),
				query: !!(document.querySelector),
				json: !!(window.JSON)
			},

			Plugins: {}

        };
        K.B[K.B.name] = true;
		if(K.B.version==5){
			K.B.version=8;  //IE
		}
        K.B[K.B.name + parseInt(K.B.version, 10)] = true;
        K.B.Platform[K.B.Platform.name] = true;
        if (K.B.Platform.ios) K.B.Platform.ipod = true;
        K.B.Engine = {};

        var setEngine = function (name, version) {
            K.B.Engine.name = name;
            K.B.Engine[name + version] = true;
            K.B.Engine.version = version;
        };
        if (K.B.ie) {
            K.B.Engine.trident = true;
            switch (K.B.version) {
              		
                case 6: setEngine('trident', 4); break;
                case 7: setEngine('trident', 5); break;
				case 8: setEngine('trident', 6); break;	
				case 9: setEngine('trident', 7); 
            }
        }
        if (K.B.firefox) {
            K.B.Engine.gecko = true;

            if (K.B.version >= 3) setEngine('gecko', 19);
            else setEngine('gecko', 18);
        }

        if (K.B.safari || K.B.chrome) {

            K.B.Engine.webkit = true;

            switch (K.B.version) {
                case 2: setEngine('webkit', 419); break;
                case 3: setEngine('webkit', 420); break;
                case 4: setEngine('webkit', 525);
            }
        }

        if (K.B.opera) {
            K.B.Engine.presto = true;

            if (K.B.version >= 9.6) setEngine('presto', 960);
            else if (K.B.version >= 9.5) setEngine('presto', 950);
            else setEngine('presto', 925);
        }

        if (K.B.name == 'unknown') {
            switch ((ua.match(/(?:webkit|khtml|gecko)/) || [])[0]) {
                case 'webkit':
                case 'khtml':
                    K.B.Engine.webkit = true;
                    break;
                case 'gecko':
                    K.B.Engine.gecko = true;
            }
        }

    })();

    /*
    K.A:
    提供原生Array对象同样的功能
    依赖：core,class
    提供：
	
    */
    (function () {
        K.A = K.Array = K.fn.create();

        //K.A.extend(Enumerable);

        K.A.Kextend({
            each: function (json, callback) {
                //如果是集合
                if (K.C.iscollect(json)) {
                    for (var idx = 0, l = json.length; idx < l; idx++) {
                        callback(json[idx], idx);
                    }
                }
				else if(K.C.isNumber(json)){ 
                    for (var idx = 0, l = json; idx < l; idx++) {
                        callback(idx);
                    }					
				}
				else {
                    for (var key in json) {
                        callback(json[key], key);
                    }
                }
                return K;
            },
			map : function(collect, callback){
				var a = [], len=collect.length;
				if(callback){
					callback = K.C.lambda(callback);
					for(var i=0; i<len; i++){
						a[i] = callback(collect[i],i);
					}			
				}else{
					for(var i=0; i<len; i++){
						a[i] = collect[i];
					}
				}
				return a;
			}
        })
    })();

    /*
    ---
    名称: K.E

    描述: 包含事件类型，创建一个跨浏览器事件对象

    依赖: [core,Selector]

    提供: Event

    ...
    */
    /*
    K('d1').bind('keydown', function (event) {
    alert(event.code   );   // returns the lowercase letter pressed.
    //            alert(event.shift); // returns true if the key pressed is shift.
    if (event.key == 's' && event.control) alert('Document saved.'); //executes if the user presses Ctr+S.
    })
    K("myAnchor").bind('click', function (event) {
    event.stop();

    })

    K('myElement').bind('click', function () {
    alert('click');
    return false; //equivalent to stopPropagation.
    });
    K('myChild').bind('keypress', function (event) {
    alert('en');
    event.stopPropagation(); //prevents the event from bubbling up, and fires the parent's click event.
    });
    //            K(window).bind('click', function (event) {
    //                
    //                document.getElementById("pagex").innerHTML = event.;
    //            })

    document.body.onmouseover = function (event) {

    document.getElementById("pagex").innerHTML = event.clientY;

    }        
            
                
    */
    (function () {

        var _keys = {};

        var DOMEvent = K.DOMEvent = K.E = new K.Type('DOMEvent', function (event, win) {
            if (!win) win = window;
            event = event || win.event;
            if (event.$extended) return event;
            this.event = event;
            this.$extended = true;
            this.shift = event.shiftKey;
            this.control = event.ctrlKey;
            this.alt = event.altKey;
            this.meta = event.metaKey;
            var type = this.type = event.type;
            var target = event.target || event.srcElement;
            while (target && target.nodeType == 3) target = target.parentNode;
            this.target = K(target).node;

            if (type.indexOf('key') == 0) {
                var code = this.code = (event.which || event.keyCode);
                this.key = _keys[code]/*<1.3compat>*/ || K.O.keyOf(Event.Keys, code)/*</1.3compat>*/;
                if (type == 'keydown') {
                    if (code > 111 && code < 124) this.key = 'f' + (code - 111);
                    else if (code > 95 && code < 106) this.key = code - 96;
                }
                if (this.key == null) this.key = String.fromCharCode(code).toLowerCase();
            } else if (type == 'click' || type == 'dblclick' || type == 'contextmenu' || type.indexOf('mouse') == 0) {
                var doc = win.document;
                doc = (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
                this.page = {
                    x: (event.pageX != null) ? event.pageX : event.clientX + doc.scrollLeft,
                    y: (event.pageY != null) ? event.pageY : event.clientY + doc.scrollTop
                };
                this.client = {
                    x: (event.pageX != null) ? event.pageX - win.pageXOffset : event.clientX,
                    y: (event.pageY != null) ? event.pageY - win.pageYOffset : event.clientY
                };
                if (type == 'DOMMouseScroll' || type == 'mousewheel')
                    this.wheel = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;

                this.rightClick = (event.which == 3 || event.button == 2);
                if (type == 'mouseover' || type == 'mouseout') {
                    var related = event.relatedTarget || event[(type == 'mouseover' ? 'from' : 'to') + 'Element'];
                    while (related && related.nodeType == 3) related = related.parentNode;
                    this.relatedTarget = K(related).node;
                }
            } else if (type.indexOf('touch') == 0 || type.indexOf('gesture') == 0) {
                this.rotation = event.rotation;
                this.scale = event.scale;
                this.targetTouches = event.targetTouches;
                this.changedTouches = event.changedTouches;
                var touches = this.touches = event.touches;
                if (touches && touches[0]) {
                    var touch = touches[0];
                    this.page = { x: touch.pageX, y: touch.pageY };
                    this.client = { x: touch.clientX, y: touch.clientY };
                }
            }

            if (!this.client) this.client = {};
            if (!this.page) this.page = {};
        });

        DOMEvent.Kimplement({


            stopPropagation: function () {
                if (this.event.stopPropagation) this.event.stopPropagation();
                else this.event.cancelBubble = true;
                return this;
            },

            preventDefault: function () {
                if (this.event.preventDefault) this.event.preventDefault();
                else this.event.returnValue = false;
                return this;
            }

        });

        DOMEvent.defineKey = function (code, key) {
            _keys[code] = key;
            return this;
        };

        DOMEvent.defineKeys = DOMEvent.defineKey.KoverloadSetter(true);

        DOMEvent.defineKeys({
            '38': 'up', '40': 'down', '37': 'left', '39': 'right',
            '27': 'esc', '32': 'space', '8': 'backspace', '9': 'tab',
            '46': 'delete', '13': 'enter'
        });

    })();
	this.KEvent=K.E;

    /*
    K.R:
    提供支撑方法的正则表达式
    依赖：class
    提供：...
	
    */

    (function () {
        K.R = K.Regexp = K.fn.create();
        K.R.Kextend({
		    num:/^\-?\d+(?:\.\d+)?$/            
        })
    })();



    var Kwdom = K.fn.create({

        //查找夫节点
        parent: function (level) {
            level = level || 1;
            var obj = this.node;
            for (var i = 0; i < level; i++) {
                obj = obj.parentNode;
            }
            return K(obj);
        },
        //查找兄弟节点  console.log(F("d1").sibling().html());
        sibling: function (idx) {
            var Kproxy = Function.prototype.Kproxy;
            //相对与本节点的
            if (K.C.isNumber(idx)) {
                var dir = idx > 0 ? "nextSibling" : "previousSibling";
                idx = Math.abs(idx);
                var obj = this.node;
                while (obj = obj[dir]) {
                    if (obj.nodeType == 1 && (--idx == 0)) {
                        return K(obj);
                    }
                }
                return false;
            }

            //获取兄弟节点列表	
            var a = [];
            (K.C.unset(idx) ? "<>" : idx).replace(/./g, Kproxy(this, function (dir) {
                dir = dir == ">" ? "nextSibling" : "previousSibling";
                var obj = this.node;
                while (obj = obj[dir]) {
                    //数组的unshift方法，往数组中压入头中压入一个数组。
                    obj.nodeType == 1 && a.unshift(obj);
                }
            }));
            return K.doms(a);

        },
        //查找兄弟的上一个节点
        prev: function () {
            return this.sibling(-1);
        },
        //下查找兄弟的一个节点
        next: function () {
            return this.sibling(1);
        },
        //获取子节点集合
        child: function (idx) {
            //获取子节点集合
            if (arguments.length == 0) {
                var ol = [];
                for (var nodes = this.node.childNodes, l = nodes.length, i = 0; i < l; i++) {
                    nodes[i].nodeType == 1 && ol.push(nodes[i]);
                }
                return K.doms(ol);
            }
            //获取子节点
            var getChild = function (obj, a) {
                var nodes = obj.childNodes;
                var l = nodes.length;
                var idx = +a.shift();
                var i;
                if (idx < 0) {
                    for (i = l - 1; i >= 0; i--) {
                        if (nodes[i].nodeType == 1 && ++idx == 0) break;
                    }
                } else {
                    for (i = 0; i < l; i++) {
                        if (nodes[i].nodeType == 1 && --idx < 0) break;
                    }
                }
                if (i < 0 || i >= l) {
                    return false;
                    //throw "child("+i+") is out range";
                }
                return a.length > 0 ? getChild(nodes[i], a) : K(nodes[i]);
            }
            return K(getChild(this.node, K.A.map(arguments)));
        },
        //第一个节点
        first: function () {
            return this.child(0);
        },
        //最后一个节点
        last: function () {
            return this.child(-1);
        },
        //标签选择器
        getBytags: function (exp) {
			function hasAttribute(elem, name) {
				return elem.getAttribute(name) != null;
			}
            var a = [], doms, k, v, fun;
            if (/^\w+$/.test(exp)) {
                a = this.node.getElementsByTagName(exp);
            } else if (/^(\w+)\.(\w+)$/.test(exp)) {
                doms = this.node.getElementsByTagName(RegExp.$1);
                for (var i = 0, l = doms.length; i < l; i++) {
                    doms[i].className == RegExp.$2 && a.push(doms[i]);
                }
            } else if (/^(\w+)\[(\w+)((!)?=(.+))?\]$/.test(exp)) {
                doms = this.node.getElementsByTagName(RegExp.$1);
                k = RegExp.$2;
                if (RegExp.$3) {
                    v = RegExp.$5;
                    fun = RegExp.$4 == "!" ? K.C.lambda("a!=b") : K.C.lambda("a==b");
                    for (var i = 0, l = doms.length; i < l; i++) {
                        fun(doms[i][k] || doms[i].getAttribute(k), v) && a.push(doms[i]);
                    }
                } else {
                    for (var i = 0, l = doms.length; i < l; i++) {
						hasAttribute(doms[i],k)&&a.push(doms[i])
                        //doms[i].hasAttribute(k) && a.push(doms[i]);
                    }
                }
            }
            return K.doms(a);
        },
        //获取索引值
        index: function (idx) {
            var i = 0;
            var obj = this.node;
            while (obj = obj.previousSibling) {
                obj.nodeType == 1 && ++i;
            }
            return idx === undefined ? i : idx == i;
        },
        /*--------------文档处理---------------*/
        //增加节点
        append: function (tag, idx) {
            var obj;
            if (/^(\w+)(\.(\w+))?$/.test(tag)) {
                obj = _doc.createElement(RegExp.$1);
                RegExp.$2 && (obj.className = RegExp.$3);
            } else {
                var div = _doc.createElement("div");
                div.innerHTML = tag;
                obj = div.firstChild;
            }
            if (K.C.unset(idx)) {
                this.node.appendChild(obj);
            } else {
                this.node.insertBefore(obj, K.C.isstr(idx) ? this.node.childNodes[idx] : this.child(idx).node);
            }
            return K(obj);
        },

        //删除当前节点
        remove: function () {
            this.parent().node.removeChild(this.node);
            return this;
        },
        empty: function (typeid) {
            if (K.C.unset(typeid)) {
                while (this.node.firstChild) {
                    this.node.removeChild(this.node.firstChild);
                }
            } else {
                for (var nodes = this.node.childNodes, i = nodes.length - 1; i >= 0; i--) {
                    nodes[i].nodeType != typeid && this.node.removeChild(nodes[i]);
                }
            }
            return this;
        },

        //插入
        /*
        K("d1").insert({ after: new Element('img', { src: 'logo.png' }) });
        'after','before','top','bottom',
        K("d1").insert({ before:"<hr>",after:"<hr>" });
               
        */
        getByTag: function (tag) {

            var obj = this.node.getElementsByTagName(tag);
            try {
                return [].slice.call(obj);
            }
            catch (e) {
                var j, i = 0, rs = [];
                while (j = obj[i])
                    rs[i++] = j
                return rs;
            }
        },

        insert: function (insertions) {
            element = this.node;
            if (K.C.isstr(insertions) || K.C.isNumber(insertions) || K.C.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
                insertions = { bottom: insertions };
            var content, insert, tagName, childNodes;
            for (var position in insertions) {
                content = insertions[position];
                if (K.C.isfun(content)) {
                    continue;
                }
                position = position.toLowerCase();
                insert = K._insertionTranslations[position];
                /*
					before: function (element, node) {
					element.parentNode.insertBefore(node, element);
                },                
                */
                if (content && content.toElement) content = content.toElement();
                if (K.C.isElement(content)) {
                    this.insert(element, content);
                }
                content = K.C.toHTML(content);

                tagName = ((position == 'before' || position == 'after') ? element.parentNode : element).tagName.toUpperCase();
                childNodes = K._getContentFromAnonymousElement(tagName, content)
                if (position == 'top' || position == 'after') childNodes.reverse();
                K.A.each(childNodes, insert.Kcurry(element));

            }
            return K(element);
        },
        //清空空格
        cleanWhitespace: function () {
            var elem = this.node;
            var node = this.node.firstChild;
            while (node) {
                var nextNode = node.nextSibling;
                if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
                    elem.removeChild(node);
                node = nextNode;
            }
            return K(elem);
        },
        //清空子节点
        removeChildren: function () {
            while (this.node.firstChild) {
                this.node.firstChild.parentNode.removeChild(this.node.firstChild);
            }
            return K(this.node);
        }


    });

    Kwdom.Kimplement({
        classNames: function () {
            return this.node.className;
        },
        /*  
        true/false
        */
        hasClassName: function (className) {
            var elementClassName = this.node.className;
            return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
        },

        addClassName: function (className) {
            if (!this.hasClassName(className))
                this.node.className += (this.node.className ? ' ' : '') + className;
            return K(this.node);
        },

        removeClassName: function (className) {
            this.node.className = this.node.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').trim();
            return K(this.node);
        },

        toggleClassName: function (className) {
            return this[this.hasClassName(className) ?
      'removeClassName' : 'addClassName'](className);
        },

        //sizzle select
        select: function (element) {
            element = K(element);
            var expressions = Array.prototype.slice.call(arguments, 1).join(', ');
            return K.Selector.select(expressions, element);
        },
        //scrollLeft
        scrollLeft: function (px) {
            if (K.C.isset(px)) {
                this.node.scrollLeft = px;
                return this;
            }
            return this.node.scrollLeft;
        },

        //scrollTop
        scrollTop: function (px) {
            if (K.C.isset(px)) {
                this.node.scrollTop = px;
                return this;
            }
            return this.node.scrollTop;
        },
        //3.显示隐藏

        //显示
        show: function () {
            return this.css("display", /^(span|img|a|input|b|u|i|label|strong|em)$/.test(this.tag) === false ? "block" : "inline");
        },
        //隐藏
        hide: function () {
            return this.css("display", "none");
        },
        //切换元素的可见状态
        toggle: function () {
            this.css("display") == "none" ? this.show.apply(this, arguments) : this.hide();
            return this.css("display");
        },
        /*
        //$("box").css("width","100px").css("height","50px").css("backgroundColor","red").css("color","blue"); //用法一

        $("box").css("width:100px; height:50px; font-weight:bold; background-color:red; color:blue;"); //用法二

        //$("box").css({width:"100px", height:"50px", fontWeight:"bold", backgroundColor:"red", color:"blue"}); //用法三

        alert($("box").css("width"))        
        setStyle({ 
                

        })
        */
        css: function (p, v) {
            //name/value格式
            var trim = K.S.trim;
            if (K.C.isObj(p)) {
                for (var i in p) {
                    this.css(i, p[i]);
                }
                return K(this.node);
            }
            //CSS多样式格式
            if (p.indexOf(":") > -1) {
                K.A.each(p.replace(/;$/, "").split(";"), Function.prototype.Kproxy(function (s) {
                    var a = s.split(":");
                    this.css(trim(a.shift()), trim(a.join(":")));
                }, this));
                return K(this.node);
            }
            //横杠小写字母替换为大写
            if (/\-\w/.test(p)) {
                p = p.replace(/\-(\w)/, function (s, s1) { return s1.toUpperCase(); });
            }
            //获取单项属性
            if (arguments.length == 1) {
                if (this.node == document || this.node == window) {
                    this.node = document.body;
                }
                return this.node.style[p] || (
				_doc.defaultView ? _doc.defaultView.getComputedStyle(this.node, null)[p] :
				this.node.currentStyle ? this.node.currentStyle[p] : "");
            }
            //设置单项属性
            var aa = 2;
            this.node.style[p] = v;
            return K(this.node);
        },
        opacity: function (n) {
            if (arguments.length == 1) {
                if (this.node.style.opacity != undefined) {
                    return this.css("opacity", n);
                }
                return this.css("filter", "alpha(opacity=" + n * 100 + ")");
            }
            if (this.node.style.opacity != undefined) {
                return K.R.num.test(this.css("opacity")) ? +RegExp.lastMatch : 1;
            }
            return /alpha\(opacity=(\d+)\)/.test(this.css("filter")) ? RegExp.$1 / 100 : 1;
        },
        //innerHTML		
        html: function (v) {
            if (K.C.unset(v)) {
                return this.node.innerHTML;
            } else if (v === true) {
                var div = _doc.createElement("div");
                div.appendChild(this.node.cloneNode(true));
                return div.innerHTML;
            } else if (K.C.isarr(v)) {
                v = v.join("");
            } else if (K.C.isKdom(v) || K.C.isnode(v)) {
                v = Object(v).html();
            } else if (K.C.isfun(v)) {
                v = v(this);
            }
            switch (this.tag) {
                case "select":
                    if (Browser.ie) {
                        this.empty();
                        var obj = _doc.createElement("div");
                        obj.innerHTML = '<select>' + v + '</select>';
                        var nodes = obj.firstChild.childNodes;
                        while (nodes.length > 0) {
                            this.node.appendChild(nodes[0]);
                        }
                    } else {
                        this.node.innerHTML = v;
                    }
                    if (arguments.length == 2) {
                        this.node.value = arguments[1];
                    }
                    break;
                case "table":
                    this.getBytags("tbody").item(0).html(v);
                    break;
                case "thead":
                case "tfoot":
                case "tbody":
                    this.empty();
                    var div = _doc.createElement("div");
                    div.innerHTML = "<table><tbody>" + v + "</tbody></table>";
                    var ol = div.firstChild.tBodies[0].rows;
                    while (ol.length > 0) {
                        this.node.appendChild(ol[0]);
                    }
                    break;
                default:
                    this.node.innerHTML = v;
                    break;
            }
            return this;
        },

        attr: function (p, v) {
            var n = arguments.length;

            if (n == 2) {
                //设置单个属性				
                if (p == "style") {
                    this.node.style.cssText = v;
                } else if (this.node[p] != undefined) {
                    this.node[p] = v;
                } else {
                    this.node.setAttribute(p, v);
                }
                return this;
            }
            if (n == 1) {
                //设置{key:value}对象多属性格式
                if (typeof p == "object") {
                    for (var i in p) {
                        this.attr(i, p[i]);
                    }
                    return this;
                }

                //设置key=value字符串表达式多属性格式
                if (p.indexOf("=") > -1) {
                    F.each(F.trim(p).split(/\s+/), F.proxy(function (s) {
                        var a = s.split("=");
                        this.attr(F.trim(a[0]), /["'](.+?)["']/.test(a[1]) ? RegExp.$1 : F.trim(a[1]));
                    }, this));
                    return this;
                }

                //获取单个属性
                if (p == "style") {
                    return this.node.style.cssText;
                } else if (p == "href" && this.tag == "a") {
                    return this.node.getAttribute(p, 2);
                } else if (this.node[p] != undefined) {
                    return this.node[p];
                }
                return this.node.getAttribute(p);
            }
            if (n == 0) {
                //获取所有属性
                var o = {};
                for (var a = this.node.attributes, l = a.length, i = 0; i < l; i++) {
                    o[a[i].name] = a[i].value;
                }
                return o;
            }
        },


        /*--------------6.事件-----------------*/
        //绑定事件		
        bind: function (etype, fun, scope) {	
			
            etype = etype.replace(/^_/, "");
            var fdom = this;
            var scope = scope || this;
            var fun2 = function (e) { 
				if(!e) e=window.e;
				fun.call(scope, new K.E(e), fdom) 
			};
			// console.log(etype);
			// console.log(fun);
            // if (this.node.addEventListener) {
                // this.node.addEventListener(etype, fun2, false);
            // } else if (this.node.attachEvent) {
                // this.node.attachEvent("on" + etype, fun2);
            // }

			if (this.node.addEventListener) {
				this.node.addEventListener(etype, fun2, false);
			} else if (this.node.attachEvent) {	
				if(this.tag=='win'){ 	
					//解决window.attachEvent不存在的情况。
					document.body.attachEvent('on' + etype,fun2);
				}else{
					this.node.attachEvent("on" + etype, fun2);
				}
			}
			return RegExp.lastMatch == "_" ? fun2 : this;		
        },

        //解除绑定
        unbind: function (etype, fun) {
            if (_win.removeEventListener) {
                this.node.removeEventListener(etype, fun, false);
            } else if (_win.attachEvent) {
                this.node.detachEvent("on" + etype, fun);
            }
            return this;
        },

        //单击事件
        click: function (fun, scope) {
            return this.bind("click", fun, scope);
        },

        //鼠标停留和移出事件
        hover: function (over_callback, out_callback) {
            this.bind("mouseover", over_callback);
            this.bind("mouseout", out_callback);
            return this;
        }

    })

    /*支持insert方法*/
    K._insertionTranslations = {
        before: function (element, node) {
            element.parentNode.insertBefore(node, element);
        },
        top: function (element, node) {
            element.insertBefore(node, element.firstChild);
        },
        bottom: function (element, node) {
            element.appendChild(node);
        },
        after: function (element, node) {
            element.parentNode.insertBefore(node, element.nextSibling);
        },
        tags: {
            TABLE: ['<table>', '</table>', 1],
            TBODY: ['<table><tbody>', '</tbody></table>', 2],
            TR: ['<table><tbody><tr>', '</tr></tbody></table>', 3],
            TD: ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
            SELECT: ['<select>', '</select>', 1]
        }
    }

    K._getContentFromAnonymousElement = function (tagName, html, force) {
        var div = document.createElement("div");
        var t = K._insertionTranslations.tags[tagName];
        var workaround = false;
        if (t) workaround = true;
        else if (force) {
            workaround = true;
            t = ['', '', 0];
        }
        if (workaround) {
            div.innerHTML = '&nbsp;' + t[0] + html + t[1];
            div.removeChild(div.firstChild);
            for (var i = t[2]; i--; ) {
                div = div.firstChild;
            }
        }
        else {
            div.innerHTML = html;
        }
        return KA(div.childNodes);
    };



    //other


    //加载完成回调
    K.ready = function (o) {
        if (K.C.isfun(o)) {
            return _ready(o);
        }
        o.init && _ready(Function.prototype.Kproxy(o, o.init));
        return o;
    }

    //加载完成回调
    var _ready = function () {
        var isReady = false,
		readyList = [],
		timer,
		ready = function (fn) {
		    if (isReady) {
		        fn();
		    } else {
		        readyList.push(fn);
		    }
		},
		onDOMReady = function () {
		    for (var i = 0, lg = readyList.length; i < lg; i++) {
		        readyList[i]();
		    }
		    readyList = null;
		},
		bindReady = function (evt) {
		    if (isReady) return;
		    isReady = true;
		    onDOMReady();
		    if (_doc.removeEventListener) {
		        _doc.removeEventListener("DOMContentLoaded", bindReady, false);
		    } else if (_doc.attachEvent) {
		        _doc.detachEvent("onreadystatechange", bindReady);
		        if (_win == _win.top) {
		            clearInterval(timer);
		            timer = null;
		        }
		    }
		};
        if (_doc.addEventListener) {
            _doc.addEventListener("DOMContentLoaded", bindReady, false);
        } else if (_doc.attachEvent) {
            _doc.attachEvent("onreadystatechange", function () {
                if ((/loaded|complete/).test(_doc.readyState)) bindReady();
            });
            if (_win == _win.top) {
                timer = setInterval(function () {
                    try {
                        isReady || _doc.docElement.doScroll('left');
                    } catch (e) {
                        return;
                    }
                    bindReady();
                }, 5);
            }
        }
        return ready;
    } ();

    if (K.Browser.ie) {
        window.console = function () { };
        console.log = log = function (content) {
            alert(content);
        }
    }


})();
