	/*提示框/回显框效果（居中显示，拖拽）*/
$(function(){
		/*$('.on').each(function(){
			$(this).click(function(){
				FloatsHeight();
				$('.floats').show();
				$('.hide').show();
				$('.hide_ok').click(function(){
					$('.hide').hide();
					$('.hidee').show();
				})
			})
		})*/
		
		
		//点击关闭按钮让遮罩层与提示框隐藏	
		$('.off').each(function(){
			$(this).click(function(){
				$('.floats').hide();
				$('.hide').hide();
			});
		});
		
		/*//修改浮动层的高度
		function FloatsHeight(){
			var Oheight=$(document).height();
			$('#floats').css('height',Oheight);
			
		}*/
		
			
		//点击关闭按钮让遮罩层与回显框隐藏	
		$('.hide_off').click(function(){
			$('.hidee').hide();
			$('#floats').hide();
		});
		
		//拖拽
		function hideBoxTZ(hideName){
			var _move=false;//移动标记
			var _x=0,_y=0;//鼠标离控件左上角的位置
			$(hideName).mousedown(function(e){
				_move=true;
				_x=e.pageX-parseInt($(hideName).css('left'));
				_y=e.pageY-parseInt($(hideName).css('top'));
			});
			$(document).mousemove(function(e){
				if (_move) {
					var x=e.pageX-_x;
					var y=e.pageY-_y;
					var lx=$(window).width();
					var ly=$(window).height();
					var hideWidth=$(hideName).outerWidth();
					var hideHeight=$(hideName).outerHeight();
					var maxX=lx-hideWidth;
					var maxY=ly-hideHeight;
					x=Math.min(maxX,Math.max(0,x));
					y=Math.min(maxY,Math.max(0,y));
					$(hideName).css({top:y,left:x});
				}
			}).mouseup(function(){
				_move=false; 
			});
		}
		hideBoxTZ('.hide');
		hideBoxTZ('.hidee');
		
		
		/*//页面加载时显示GIF图片
		$(window).ready(function(){
			$(parent.document.body).append('<div id="floatZz" style=" background:#fff;"></div><img id="FImg" src="./images/2.gif" style="position:absolute"/>');
				var _h=document.documentElement.clientHeight;
				var _w=document.documentElement.clientWidth;
				var ImgHeight=$('#FImg').outerHeight();
				var ImgWidth=$('#FImg').outerWidth();
				$('#floatZz').css({width:_w,height:_h});
				$('#FImg').css({top:((_h-ImgHeight)/2),left:((_w-ImgWidth)/2)});
				
		})
		//加载完成后关闭浮动和图片
		$(window).load(function(){	
				$('#floatZz').empty();
				$('#FImg').empty();
		})*/
		
	});
	
	
	var mouseHeight = "";
	//点击删除显示提示框公用方法
	function showDiv(id){
			var win =  window.parent ? window.parent : window;
			var _h = "";
			var _w="";
			var scrollTop="";
			try{
				 _h = win.screen.availHeight;
				 _w=$(window).width();
				 scrollTop=$(win).scrollTop();
				 if(scrollTop==0){
					$('#i_'+id).css({top:(_h - $('#i_'+id).height())/2  - 124,left:(_w-$('#i_'+id).width())/2}); 	
				 }else{
					$('#i_'+id).css({top:(_h - $('#i_'+id).height()+scrollTop)/2,left:(_w-$('#i_'+id).width())/2}); 	
				 } 
			}
			catch(err){
				 var tableHeight =  $("table").height();
				 var tableWidth = $("table").width();
				 _h = window.screen.availHeight;
				 _w=window.screen.availWidth;
				 scrollTop=$(window).scrollTop();
				 var divHeight = 0;
				 if(tableHeight>400){
					 divHeight = (tableHeight-$('#i_'+id).height())/2;
				 }else{
					 divHeight = tableHeight;
				 }
				 
				 $('#i_'+id).css({top:(divHeight - $('#i_'+id).height()+scrollTop)/2,left:(tableWidth-$('#i_'+id).width())/2});
			}
			$('#o_'+id).show();
			$('#i_'+id).show();
	}
	
	document.onmousemove=function(e){
		e=e?e:window.event;
		mouseHeight = e.screenY;
	};

	
	

