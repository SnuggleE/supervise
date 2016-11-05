/**
 * 树结构
 */

var prompt = "没有查询到附件";
var html = "{\"id\": 1,\"text\": \"没有查询到附件\",\"attributes\":{\"sourceId\":\"\",\"fileid\":\"\"}}";
var treeflag = 1;//树节点id标识
/*预加载文件夹目录：目录树节点id为奇数则为文件夹；偶数为文件，添加图片展示事件*/
var makehtml = function(sourceId,obj){
	var mhtml = "";
	for(var j=0;j<obj.length;j++){
		if(j>0){
			mhtml += ",";
		}
		var mobj = obj[j];
		if(typeof(mobj.children)!="undefined"){
			mhtml += "{\"id\":"+(treeflag*2+1)+",\"text\":\""+mobj.name+"&nbsp;&nbsp;<font color='#CCCCCC'>占用空间:"+mobj.size+"</font>&nbsp;&nbsp;<font color='#CCCCCC'>创建时间:"+mobj.tm+"</font>\",\"children\":[";
			treeflag++;
			if(mobj.children.length>0){
				mhtml += makehtml(sourceId,mobj.children);
			}else{
				mhtml += "{\"id\":"+(treeflag*2)+",\"text\":\""+prompt+"\",\"attributes\":{\"sourceId\":\"\",\"fileid\":\"\"}}";
			}
			mhtml += "]}";
		}else{
			mhtml += "{\"id\":"+(treeflag*2)+",\"text\":\""+mobj.name+"&nbsp;&nbsp;<font color='#CCCCCC'>占用空间:"+mobj.size+"</font>&nbsp;&nbsp;<font color='#CCCCCC'>创建时间:"+mobj.tm+"</font>\",\"attributes\":{\"sourceId\":\""+sourceId+"\",\"fileid\":\""+mobj.id+"\",\"filesize\":\""+mobj.size+"\"}}";
			treeflag++;
		}
	}
	return mhtml;
};
/**
 * 按照easyui中树目录的数据格式，对接收到的json串进行转化
 * 对接收到的json:有children则为文件夹，没有则为文件
 */
var maketree=function(divid,treesid,data){
	treeflag = 1;//每次创建树时对节点标识重置
	if(data!=null){
		html = "[";
		var contents = data.content;
		var sourceId = data.sourceId;
		if(typeof(contents)!="undefined"&&contents.length>0){
			for(var i=0;i<contents.length;i++){
				if(i>0){
					html += ",";
				}
				var content = contents[i];
				if(typeof(content.children)!="undefined"){
					html += "{\"id\":"+(treeflag*2+1)+",\"text\":\""+content.name+"&nbsp;&nbsp;<font color='#CCCCCC'>占用空间:"+content.size+"</font>&nbsp;&nbsp;<font color='#CCCCCC'>创建时间:"+content.tm+"</font>\",\"children\":[";
					treeflag++;
					if(content.children.length>0){
						html += makehtml(sourceId,content.children);
					}else{
						html += "{\"id\":"+(treeflag*2)+",\"text\":\""+prompt+"\",\"attributes\":{\"sourceId\":\"\",\"fileid\":\"\"}}";
					}
					html += "]}";
				}else{
					html += "{\"id\":"+(treeflag*2)+",\"text\":\""+content.name+"&nbsp;&nbsp;<font color='#CCCCCC'>占用空间:"+content.size+"</font>&nbsp;&nbsp;<font color='#CCCCCC'>创建时间:"+content.tm+"</font>\",\"attributes\":{\"sourceId\":\""+sourceId+"\",\"fileid\":\""+content.id+"\",\"filesize\":\""+content.size+"\"}}";
					treeflag++;
				}
			}
		}else{
			html += "{\"id\":"+(treeflag*2)+",\"text\":\""+prompt+"\",\"attributes\":{\"sourceId\":\"\",\"fileid\":\"\"}}";
		}
		html += "]";
	}
	if(typeof(html)!="undefined"&&typeof(html)!="object"){
		html = $.parseJSON(html);
	}
	$(treesid).tree(
		{
	          data:html,
	          onClick:function(node){
	        	  if((node.id%2)==0){//为树节点添加单击事件
	        		  showpic(node.attributes.sourceId,node.attributes.fileid,node.attributes.filesize); 
	        	  }
	          }
	     }
	);
	$(divid).window('open');
	$(divid).window('refresh');
	document.getElementById("showpic").innerHTML="";
	html = "{\"id\": 1,\"text\": \"没有查询到附件\",\"attributes\":{\"sourceId\":\"\",\"fileid\":\"\"}}";
};
/*预加载文件夹目录完成*/

/*选择文件，在展示区显示*/
var multipleflag = 1;//放大或缩小倍数
var picwidth = 0;//记录附件图片的初始状态宽度
var picheight = 0;
var showpic = function(sourceId,objid,filesize){
	multipleflag = 1;
	if(objid!=''){
		/*后台请求文件*/
		var check = /B/i;
		var check2 = /KB/i;
		var check3 = /MB/i;
		var check4 = /GB/i;
		var showflag = false;
		if(check2.test(filesize)){
			var mval = filesize.substring(0,filesize.length-2);
			if(mval<=(5*1024)){
				showflag = true;
			}else{
				showflag = false;
			}
		}else if(check3.test(filesize)){
			var mval = filesize.substring(0,filesize.length-2);
			if(mval<=5){
				showflag = true;
			}else{
				showflag = false;
			}
		}else if(check4.test(filesize)){
			var mval = filesize.substring(0,filesize.length-2);
			if(mval<=(5/1024)){
				showflag = true;
			}else{
				showflag = false;
			}
		}else if(check.test(filesize)){
			var mval = filesize.substring(0,filesize.length-1);
			if(mval<=(5*1024*1024)){
				showflag = true;
			}else{
				showflag = false;
			}
		}
		if(showflag==true){
			document.getElementById("showpic").innerHTML="<img id='picimg' width='100%' height='atuo' src='"+proxy+jgurl+"/api/DirTree1/?sourceId=" + sourceId + "&fileId=" + objid+"'/>";
		}else{
			document.getElementById("showpic").innerHTML="附件过大，请下载后查看！";
		}
	}else{
		document.getElementById("showpic").innerHTML="没有找到附件！";
	}
};
/*编辑图片*/
//放大,最大放大现有4倍。图片高度随宽度按比例改变
var enlargepic = function(){
	var picobj = document.getElementById("picimg");
	if(typeof(picobj)!='undefined'&&picobj!=null){
		if(multipleflag==1){
			picwidth = picobj.width;
//			picheight = picobj.height;
		}
		if(multipleflag<4){
			picobj.width = picobj.width + picwidth/4;
//			picobj.height = picobj.height + picheight/4;
			multipleflag += 1/4;
		}else{
			alert("已放大到最大");
		}
	}else{
		alert("请先选择文件");
	}
};
//缩小
var narrowpic = function(){
	var picobj = document.getElementById("picimg");
	if(typeof(picobj)!='undefined'&&picobj!=null){
		if(multipleflag>1){
			picobj.width = picobj.width - picwidth/4;
//			picobj.height =  picobj.height - picheight/4;
			multipleflag = multipleflag - 1/4;
		}else{
			alert("已缩小到最小");
		}
	}else{
		alert("请先选择文件");
	}
};
/*获取附件资源*/
var gettree = function (divid,treesid,projname,projid,tbbh){
	var data = null;
	if(typeof(projname)!='undefined'&&projname!=null){
		data = { "dbId": 1, "spaceId": 1, "permId": "-9026974535931440921", "rootNodes": ["生产建设项目/"+projname+"/监管模式1/监管批次1/现场复核照片/"+tbbh,"生产建设项目/"+projname+"/监管模式1/监管批次1/现场复核表"] };
	}else{
		data = { "dbId": 1, "spaceId": 1, "permId": "-9026974535931440921", "rootNodes": ["监管模式1/监管批次1/现场复核照片/"+tbbh,"文件空间1/监管模式1/监管批次1/现场复核表"] };
	}
	$.ajax({
        type: "POST",
        url: proxy+jgurl+"/api/DirTree1",
        data:data,
//        data: { "dbId": 1, "spaceId": 1, "permId": projid, "rootNodes": ["生产建设项目/"+projname+"/监管模式1/监管批次1/现场复核照片/"+tbbh,"生产建设项目/"+projname+"/监管模式1/监管批次1/现场复核表"] },
//        data: { "dbId": 1, "spaceId": 1, "permId": projid, "rootNodes": ["生产建设项目/"+projname+"/监管/现场复核照片/"+tbbh,"生产建设项目/"+projname+"/监管/现场复核表"] },
        beforeSend: function () {
        },
        success: function (treeInfo) {
            maketree(divid,treesid,treeInfo);
        },
        error: function (jqXHR, exception) {
        	maketree(divid,treesid,null);
        }
    });
};

/**
 * 文件导入、空间坐标录入窗口展示
 */
var showimpwindow = function(obj,divid){
	$(divid).window(
			{
				top:$("#map").offset().top,
				left:(document.body.scrollWidth-600)/2
			}
	);
	document.getElementById("protFile").value=null;
	document.getElementById("positionFile").value=null;
	$(divid).window('open');
};

/**
 * 空间文件保存
 */
var savefile = function(divid,obj){
	var protFile = document.getElementById("protFile").value;
	var positionFile = document.getElementById("positionFile").value;
	var prjFile = document.getElementById("prjFile").value;
	if(prjFile==null||prjFile==""){
		alert("请选择要上传的投影文件");
		return;
	}
	if((protFile!=null&&protFile!="")||(positionFile!=null&&positionFile!="")){
		if(protFile!=null&&protFile!=""&&protFile.indexOf(".shp")<0){
			alert("防治责任范围文件不是shp格式，请重新选择");
			return;
		}
		if(positionFile!=null&&positionFile!=""&&positionFile.indexOf(".shp")<0){
			alert("项目位置文件不是shp格式，请重新选择");
			return;
		}
		$("#floats").show();
		obj.form('submit',{
			type:'POST',
			url:"impShapeFile!impShpFile.action",
			contentType:'multipart/form-data;charset=UTF-8',  
			success:function(reps){
				if(reps.indexOf("ERROR")>-1){
					alert("保存失败，请检查数据，稍后重试");
					//history.go(-1);
					$("#floats").remove();
					return;
				}else{
					alert("保存成功");
					$(divid).window("close");
					//history.go(-1);
					var wzlayer = getLayer(curMap,'项目位置WFS');
					  wzlayer.refresh();
					  var fzlayer = getLayer(curMap,'防治责任范围WFS');
					  fzlayer.refresh();
					$("#floats").remove();
					alert(reps);
					return;
				}
			},
			erro:function(){
				alert("保存失败，请检查数据，稍后重试");  
				//history.go(-1);
				$("#floats").remove();
				return;
			}
		});
	}else{
		alert("请选择要上传的shape文件");
		return;
	}
};

/**
 * 地图全屏弹窗
 * obj   
 */
/*var showmapwind = function(objid){
	$("#"+objid).window({
		title:gisComPara.projectName+"-图斑分布",
		top:0,
		left:0,
		fit:true
		});
		$("#"+objid).window('open');	
};*/

var showmapwind = function(objid,topdata,leftdata){
	$("#"+objid).window({
		//title:gisComPara.projectName+"-图斑分布",
		title:"  ",
		top:topdata,
		left:leftdata,
		onMaximize:function(){mapInit();},
		onRestore:function(){}
		/*width:840,
		height:700*/
		//fit:true
		});
		$("#"+objid).window('open');	
};
//坐标录入
var savePositionAndProjectarea = function(){
	var positionwkt = document.getElementById("positionwkt").value;
	var protwkt = document.getElementById("protwkt").value;
	var positiontype = $("input[name='positiontype']:checked").val();
	var positionflag=false,protflag=false;
	if(positionwkt!=null&&positionwkt!=""){
		if(positiontype.indexOf("POINT")>-1){
			if(positionwkt.indexOf("(")>-1){
				positionwkt = "MULTIPOINT("+positionwkt+")";
			}else{
				positionwkt = "POINT("+positionwkt+")";
			}
		}else{
			if(positionwkt.indexOf("(")>-1){
				positionwkt = "MULTILINESTRING("+positionwkt+")";
			}else{
				positionwkt = "LINESTRING("+positionwkt+")";
			}
		}
		positionflag=true;
	}else{
		positionwkt=null;
	}
	if(protwkt!=null&&protwkt!=""){
		if(protwkt.indexOf("(")>-1){
			protwkt = "MULTIPOLYGON("+protwkt+")";
		}else{
			protwkt = "POLYGON("+protwkt+")";
		}
		protflag=true;
	}else{
		protwkt=null;
	}
	if(positionflag||protflag){
		$("#floats").show();
		$.ajax({
			  type:'POST',
			  url:proxy+gisHost+"/gissuper/shpediter/savePositionAndProjectarea?mecode="+encryptX(),
			  contentType:'application/x-www-form-urlencoded;charset=UTF-8',  
			  data:{"code":gisComPara.projectNum,"name":gisComPara.projectName,"positionwkt":positionwkt,"protwkt":protwkt},
			  success:function(reps){
				  if(reps.indexOf("ERROR")>-1||reps.indexOf("10")>-1||reps.indexOf('00')>-1||reps.indexOf('01')>-1){
					  alert("保存失败，请检查填写内容或稍后再试");
					  return;
				  }else if(reps.indexOf('20')>-1){
						  alert("项目位置保存成功，防治责任范围保存失败");
				  }else if(reps.indexOf('02')>-1){
					  alert("防治责任范围保存成功，项目位置保存失败");				    
				  }else if(reps.indexOf('22')>-1||reps.indexOf('11')>-1||reps.indexOf('21')>-1||reps.indexOf('12')>-1){
					  alert("保存成功");
					  $("#zbw").window('close');
				  }
				  $("#floats").remove();
				  var wzlayer = getLayer(curMap,'项目位置WFS');
				  wzlayer.refresh();
				  var fzlayer = getLayer(curMap,'防治责任范围WFS');
				  fzlayer.refresh();
			  },
			  erro:function(){
				  alert("保存失败，请检查填写内容或稍后再试");
				$("#floats").remove();
			  }
			});
	}else{
		alert("请填写坐标信息");
		return;
	}
};
/**
 *地图上业务按钮显隐控制
 */
var showctrldiv = function(divid)
{
	var obj = document.getElementById(divid);
	if(obj.style.display.indexOf("none")>-1){
		document.getElementById("adddiv").style.display="none";
		document.getElementById("showdiv").style.display="none";
		if(document.getElementById("deldiv")!="undefined"&&document.getElementById("deldiv")!=null){
			document.getElementById("deldiv").style.display="none";
		}
		document.getElementById("expdiv").style.display="none";
		obj.style.display="block";
	}else{
		obj.style.display="none";
	}
};