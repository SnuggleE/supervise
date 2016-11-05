if (typeof (proxy) == "undefined" || typeof (gisHost) == "undefined") {
	alert("proxy和gisHost参数未设置，地图正常运行!");
};
var curMap;//当前地图
var activeLayer="topp:states - Tiled";//做查询、分析用的活动图层
var curTheme="default";//系统主题；土壤侵蚀、重点工程
var vector4draw;//点线面都可以画
var interactionDraw;//当前的动作,类似于原来的drawControls的作用
var tmpLayer=null;//临时图层，用于显示查询结果的
var busiLayers=null;//业务图层集合
var format = 'image/png';
var selectedFeature = null;//选中图斑
var positionfeatures = [];
var protectfeatures = [];
var positiontype = null;
var tmpLayers=null;//勾绘临时图层集合
var delflag=false;
var poplay=null;
var select=null;
var layernames=[];
var jgSource=null;
//公共参数
var gisComPara={
		"projectName":"jianshexiangmu",
		"projectNum":"123"
};

/*var maxExtend= new ol.Bounds(
		113.10573439985,23.40345370825,
		113.40721346345,23.47870951495
    );*/
var baseLayersMeta=[
                    layMeta('防治责任范围','TG_PROTECTEDAREA'),
                    layMeta('扰动图斑','TG_DESTROYEDAREA'),
                    layMeta('项目位置','TG_PROJECTPOSITION')            
                    ];
//var busiLayersMeta=[
//                   layMeta('省行政区WFS','province','NAME'),
//                   layMeta('市行政区WFS','city','NAME'),
//                   layMeta('县行政区WFS','county','NAME'),
//                   layMeta('防治责任范围WFS','TG_PROTECTEDAREA','C_PROJECTNUM'),
//                   layMeta('扰动图斑WFS','TG_DESTROYEDAREA','C_PROJECTNUM'),
//                   layMeta('项目位置WFS','TG_PROJECTPOSITION','C_PROJECTNUM')
//                   ];
/*var baseLayersMeta=[
                 new ol.layer.Tile({
                    	source: new ol.source.TileWMS({
                    		url:gisHost+'/geoserver/datum/wms',
                    		params:{version: '1.1.0', layers:'datum:TG_DESTROYEDAREA'}}),visible:true}),//扰动图斑
                 new ol.layer.Tile({
                	   source: new ol.source.TileWMS({
	                		url:gisHost+'/geoserver/datum/wms',
	                		params:{version: '1.1.0', layers:'datum:TG_PROTECTEDAREA'}}),visible:true}),//防治责任范围
        		new ol.layer.Tile({
             	   source: new ol.source.TileWMS({
                		url:gisHost+'/geoserver/datum/wms',
                		params:{version: '1.1.0', layers:'datum:TG_PROJECTPOSITION'}}),visible:true})//项目位置
                    ];*/
//var busiLayersMeta=[
//                    new ol.layer.Tile({
//                    	source: new ol.source.TileWMS({
//                    		url:gisHost+'/geoserver/datum/wms',
//                    		params:{version: '1.1.0', layers:'datum:province'}}),visible:false}),
//            		new ol.layer.Tile({
//                    	source: new ol.source.TileWMS({
//                    		url:gisHost+'/geoserver/datum/wms',
//                    		params:{version: '1.1.0', layers:'datum:city'}}),visible:false}),
//            		new ol.layer.Tile({
//                    	source: new ol.source.TileWMS({
//                    		url:gisHost+'/geoserver/datum/wms',
//                    		params:{version: '1.1.0', layers:'datum:county'}}),visible:false}),
//            		new ol.layer.Tile({
//                    	source: new ol.source.TileWMS({
//                    		url:gisHost+'/geoserver/datum/wms',
//                    		params:{version: '1.1.0', layers:'datum:TG_PROTECTEDAREA'}}),visible:false}),
//            		new ol.layer.Tile({
//                    	source: new ol.source.TileWMS({
//                    		url:gisHost+'/geoserver/datum/wms',
//                    		params:{version: '1.1.0', layers:'datum:TG_DESTROYEDAREA'}}),visible:false}),
//            		new ol.layer.Tile({
//                    	source: new ol.source.TileWMS({
//                    		url:gisHost+'/geoserver/datum/wms',
//                    		params:{version: '1.1.0', layers:'datum:TG_PROJECTPOSITION'}}),visible:false})
//                    ];
function mapInit(isMove,divId,exactBounds)
{
	if (curMap != null)
	{
		curMap.updateSize();
		return curMap;
	}
	var isMapMove=true;
//	var bounds = maxExtend;
	var div = 'map';
	if (typeof (exactBounds) != "undefined"
		&& exactBounds instanceof OpenLayers.Bounds) {
		bounds = exactBounds;
	}
	if (typeof (divId) == 'string') {
		div = divId;
	}
	
	if(typeof(isMove)!="undefined")
	{
		isMapMove=isMove;
	}
	
	proj4.defs('EPSG:4490','+title=CGCS2000 (long/lat) +proj=longlat +ellps=CGCS2000 +datum=CGCS2000 +no_defs +units=degrees');
//	var proj4326 = ol.proj.get("EPSG:4326");	//2016-6-7按文件要求修改为cgcs2000 4490
	ol.proj.setProj4(proj4);
	var proj4326 = ol.proj.get("EPSG:4326");
	var proj4490 = ol.proj.get("EPSG:4490");
	var map = new ol.Map({
        target: 'map',
        view: new ol.View({
            center: [116.40969,39.89945],
            zoom: 12,
            maxZoom:18,
            projection: proj4490
        }),           
        controls: [
//           new ol.control.FullScreen(),
//           new ol.control.ZoomSlider(),
//           new ol.control.LayerSwitcher({
//   				'ascending' : false
//   			}),
            new ol.control.ScaleLine()]
    });	   	
	//WMS基础图层
	map.addLayer(new ol.layer.Tile({title:"天地图影像", source: new ol.source.tianditu("影像", { projection: proj4326 }),visible:true}));
	map.addLayer(new ol.layer.Tile({title:"矢量", source: new ol.source.tianditu("矢量", { projection: proj4326 }),visible:false}));
	map.addLayer(new ol.layer.Tile({title:"高程", source: new ol.source.tianditu("高程", { projection: proj4326 }),visible:false}));
	map.addLayer(new ol.layer.Tile({title:"天地图影像注记", source: new ol.source.tianditu("影像注记", { projection: proj4326 }),visible:true}));
//	var tdt = new ol.layer.Tile({title:"天地图影像",source: new ol.source.tianditu("影像", { projection: proj4326 })});
//	var tdt1 = new ol.layer.Tile({title:"天地图影像注记",source: new ol.source.tianditu("影像注记", { projection: proj4326 })});	   		  	
//	map.addLayer(tdt);
//	map.addLayer(tdt1);
	layernames.push("天地图影像");
	layernames.push("矢量");
	layernames.push("高程");
	layernames.push("天地图影像注记");
	layernames.push("监管本底影像");
	for(var i=0;i<baseLayersMeta.length;i++)
	{
		map.addLayer(GetExtendWms(baseLayersMeta[i].ollayer,baseLayersMeta[i].geoLayer, false,proj4326));
//		map.addLayer(baseLayersMeta[i]);
		layernames.push(baseLayersMeta[i].ollayer);
	}
	
	//WMS业务图层
//	busiLayers=new Array();
//    for(var i=0;i<busiLayersMeta.length;i++)
//    {
//    	busiLayers[i]=GetExtendWfs(busiLayersMeta[i].ollayer,busiLayersMeta[i].geoLayer,defaultStyle,false);
//    	map.addLayer(busiLayersMeta[i]);
//    }
	var source = new ol.source.Vector({wrapX: false});
	vector4draw  = new ol.layer.Vector({source: source});
	
	map.addLayer(vector4draw);
	//添加监管影像图层
	$.ajax({
        type: "POST",
        url: jgurl+"/api/XYZTileSource1",
        data: { "dbId": 1, "spaceId": 1, "permId": "3526416365910544921", "filePathName": "监管任务/遥感影像" },
        beforeSend: function () {
        },
        success: function (lyrInfo) {
            jgSource = new ol.source.dt1(jgurl+"/api/XYZTileSource1", lyrInfo, 0);
            var lyr = new ol.layer.Tile({title:"监管本底影像",source:jgSource,visible:false});
            lyr.setExtent([lyrInfo.xMin, lyrInfo.yMin, lyrInfo.xMax, lyrInfo.yMax]);//必须：防止ol的计算bug。
            //可选：lyr.setMaxResolution(lyrInfo.resolutions[0] * 2);
            map.addLayer(lyr);
            jgSource.startHeartbeat(map);
        },
        error: function (jqXHR, exception) {
        }
    });
	
	
	var mapctrlhtml = "";
	for(var i=layernames.length-1;i>=0;i--){
		if(layernames[i]=="天地图影像注记"){
			mapctrlhtml+="<input style='margin-bottom:5px;' type='checkbox' name='"+i+"' id='"+i+"' value='"+layernames[i]+"' checked=true onchange='showOrHiddenlayer(this)'/><font color='white' style='vertical-align: top;'>"+layernames[i]+"</font><br/>";
		}else if(layernames[i]=="天地图影像"||layernames[i]=="高程"||layernames[i]=="矢量"){
			mapctrlhtml+="<input style='margin-bottom:5px;' type='radio' name='dt' value='"+layernames[i]+"' checked="+(layernames[i]=="天地图影像"?true:false)+" onchange='showOrHiddenlayer2(\"dt\")'/><font color='white' style='vertical-align: top;'>"+layernames[i]+"</font><br/>";
		}else if(layernames[i]=="监管本地影像"){
			mapctrlhtml+="<input style='margin-bottom:5px;' type='checkbox' name='"+i+"' id='"+i+"' value='"+layernames[i]+"' onchange='showOrHiddenlayer3(this)'/><font color='white' style='vertical-align: top;'>"+layernames[i]+"</font><br/>";
		}else{
			mapctrlhtml+="<input style='margin-bottom:5px;' type='checkbox' name='"+i+"' id='"+i+"' value='"+layernames[i]+"' onchange='showOrHiddenlayer(this)'/><font color='white' style='vertical-align: top;'>"+layernames[i]+"</font><br/>";
		}
	}
	document.getElementById("showctrl").innerHTML="<div><a href='javascript:void(0);' onclick='showOrHiddenCtrl(\"hiddenctrl\")'><span style='padding: 0 10px;height:25px;vertical-align: top;'>▲隐藏图层控制</span></a></div>"+mapctrlhtml;
	curMap=map;
	return;
}
/**
 * 行政定位
 */
var queryZoneX=function(address)
{
	var layername,addressx=address+",",end=address.length-1;
	if(address.lastIndexOf("省")==end||dis_dic["proinvce"].indexOf(addressx)!=-1)
	{
		layername="province";
	}
	else if(dis_dic["city"].indexOf(addressx)!=-1)
	{
		layername="city";
	}
	else
	{
		layername="county";
	}
	queryZone(layername,address);
};

var queryMarkX=function(data,layername,isZoom,isFlag){
	var colname = "C_PROJECTNUM";
	if(typeof(isZoom)=='undefined'||isZoom==null){
		isZoom=false;
	}
	if(typeof(isFlag)=='undefined'||isFlag==null){
		isFlag=false;
	}
	if(typeof(data)!='undefined'&&data!=null&&data.length>0){
		queryMark(data,layername,colname,isZoom,isFlag);
	}else if(isFlag){
		queryMark(null,layername,colname,isZoom,isFlag);
	}
};

/**
 * 添加项目位置
 */
var addPosition=function(mfeature)
{
//	doAction("deltempFeature");
	positionfeatures.push(mfeature);//添加项目位置到集合中
	if(interactionDraw!=null){
		curMap.removeInteraction(interactionDraw);
		interactionDraw=null;
	}
	return;
};
/**
 * 添加防治责任范围
 */
var addProtArea=function(mfeature)
{
//	doAction("deltempFeature");
	protectfeatures.push(mfeature);//添加项目位置到集合中
	if(interactionDraw!=null){
		curMap.removeInteraction(interactionDraw);
		interactionDraw=null;
	}
	return;
};
///**
// * 删除临时勾绘的项目位置图斑
// */
//var removePositionFeature=function(){
//	if(positionfeatures!=null&&positionfeatures.length>0){
//		for(var i=0;i<positionfeatures.length;i++)
//		{
//			var tmpFeature = positionfeatures[i];
//			if(tmpFeature==selectedFeature)
//			{
//				positionfeatures.splice(i,1);//移除项目位置
//				break;
//			}
//		}
//		var args = ""+selectedFeature.geometry;
//		if(args.indexOf("POINT")>-1){
//			tmpLayers[2].removeFeatures(selectedFeature);
//		}else{
//			tmpLayers[1].removeFeatures(selectedFeature);
//		}
//		onTmpFeatureUnDel();
//	}
//};
///**
// * 删除临时勾绘的防治责任范围图斑
// */
//var removeProtectFeature=function(){
//	if(protectfeatures!=null&&protectfeatures.length>0){
//		for(var i=0;i<protectfeatures.length;i++)
//		{
//			var tmpFeature = protectfeatures[i];
//			if(tmpFeature==selectedFeature)
//			{
//				protectfeatures.splice(i,1);//移除项目位置
//				break;
//			}
//		}
//		tmpLayers[0].removeFeatures(selectedFeature);
//		onTmpFeatureUnDel();
//	}
//};

/*
 * 保存勾绘好的项目位置和防治责任范围图斑
 */
var savePositionsAndProtAreas = function(){
	var positionwkts = '';
	var protectwkts = '';
	//处理项目位置的数组，转换成multipoint或multilinestring
	if(positionfeatures!=null&&positionfeatures.length>0){
		for(var i=0;i<positionfeatures.length;i++ ){
			positionwkts +=","+formatWkt(positionfeatures[i]);
		}
		if(positiontype.indexOf("Point")>-1){
			positionwkts = positionwkts.substring(6);
			positionwkts = "MULTIPOINT("+positionwkts.replace(/,POINT/g, ",")+")";
		}else if(positiontype.indexOf("LineString")>-1){
			positionwkts = positionwkts.substring(11);
			positionwkts = "MULTILINESTRING("+positionwkts.replace(/,LINESTRING/g, ",")+")";
		}
	}
	//处理项目位置的数组，转换成multipolygon
	if(protectfeatures!=null&&protectfeatures.length>0){
		for(var i=0;i<protectfeatures.length;i++ ){
			protectwkts +=","+formatWkt(protectfeatures[i]);
		}
		protectwkts = protectwkts.substring(8);
		protectwkts = "MULTIPOLYGON("+protectwkts.replace(/,POLYGON/g, ",")+")";
	}
	if(positionwkts==''&&protectwkts==''){
		alert("没有需要保存的数据，请先勾绘项目图斑");
		return;
	}
	//遮挡层，防止在通过ajax保存数据时操作系统，影响数据的保存
	$("#floats").show();
	$.ajax({
		  type:'POST',
		  url:proxy+gisHost+"/gissuper/shpediter/savePositionAndProjectarea?mecode="+encryptX(),
		  contentType:'application/x-www-form-urlencoded;charset=UTF-8',  
		  data:{"code":gisComPara.projectNum,"name":gisComPara.projectName,"positionwkt":positionwkts,"protwkt":protectwkts},
		  success:function(reps){
			  if(reps.indexOf("ERROR")>-1||reps.indexOf("10")>-1||reps.indexOf('00')>-1||reps.indexOf('01')>-1){
				  alert("保存失败，请检查填写内容或稍后再试");
				  return;
			  }else if(reps.indexOf('20')>-1){
				  positionfeatures = [];
				  alert("项目位置保存成功，防治责任范围保存失败");
			  }else if(reps.indexOf('02')>-1){
				  protectfeatures = [];
				  alert("防治责任范围保存成功，项目位置保存失败");
			  }else if(reps.indexOf('22')>-1||reps.indexOf('11')>-1||reps.indexOf('21')>-1||reps.indexOf('12')>-1){
				  positionfeatures = [];
				  protectfeatures = [];
				  positiontype = null;
				  alert("保存成功");
				  $("#zbw").window('close');
			  }
			  $("#floats").remove();
			  if(select!=null){
					curMap.removeInteraction(select);
					select=null;
				}
		  },
		  erro:function(){
			  alert("保存失败，请检查填写内容或稍后再试");
			$("#floats").remove();
		  }
	});
};

/**
 * 删除项目位置
 */
var delPosition=function(arg)
{
	$("#floats").show();
	$.ajax({
		  type:'POST',
		  url:proxy+gisHost+"/gissuper/shpediter/deletePosition?mecode="+encryptX(),
		  contentType:'application/x-www-form-urlencoded;charset=UTF-8',  
		  data:{"proPostionId":arg},
		  success:function(reps){
			  if(reps.indexOf("ERROR")>-1){
				  alert("图斑已删除或删除失败，请刷新重试");
				  $("#floats").remove();
				  return;
			  }else{
				  vector4draw.getSource().removeFeature(selectedFeature);
				  curMap.updateSize();
				  alert("删除图斑成功");
				  $("#floats").remove();
			  }
		  },
		  erro:function(){
			  alert("图斑已删除或删除失败，请刷新重试");
			  $("#floats").remove();
		  }
		});
};

/**
 * 删除防治责任范围
 */
var delProtArea=function(arg)
{
	$("#floats").show();
	$.ajax({
		  type:'POST',
		  url:proxy+gisHost+"/gissuper/shpediter/ProtectedArea/delete?mecode="+encryptX(),
		  contentType:'application/x-www-form-urlencoded;charset=UTF-8',  
		  data:{"proAreaId":arg},
		  success:function(reps){
			  if(reps.indexOf("ERROR")>-1){
				  alert("图斑已删除或删除失败，请刷新重试");
				  $("#floats").remove();
				  return;
			  }else{
				  vector4draw.getSource().removeFeature(selectedFeature);
				  curMap.updateSize();
				  alert("删除图斑成功");
				  $("#floats").remove();
			  }
		  },
		  erro:function(){
			  alert("图斑已删除或删除失败，请刷新重试");
			  $("#floats").remove();
		  }
	});
};

/**
 * 点击图斑,选择是否删除临时勾绘的图斑
 */
var onTmpFeatureDel=function(eventArgs)
{
	//没有选中的图斑，也没有点击到图斑上
	if(eventArgs.selected.length<=0&&eventArgs.deselected.length<=0){
		return;
	}
	//有选中的图斑
	if(eventArgs.selected.length>0){
		selectedFeature = eventArgs.selected[0];
	    var args = formatWkt(selectedFeature);//获取图斑信息的主键和所属空间表
		if((args.indexOf("POINT")>-1||args.indexOf("LINE")>-1))//项目位置
		{
			if(positionfeatures!=null&&positionfeatures.length>0){
				for(var i=0;i<positionfeatures.length;i++)
				{
					var tmpFeature = formatWkt(positionfeatures[i]);
					if(tmpFeature==args)
					{
						if(confirm("是否要删除该图斑？")){
							positionfeatures.splice(i,1);//移除项目位置
							vector4draw.getSource().removeFeature(selectedFeature);
							curMap.updateSize();
							break;
						}
					}
				}
			}
		}
		else if(args.indexOf("POLYGON")>-1)//防治责任范围
		{
			if(protectfeatures!=null&&protectfeatures.length>0){
				for(var i=0;i<protectfeatures.length;i++)
				{
					var tmpFeature = protectfeatures[i];
					if(tmpFeature==selectedFeature)
					{
						if(confirm("是否要删除该图斑？")){
							protectfeatures.splice(i,1);//移除项目位置
							vector4draw.getSource().removeFeature(selectedFeature);
							curMap.updateSize();
							break;
						}
					}
				}
			}
		}
	}
};

/**
 * 点击图斑进行删除操作
 */
var onFeatureDelete=function(eventArgs)
{//没有选中的图斑，也没有点击到图斑上
	if(eventArgs.selected.length<=0&&eventArgs.deselected.length<=0){
		return;
	}
	//有选中的图斑
	if(eventArgs.selected.length>0){
		selectedFeature = eventArgs.selected[0];
	    var args = formatWkt(selectedFeature);//获取图斑信息的主键和所属空间表
	    var delflag = false;
		if((args.indexOf("POINT")>-1||args.indexOf("LINE")>-1))//项目位置
		{
			if(positionfeatures!=null&&positionfeatures.length>0){
				for(var i=0;i<positionfeatures.length;i++)
				{
					var tmpFeature = formatWkt(positionfeatures[i]);
					if(tmpFeature==args)
					{
						if(confirm("是否要删除该图斑？")){
							positionfeatures.splice(i,1);//移除项目位置
							vector4draw.getSource().removeFeature(selectedFeature);
							curMap.updateSize();
							alert("删除成功");
							delflag=true;
							break;
						}
					}
				}
				if(!delflag){
					if(selectedFeature.G.C_PROJECTNUM!=gisComPara.projectNum){
					   alert("该图斑不是项目涉及图斑，请选择项目涉及的图斑");
					   return;
					}else if(confirm("是否确认删除所选图形？")){
					   var margs = (selectedFeature.ya).split(".");//获取图斑信息的主键和所属空间表
					   delPosition(margs[1]);
					}
				}else{
					delflag=false;
					return;
				}
			}else{
				if(selectedFeature.G.C_PROJECTNUM!=gisComPara.projectNum){
					   alert("该图斑不是项目涉及图斑，请选择项目涉及的图斑");
					   return;
				}else if(confirm("是否确认删除所选图形？")){
				   var margs = (selectedFeature.ya).split(".");//获取图斑信息的主键和所属空间表
				   delPosition(margs[1]);
				}
			}
		}
		else if(args.indexOf("POLYGON")>-1)//防治责任范围
		{
			if(protectfeatures!=null&&protectfeatures.length>0){
				for(var i=0;i<protectfeatures.length;i++)
				{
					var tmpFeature = protectfeatures[i];
					if(tmpFeature==selectedFeature)
					{
						if(confirm("是否要删除该图斑？")){
							protectfeatures.splice(i,1);//移除项目位置
							vector4draw.getSource().removeFeature(selectedFeature);
							curMap.updateSize();
							delflag=true;
							break;
						}
					}
				}
				if(!delflag){
					if(selectedFeature.G.C_PROJECTNUM!=gisComPara.projectNum){
					   alert("该图斑不是项目涉及图斑，请选择项目涉及的图斑");
					   return;
					}else if(confirm("是否确认删除所选图形？")){
					   var margs = (selectedFeature.ya).split(".");//获取图斑信息的主键和所属空间表
					   delProtArea(margs[1]);
					}
				}else{
					delflag=false;
					return;
				}
			}else{
				if(selectedFeature.G.C_PROJECTNUM!=gisComPara.projectNum){
					   alert("该图斑不是项目涉及图斑，请选择项目涉及的图斑");
					   return;
				}else if(confirm("是否确认删除所选图形？")){
				   var margs = (selectedFeature.ya).split(".");//获取图斑信息的主键和所属空间表
				   delProtArea(margs[1]);
				}
			}
		}
	}
};

/**
 * 点击图斑弹出popup框
 */
var onFeatureSelect=function(eventArgs)
{
	//没有选中的图斑，也没有点击到图斑上
	if(eventArgs.selected.length<=0&&eventArgs.deselected.length<=0){
		hiddenPopup();
		return;
	}
	//有选中的图斑
	if(eventArgs.deselected.length>0){
		hiddenPopup();
	}
	//点击到图斑上
	if(eventArgs.selected.length>0){
		selectedFeature = eventArgs.selected[0];
	    var args = (selectedFeature.ya).split(".");//获取图斑信息的主键和所属空间表
		if(args[0]=="TG_PROJECTPOSITION")//项目位置
		{
			//添加popup框
			var popupHtml = "";
			//如果没有C_PROJECTID=undefinded，说明项目没有标注中心点
			var popupHtml = "<div style='font-size:14px;color:blue'>" +
			"所属项目为: <a title='查看项目详细信息' style='cursor:hand;text-decoration:underline;color:blue' href='taSPcp!mapToWholeProcDetail.action?taSPcp.CBuildProjCode="+selectedFeature.G.C_PROJECTNUM+"&positionFlag=falr' target='_blank'>"+selectedFeature.G.C_PROJECTNAME+"</a>" +
			"</div>";
			makePopup(eventArgs,popupHtml);
		}
		else if(args[0]=="TG_PROTECTEDAREA")//防治责任范围
		{
			var area=Math.round(eventArgs.selected[0].getGeometry().getArea()*100000000)/100;
			//添加popup框
			//如果没有C_PROJECTID=undefinded，说明项目没有标注中心点
			var popupHtml = "<div style='font-size:14px;color:blue'>" +
			"所属项目为: <a title='查看项目详细信息' style='cursor:hand;text-decoration:underline;color:blue' href='taSPcp!mapToWholeProcDetail.action?taSPcp.CBuildProjCode="+selectedFeature.G.C_PROJECTNUM+"&positionFlag=falr' target='_blank'>"+selectedFeature.G.C_PROJECTNAME+"</a>" +
			"<br>图斑面积约: "+area+"(h㎡)"+
			"</div>";
			makePopup(eventArgs,popupHtml);
		}
		else if(args[0]=="TG_DESTROYEDAREA")
		{
			var area=Math.round(eventArgs.selected[0].getGeometry().getArea()*100000000)/100;
			var projname=selectedFeature.G.C_PROJECTNAME;
			var projid = selectedFeature.G.C_PROJECTNUM;
			$("#w").window(
					{
						title:projname+"-扰动图斑",
						top:$("#map").offset().top,
						left:(document.body.scrollWidth-600)/2,
						width:600,
						height:500
					}
			);
			var detailhtml = "<div style='float: left;width: 50%;'><span><strong>图斑编号:</strong> "+selectedFeature.G.N_TBBH+"</span></div>"
						+ "<div style='float: right;width: 50%;'><span><strong>扰动类型:</strong> "+selectedFeature.G.C_RDLX+"</span></div>"
						+ "<div style='float: left;width: 50%;'><span><strong>扰动面积:</strong> "+area+"(h㎡)</span></div>"
						+ "<div style='float: right;width: 50%;'><span><strong>合规性:</strong> "+selectedFeature.G.C_STATUS+"</span></div>"
						+ "<div style='float: left;width: 50%;'><span><strong>施工现状:</strong> "+selectedFeature.G.C_SGXZ+"</span></div>"
						+ "<div style='float: right;width: 50%;'><span><strong>详细地址:</strong> "+selectedFeature.G.C_XXDZ+"</span></div>";
			document.getElementById("showdetail").innerHTML = detailhtml;
			gettree("#w","#trees",projname,projid,selectedFeature.G.N_TBBH);
		}
	}
};

/**
 * @param type 
 */
function doAction(actionKey,aimLayer,type)
{
	if(select!=null){
		hiddenPopup();
		curMap.removeInteraction(select);
		select=null;
	}
	if(interactionDraw!=null){
		curMap.removeInteraction(interactionDraw);
		interactionDraw=null;
	}
	if(actionKey=="drawFeature")
	{
		if("Point,LineString,Polygon".indexOf(type)>-1)
		{
			if("Point".indexOf(type)>-1){
				if(positiontype=="LineString"&&positionfeatures!=null&&positionfeatures.length>0){
					if(confirm("编辑内容中已经存在点状工程，如果添加线状工程，则点状工程则会被覆盖，请问是否选择添加线状工程？")){
						for(var i=0;i<positionfeatures.length;i++)
						{
							vector4draw.getSource().removeFeature(positionfeatures[i]);
							curMap.updateSize();
						}
						positionfeatures=[];
					}else{
						return;
					}
				}
				positiontype = type;
			}else if("LineString".indexOf(type)>-1){
				if(positiontype=="Point"&&positionfeatures!=null&&positionfeatures.length>0){
					if(confirm("编辑内容中已经存在线状工程，如果添加点状工程，则线状工程则会被覆盖，请问是否选择添加点状工程？")){
						for(var i=0;i<positionfeatures.length;i++)
						{
							vector4draw.getSource().removeFeature(positionfeatures[i]);
							curMap.updateSize();
						}
						positionfeatures=[];
					}else{
						return;
					}
				}
				positiontype = type;
			}else if("Polygon".indexOf(type)>-1){
				
			}else{
				alert("不支持"+type+"图形勾绘");
				return;
			}
		}
//		var source = vector4draw.getSource();
//		source.clear();
//		curMap.updateSize();
		curMap.removeInteraction(interactionDraw);
		interactionDraw =new  ol.interaction.Draw(
				{
					source:vector4draw.getSource(),
					type:type
				}
		);
		var ef = function(e)
		{
			if(e!=null){
				var mfeature=e.feature;
				//e.stopPropagation();
				if(aimLayer=='TG_PROTECTEDAREA')
				{
					addProtArea(mfeature);
				}else if(aimLayer=='TG_PROJECTPOSITION'){
					addPosition(mfeature);
				}else{
					alert('请指定业务方法');
				}
			}
			return false;
		};
		interactionDraw.un("drawend",ef);
		interactionDraw.on("drawend",ef);
		curMap.addInteraction(interactionDraw);
	}
	else if(actionKey=="selectFeature")
	{
		var selectClick = new ol.interaction.Select({
		    condition: ol.events.condition.click
		});
		selectClick.on('select',onFeatureSelect);
		select = selectClick;
		curMap.addInteraction(select);
	}
	else if(actionKey=="deleteFeature")
	{
		var selectClick = new ol.interaction.Select({
		    condition: ol.events.condition.click
		});
		selectClick.on('select',onFeatureDelete);
		select = selectClick;
		curMap.addInteraction(select);
	}
//	else if(actionKey=="deltempFeature"){
//		var selectClick = new ol.interaction.Select({
//		    condition: ol.events.condition.click
//		});
//		selectClick.on('select',onTmpFeatureDel);
//		//selectClick.on('select',function(e){onTmpFeatureDel(e);});
//		select = selectClick;
//		curMap.addInteraction(select);
//	}
}

var showOrHiddenlayer3 = function(obj){
	var mlayername = obj.value;
	var mlayervisible = obj.checked;
	if(mlayervisible&&jgSource==null){
		$.ajax({
	        type: "POST",
	        url: jgurl+"/api/XYZTileSource1",
	        data: { "dbId": 1, "spaceId": 1, "permId": "3526416365910544921", "filePathName": "监管任务/遥感影像" },
	        beforeSend: function () {
	        },
	        success: function (lyrInfo) {
	            jgSource = new ol.source.dt1(jgurl+"/api/XYZTileSource1", lyrInfo, 0);
//	            var lyr = new ol.layer.Tile({title:"监管遥感影像",source:jgSource,visible:false});
//	            lyr.setExtent([lyrInfo.xMin, lyrInfo.yMin, lyrInfo.xMax, lyrInfo.yMax]);//必须：防止ol的计算bug。
//	            //可选：lyr.setMaxResolution(lyrInfo.resolutions[0] * 2);
//	            map.addLayer(lyr);
	            jgSource.startHeartbeat(map);
	        },
	        error: function (jqXHR, exception) {
	        }
	    });
	}
	if(curMap.getLayers().a!=null&&curMap.getLayers().a.length>0){
		for(var i=0;i<curMap.getLayers().a.length;i++){
			if(curMap.getLayers().a[i].G.title==mlayername){//从地图中获取要控制的图层
				//如果图层被选中，则设置图层属性为可见；如果图层取消选中，则设置图层属性为不可见；
				if(mlayervisible){
					curMap.getLayers().a[i].G.visible=true;
				}else{
					curMap.getLayers().a[i].G.visible=false;
				}
				curMap.updateSize();
				break;
			}
		}
	}
};

/**
 * shp文件导出
 */
var expiframe = null;
var shapeExport=function(data,ln,isFlag)
{
	if(typeof(isFlag)=='undefined'||isFlag==null){
		isFlag=false;
	}
	var condition = '<Filter><Or>';
	if(data!=null){
	var proList = data.split(",");
	for(var i=0;i<proList.length;i++){
		condition+='<PropertyIsEqualTo><PropertyName>C_PROJECTNUM</PropertyName><Literal>'+proList[i]+'</Literal></PropertyIsEqualTo>';
	}
	}
	if(isFlag){
		if(document.getElementById("CBprojinvpr")!="undefined"&&document.getElementById("CBprojinvpr")!=null){
			var provincename = document.getElementById("CBprojinvpr").value;
			condition+='<PropertyIsLike wildCard=\'*\' singleChar=\'#\' escapeChar=\'!\'><PropertyName>C_PROVINCENAME</PropertyName><Literal>*'+provincename+'*</Literal></PropertyIsLike>';
		}
		if(document.getElementById("CBprojinvct")!="undefined"&&document.getElementById("CBprojinvct")!=null){
			var cityname = document.getElementById("CBprojinvct").value;
			condition+='<PropertyIsLike wildCard=\'*\' singleChar=\'#\' escapeChar=\'!\'><PropertyName>C_CITYNAME</PropertyName><Literal>*'+cityname+'*</Literal></PropertyIsLike>';
		}
		if(document.getElementById("CBprojinvcn")!="undefined"&&document.getElementById("CBprojinvcn")!=null){
			var countyname = document.getElementById("CBprojinvcn").value;
			condition+='<PropertyIsLike wildCard=\'*\' singleChar=\'#\' escapeChar=\'!\'><PropertyName>C_COUNTYNAME</PropertyName><Literal>*'+countyname+'*</Literal></PropertyIsLike>';
		}
	}
	condition+='</Or></Filter>';
	expiframe = document.createElement("form");
	expiframe.style.display="none";
	expiframe.target="";
	expiframe.method="post";
	expiframe.action=WFSUrl;
	var input1=document.createElement("input");
	input1.type="hidden";
	input1.name="version";
	input1.value="1.0.0";
	var input2=document.createElement("input");
	input2.type="hidden";
	input2.name="request";
	input2.value="GetFeature";
	var input3=document.createElement("input");
	input3.type="hidden";
	input3.name="typeName";
	input3.value=ln;
	var input4=document.createElement("input");
	input4.type="hidden";
	input4.name="outputFormat";
	input4.value="SHAPE-ZIP";
	var input5=document.createElement("input");
	input5.type="hidden";
	input5.name="FILTER";
	input5.value=condition;
	var input6=document.createElement("input");
	input6.type="hidden";
	input6.name="format_options";
	input6.value="CHARSET:GBK";
	expiframe.appendChild(input1);
	expiframe.appendChild(input2);
	expiframe.appendChild(input3);
	expiframe.appendChild(input4);
	expiframe.appendChild(input5);
	expiframe.appendChild(input6);
	try{
		document.body.appendChild(expiframe);
		expiframe.submit();
		document.body.removeChild(expiframe);
		}catch(e){
		//alert(e);
	}
};

