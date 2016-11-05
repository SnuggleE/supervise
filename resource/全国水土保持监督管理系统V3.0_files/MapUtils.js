/**
 * 
 */
var WMSUrl=gisHost+"/geoserver/datum/wms";
var WFSUrl=gisHost+"/geoserver/datum/wfs";
var workspaceUrl="http://www.datum.com";//工作区命名空间URI

/**
 * 图层元数据
 * @method layMeta
 * @param ollayer 在openlayers里面的图层名
 * @param geoLayer 在后台服务里的图层名
 * @param prop 字段名，一般是用于做过滤查询的
 */
var layMeta=function(ollayer,geoLayer,prop){
	return {
		ollayer:ollayer,
		geoLayer:geoLayer,
		prop:prop
	};
};

/**
 * 调研GeoServer WMS服务加载地图或影象
 * @param layername openlayers定义的图层名称
 * @param layer geoserver发布的图层名称
 * @param visibility 是否在地图中显示该图层
 * @returns WMS图层
 */
var GetExtendWms = function(layername,layer,visibility,projection){
	  var wms = new ol.layer.Tile({
		  title:layername,
      		source: new ol.source.TileWMS({
      			url:WMSUrl,
      			params:{
      				version: '1.1.0', 
      				layers:'datum:'+layer
      			},
          		projection:projection
      		}),
      		visible:visibility});//扰动图斑
	  return wms;
};

/**
 * 显示popup框口
 */
var makePopup = function(eventArgs,html){
	var container = document.getElementById('popup');
	var content = document.getElementById('popup-content');
	var closer = document.getElementById('popup-closer');
	//openlayers3的pop窗口由ol.Overlay实现
	poplay = new ol.Overlay({
		element: container,
//		autoPan: true,
		autoPanAnimation: {
			duration: 250
		}
	});
	curMap.addOverlay(poplay);
//	closer.onclick = function(){
//		container.style.display = 'none';
////		closer.blur();
//		curMap.removeLayer(poplay);
//		poplay=null;
//		curMap.updateSize();
//		return false;
//	};
	content.innerHTML = html;
	var coordinate = eventArgs.selected[0].getGeometry().A;//pop窗口的显示位置
	poplay.setPosition(coordinate);
	container.style.display = 'block';
};

/**
 * 隐藏popup框口
 */
var hiddenPopup = function(){
	if(poplay!=null){
		document.getElementById('popup').style.display = 'none';//隐藏pop窗口
		curMap.removeLayer(poplay);
		poplay=null;
		return;
	}
};

/**
 * 行政区查询定位。
 */
var queryZone=function(layername,val){
	var url = proxy+WFSUrl;
	/*+'?service=WFS&version=1.1.0&'
	+'request=GetFeature&typeNames='+layername+'&'+
	'outputFormat=application/json&srsname=EPSG:4326&';	*/
	var condition = '<Filter><PropertyIsEqualTo><PropertyName>NAME</PropertyName><Literal>'+val+'</Literal></PropertyIsEqualTo></Filter>';
	$.ajax({
		type:"post",
		data:{'service':'WFS','version':'1.1.0','request':'GetFeature','typeNames':layername,'outputFormat':'application/json',
			'srsname':'EPSG:4490','FILTER':condition},
		url:url,
		success:function(resp)
		{
			var o = new ol.format.GeoJSON();
			if(resp.features!=null&&resp.features.length>0){
				var feature=o.readFeature(resp.features[0]);  
				var extent = feature.getGeometry().getExtent();
				var view =curMap.getView(); 			
				view.fit(extent, curMap.getSize());
			}
		}
	});	
};

/**
 * 项目图斑查询。
 */
var queryMark=function(data,layername,propertyName,isZoom,isFlag){
	var url = proxy+WFSUrl;	
	var condition = '<Filter><Or>';
	if(data!=null){
	var proList = data.split(",");
	for(var i=0;i<proList.length;i++){
		condition+='<PropertyIsEqualTo><PropertyName>'+propertyName+'</PropertyName><Literal>'+proList[i]+'</Literal></PropertyIsEqualTo>';
	}
	}
	
	if(isFlag){
		if(document.getElementById("CBprojinvpr")!="undefined"&&document.getElementById("CBprojinvpr").value!=null&&document.getElementById("CBprojinvpr").value!=''){
			var provincename = document.getElementById("CBprojinvpr").value;
			condition+='<PropertyIsLike wildCard=\'*\' singleChar=\'#\' escapeChar=\'!\'><PropertyName>C_PROVINCENAME</PropertyName><Literal>*'+provincename+'*</Literal></PropertyIsLike>';
		}
		if(document.getElementById("CBprojinvct")!="undefined"&&document.getElementById("CBprojinvct").value!=null&&document.getElementById("CBprojinvct").value!=''){
			var cityname = document.getElementById("CBprojinvct").value;
			condition+='<PropertyIsLike wildCard=\'*\' singleChar=\'#\' escapeChar=\'!\'><PropertyName>C_CITYNAME</PropertyName><Literal>*'+cityname+'*</Literal></PropertyIsLike>';
		}
		if(document.getElementById("CBprojinvcn")!="undefined"&&document.getElementById("CBprojinvcn").value!=null&&document.getElementById("CBprojinvcn").value!=''){
			var countyname = document.getElementById("CBprojinvcn").value;
			condition+='<PropertyIsLike wildCard=\'*\' singleChar=\'#\' escapeChar=\'!\'><PropertyName>C_COUNTYNAME</PropertyName><Literal>*'+countyname+'*</Literal></PropertyIsLike>';
		}
	}
	condition+='</Or></Filter>';
	$.ajax({
		type:"post",
		url:url,
		data:{'service':'WFS','version':'1.1.0','request':'GetFeature','typeNames':layername,'outputFormat':'application/json',
			'srsname':'EPSG:4490','FILTER':condition},
		success:function(resp)
		{
			var o = new ol.format.GeoJSON();
			//如果查询到项目涉及的图斑，则加载到地图上
			if(resp.features!=null&&resp.features.length>0){
				var source = vector4draw.getSource();
				source.clear();
				for(var i=0;i<resp.features.length;i++){
					source.addFeature(o.readFeature(resp.features[i]));
				}
				if(isZoom){//地图定位到第一个图斑上，并根据图斑进行地图的缩放
					var feature=o.readFeature(resp.features[0]);  
					var extent = feature.getGeometry().getExtent();
					var view =curMap.getView(); 			
					view.fit(extent, curMap.getSize());
				}
				curMap.updateSize();
			}else{
				alert('未查询到涉及图斑');
			}
		}
	});	
};
/**
 * 从feature中读取wkt值
 */
var formatWkt = function (feature){
	var o = new ol.format.WKT();
	return o.writeFeature(feature);
};

/**
 * 多选图层叠加控件--控制多个业务图层的叠加
 */
var showOrHiddenlayer=function (obj){
	var mlayername = obj.value;
	var mlayervisible = obj.checked;
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
 * 单选图层叠加控件--控制基础图层（影像、高程、矢量的叠加）
 */
var showOrHiddenlayer2=function (objid){
	var mobjs = document.getElementsByName(objid);
	if(curMap.getLayers().a!=null&&curMap.getLayers().a.length>0){
		for(var j=0;j<mobjs.length;j++){
			var mobj = mobjs[j];
			for(var i=0;i<curMap.getLayers().a.length;i++){
				if(curMap.getLayers().a[i].G.title==mobj.value){//从地图中获取要控制的图层
					//如果图层被选中，则设置图层属性为可见；如果图层取消选中，则设置图层属性为不可见；
					if(mobj.checked){
						curMap.getLayers().a[i].G.visible=true;
					}else{
						curMap.getLayers().a[i].G.visible=false;
					}
					curMap.updateSize();
					break;
				}
			}
		}
	}
};
/**
 * 图层叠加控件--控制控件的收放
 */
var showOrHiddenCtrl=function (objid){
	if(objid=="showctrl"){
		document.getElementById("hiddenctrl").style.display="none";
		document.getElementById("showctrl").style.display="block";
	}else{
		document.getElementById("showctrl").style.display="none";
		document.getElementById("hiddenctrl").style.display="block";
	}
};