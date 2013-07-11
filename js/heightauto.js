<script type="text/javascript">
    K(function () {
        KK(".code_highlight").each(function (i, obj) {
            var iheight = obj.css("height");
            alert(iheight);
            if (KK(".code_js")) {
                KK(".code_js").each(function (i, obj1) {
                    obj1.css("height", iheight);
                })
            }
            else {
                KK(".code_html").each(function (i, obj1) {
                    obj1.css("height", iheight);
                })
            }
        })
    })

</script>