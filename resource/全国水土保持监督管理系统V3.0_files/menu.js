/*
*author:Null
*DATE:2013.5.24
*/

$(function(){		   
	//头页登录
	/*$("#navul > li").not(".navhome").hover(function(){
		$(this).addClass("navmoon")
	},function(){
		$(this).removeClass("navmoon")
	});	*/
	
	
	//导航栏鼠标划过效果
	$("#navul > li").not(".navhome").hover(function(){
		$(this).addClass("navmoon")
	},function(){
		$(this).removeClass("navmoon");
	}); 
	
	//导航栏鼠标点击效果
	$("#navul > li").not(".navhome").click(function(){
		$(this).addClass('bannerYs').siblings('li').removeClass('bannerYs');
	});
	
	//验证样式的控制
	/*$('div[id$=Tip]').width(300);//验证样式统一控制宽度
	$('div[id$=Tip]').height(20);//验证样式统一控制高度
*/}); 
/*
(function($){
    $.fn.capacityFixed = function(options) {
        var opts = $.extend({},$.fn.capacityFixed.deflunt,options);
        var FixedFun = function(element) {
            var top = opts.top;
            element.css({
                "top":top
            });
            $(window).scroll(function() {
                var scrolls = $(this).scrollTop();
                if (scrolls > top) {

                    if (window.XMLHttpRequest) {
                        element.css({
                            position: "fixed",
                            top: 0							
                        });
                    } else {
                        element.css({
                            top: scrolls
                        });
                    }
                }else {
                    element.css({
                        position: "absolute",
                        top: top
                    });
                }
            });
            element.find(".close-ico").click(function(event){
                element.remove();
                event.preventDefault();
            })
        };
        return $(this).each(function() {
            FixedFun($(this));
        });
    };
    $.fn.capacityFixed.deflunt={
		right : 0,//相对于页面宽度的右边定位
        top:0
	};
})(jQuery);*/