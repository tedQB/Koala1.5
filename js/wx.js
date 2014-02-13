//javascript:void((function(){src='http://localhost/wx.js?t='+Math.random();element=document.createElement('script');element.setAttribute('src',src);document.body.appendChild(element);})())
console.log(">>> web weixin helper start success... ...");
wx_helper = {};
$("#wx_helper_box").remove();
$("#mask").hide();

(function(H, $) {
	H.boxHTML = '<div><button id="wxh_show" style="float:left">群发助手</button><button id="wxh_hide" style="display:none;float:right">关闭</button></div><div style="clear:both"></div><div id="wxh_main" style="background-color:#E9E9E9;padding:5px;display:none;border:2px dotted #6B747A;"><div style="float:left;"><span id="wxh_friends_tab" style="cursor:pointer;background-color:#999;color:#fff">选择联系人</span>&nbsp;&nbsp;&nbsp;&nbsp;<span id="wxh_rooms_tab" style="cursor:pointer">选择群组</span></div><div style="clear:both"></div><div style="height:300px;float:left;width:300px;border:1px solid #999;overflow:auto"><div id="wxh_friends_list" style="height:300px"><input id="wxh_search" style="width:270px" type="search"><div id="wxh_friends_div" style="height:270px"></div></div><div id="wxh_rooms_list" style="display:none"></div></div><div style="clear:both"></div><div style="margin:5px;"><select style="width:290px;height:22px;margin:5px" id="wxh_templates"><option>选择群发模板</option></select><div style="clear:both"></div><textarea id="wxh_text" style="float:left;height:80px;width:200px;"></textarea><select id="wxh_interval" style="width:75px"><option value="2">发送间隔</option><option value="0">10秒内随机</option><option value="2">2秒</option><option value="3">3秒</option><option value="5">5秒</option><option value="8">8秒</option><option value="15">15秒</option></select><button id="wxh_send" style="margin-top:40px">群发</button></div><div style="clear:both"></div></div>';
	H.templates = ["恭喜发财,大吉大利!"];
	H.addrList = {
		rooms: [],
		brands: [],
		friends: []
	};
	H.taskList = [];
	H.ready = false;
	H.dataReady = false;
	H.openChat = function(username) {
		var def = new $.Deferred();
		var a = $("#con_item_" + username);
		a.click();
		setTimeout(function() {
			var sent = $("input[username=" + username + "]");
			sent.click();
			setTimeout(function() {
				def.resolve();
			}, 500);
		}, 500);
		return def.promise();
	};

	H.sendChat = function(txt) {
		var def = new $.Deferred();
		$("#textInput").val(txt);
		$("#chat_editor .chatSend").click();
		setTimeout(function() {
			def.resolve();
		}, 500);
		return def.promise();
	};

	H.loadAddr = function() {
		var def = new $.Deferred();
		$(".addrButton").click();
		var addrLoaded = false;

		function chkAddrLoaded() {
			if ($("#contactListContainer").text().trim() !== "") {
				addrLoaded = true;
				readAddr();
				def.resolve();
			} else {
				setTimeout(chkAddrLoaded, 0);
			}
		}

		function readAddr() {
			//var sets = $("#contactListContainer div.groupDetail").toArray();
			for (var key in _oContacts) {
				var o = _oContacts[key];
				if(o.isFileHelper()||o.isSpContact()||o.isNewsApp()||o.isRecommendHelper()){
					console.log("ignore : "+o.DisplayName);
				} else if (o.isRoomContact()) {
					H.addrList.rooms.push(o);
				} else if (o.isBrandContact()) {
					H.addrList.brands.push(o);
				} else if(o.isContact()){
					H.addrList.friends.push(o);
				}
			}
			for (i = 0; i < H.addrList.friends.length; i++) {
				var o = H.addrList.friends[i];
				o.idx = [o.PYInitial.toUpperCase(), o.PYQuanPin.toUpperCase(), o.DisplayName.toUpperCase()].join("#$*$#");

			}
		}

		chkAddrLoaded();
		return def.promise();
	};

	H.send = function(username, txt) {
		var def = new $.Deferred();
		H.openChat(username).pipe(function() {
			return H.sendChat(txt);
		}).done(function() {
			setTimeout(function() {
				console.log("send success");
				def.resolve();
			}, 1000);
		});
		return def.promise();
	};

	H.addBox = function() {
		var def = new $.Deferred();
		var dv = document.createElement("div");
		dv.id = "wx_helper_box";
		$(dv).css({
			width: "320px",
			position: "absolute",
			top: "10px",
			left: "0px",
			zIndex: 100001,
			fontSize: "14px"
		});

		$(dv).html(H.boxHTML);
		$("body").append(dv);
		setTimeout(function() {
			def.resolve();
		}, 0);
		return def.promise();
	};

	H.syncBox = function() {
		var def = new $.Deferred();
		H.syncFriends(H.addrList.friends);
		var $gp = $("#wxh_rooms_list");
		var g = "";
		for (i = 0; i < H.addrList.rooms.length; i++) {
			g += H._buildTr(H.addrList.rooms[i]);
		}
		if (g) {
			g = '<table style="font-size:12px;text-align:left"><thead><tr><th style="color:black"><label><input id="wxh_rooms_chkall" type="checkbox"/>全选所有群组</label></th></tr></thead><tbody>' + g + '</tbody></table>';
			$gp.html(g);
		}
		var tmpls_url = "https://raw.github.com/helper4wx/helper4wx/latest/src/tmpls.js?t=" + ((new Date()).getTime().toString().substr(0, 7));
		$.ajax({
			dataType: "script",
			cache: true,
			url: tmpls_url
		}).always(function() {
			var t = "";
			for (i = 0; i < H.templates.length; i++) {
				t += '<option>' + H.templates[i] + '</option>';
			}
			$("#wxh_templates").append(t);
			def.resolve();
		});
		return def.promise();
	};
	H.syncFriends = function(list) {
		//$("#wxh_friends_table").remove();
		var $fs = $("#wxh_friends_div");
		$fs.html();
		var f = "";
		for (var i = 0; i < list.length; i++) {
			f += H._buildTr(list[i]);
		}
		if (f) {
			f = '<table style="width:99%;font-size:12px;text-align:left"><thead><tr><th style="color:black"><label><input id="wxh_friends_chkall" type="checkbox"/>全选所有联系人</label></th></tr></thead><tbody>' + f + '</tbody></table>';
			$fs.html(f);
		}
	};
	H._buildTr = function(addr) {
		var s = '<tr><td>';
		s += '<label><input type="checkbox" username="' + addr.UserName + '" displayname="' + addr.DisplayName + '">';
		s += addr.DisplayName + '</label>';
		s += '</td></tr>';
		return s;
	};
	H.bindBox = function() {
		var def = new $.Deferred();
		var box = $("#wx_helper_box");
		box.on("click", "#wxh_show", function() {
			H._test();
			if (!H.dataReady) {
				H.loadAddr().done(function() {
					H.dataReady = true;
					H.syncBox();
				});
			}
			$("#wxh_main").toggle(200);
			$("#mask").toggle();
			$("#wxh_hide").toggle();
		});
		box.on("click", "#wxh_hide", function() {
			$("#wxh_main").hide(200);
			$("#mask").hide();
			$("#wxh_hide").hide();
		});
		box.on("click", "#wxh_friends_tab", function() {
			$("#wxh_rooms_list").hide();
			$("#wxh_friends_list").show();
			$("#wxh_friends_tab").css({
				backgroundColor: "#999",
				color: "#fff"
			});
			$("#wxh_rooms_tab").css({
				backgroundColor: "#fff",
				color: "#999"
			});
		});
		box.on("click", "#wxh_rooms_tab", function() {
			$("#wxh_friends_list").hide();
			$("#wxh_rooms_list").show();
			$("#wxh_friends_tab").css({
				backgroundColor: "#fff",
				color: "#999"
			});
			$("#wxh_rooms_tab").css({
				backgroundColor: "#999",
				color: "#fff"
			});
		});
		box.on("click", "#wxh_friends_chkall", chkAll);
		box.on("click", "#wxh_rooms_chkall", chkAll);

		function chkAll(evt) {
			var ipt = evt.target;
			var $tbd = $(ipt).parent().parent().parent().parent().next();
			var chks = $tbd.find("input[type=checkbox]");
			if (ipt.checked) {
				chks.attr("checked", true);
			} else {
				chks.attr("checked", false);
			}
		}


		box.on("change", "#wxh_templates", function(evt) {
			var str = evt.target.options[evt.target.selectedIndex].innerHTML;
			if (evt.target.selectedIndex === 0) {
				$("#wxh_text").val("");
			} else {
				$("#wxh_text").val(str);
			}
		});
		box.on("keyup", "#wxh_search", function() {
			H.search();
		});
		box.on("click", "#wxh_send", H.multiSend);
		setTimeout(function() {
			def.resolve();
		}, 0);
		return def.promise();
	};
	H.search = function() {
		if(H.search.timer){
			clearTimeout(H.search.timer);
			console.log(H.search.timer+":::canceled");
			H.search.timer =0;	
		}
		var key = $("#wxh_search").val().trim();
		function doSeach() {
			if (key === "") {
				H.syncFriends(H.addrList.friends);
			} else {
				H.syncFriends(H.getSearchResult(key.toUpperCase()));
			}
		}
		H.search.timer = setTimeout(doSeach,200);
		console.log(H.search.timer+":::search:::"+key);
	};
	H.getSearchResult = function(key) {
		var arr = [];
		for (var i = 0; i < H.addrList.friends.length; i++) {
			var o = H.addrList.friends[i];
			if (o.idx.indexOf(key) > -1) {
				arr.push(o);
			}
		}
		return arr;
	}
	H.multiSend = function() {
		if (!H.ready) {
			return;
		}
		if ($("#wxh_text").val().trim() === "") {
			alert("先写点什么吧~");
			return;
		}
		H.taskList = [];
		var str = $("#wxh_text").val().trim();
		var hasName = false;
		if (str.indexOf("{{名字}}") > -1) {
			hasName = true;
		}
		var addrs = $("#wx_helper_box tbody input[type=checkbox]");
		var nickList = [];
		addrs.each(function(idx, el) {
			var $el = $(el);
			if ($el.attr("checked")) {
				var task = {};
				task.username = $el.attr("username");
				task.displayname = $el.attr("displayname");
				nickList.push(task.displayname);
				task.text = str.split("{{名字}}").join(task.displayname);
				H.taskList.push(task);
			}
		});
		if (H.taskList.length === 0) {
			alert("发送给谁呢?");
			return;
		} else {
			var cfm = "发送给:" + nickList.join(", ") + ", 共" + nickList.length + "个好友或群组,确定么?";
			if (!hasName) {
				cfm += "(发送会耗时一段时间,不要操作网页:)";
			} else {
				cfm += '(注意:"{{名字}}"通配符将替换成你在通讯录中给Ta起的"备注名"噢!!)';
			}
			if (window.confirm(cfm)) {
				$("#wxh_main").hide(200);
				$("#mask").hide();
				$("#wxh_hide").hide();
				H.exec(0);
			} else {
				H.taskList = [];
			}

		}
	};

	H.exec = function(t) {
		if (t !== 0) {
			t = 1;
		}
		if (H.taskList.length === 0) {
			console.log("exec complete!");
		} else {
			var interval = $("#wxh_interval").val() - 2;
			if ($("#wxh_interval").val() === "0") {
				interval = Math.floor(Math.random() * 8);
			}
			interval = interval * 1000 * t;
			//console.log("interval:"+interval);
			var task = H.taskList.pop();
			setTimeout(function() {
				H.send(task.username, task.text).done(H.exec);
			}, interval)
		}
	};

	H.boot = function() {
		H.addBox().then(H.bindBox).done(function() {
			H.ready = true;
		});
	};

	$(function() {
		H.boot();
	});
	H._test = function() {}
})(wx_helper, jQuery);
