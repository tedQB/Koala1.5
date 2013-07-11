K(function(){
	var findli=K("resultout").find("li");
	var lieven=K("resultout").find("li.even");
	var lia=K("resultout").find("li>a");
	if(findli.isKdoms){
		if(lieven.isKdoms){
			lieven.css("background:#CCD9C8").hover(function(){
				this.css("background:#bdbff3")		
				},function(){
					this.node.style.backgroundColor="#CCD9C8";
			});		
		}	
		findli.css("line-height:30px;padding-left:18px;").hover(function(){
			this.css("background:#bdbff3")
		},function(){
			this.css("background:none")
		});

		lia.css("color:#337; font-family:'Î¢ÈíÑÅºÚ'; font-size:13px; display:block;");
	}		
})