/**
 * Method: addSelect
 * 生成一个下拉框展示到页面对应的div中
 * Parameters:
 * 		url: 获取下拉菜单内容的url
 *      selectId：下拉菜单的id属性值
 *      selectName:下拉菜单的name属性值
 *      divId：放置下拉菜单内容的div的id
 * Returns:
 */
function addSelect(url,selectId,selectName,divId)
{
	$.ajax({			
			url:encodeURI(url),
			method:"POST",
			success:function(data)
			{
				var texts=$.trim(data).replace(/\"/g,"");
				var strArr = texts.split(",");
				var select="<select id='"+selectId+"' name='"+selectName+"' style='width:155px;margin-bottom:8px;'>";
					select+= "<option value=''>---------请选择---------</option>";
				for(var i=0;i<strArr.length;i+=2)
				   {  
					if(strArr[i]!=null&&strArr[i]!=''){
						select+="<option value="+strArr[i]+">"+strArr[i+1]+"</option>"
					}
				   }
				select+="</select>";
				$("#"+divId).html(select);
			}
		});
}

/**
 * 公用的添加方法 
 */
function addRow(id){
	var addTr =  $(id+" tbody tr:eq(0)");
	var str = "<tr>"+addTr.html()+"</tr>";
	$(id+" tr:last()").before(str);
}


/**
 * 动态添加一行,以后删除行的公用方法
 */
function publicDelRow(obj){
	var cont = $(obj).parents("tbody").find("tr").length;
	if(cont >2){
		$(obj).parents("tr").remove();
	}else{
		alert("对不起,无法删除!");
		$(obj).parents("tbody").find("tr").eq(0).find("input").val("");
	}
}

/*
 * Class: download 
 * 从多媒体文件管理服务中下载文件
 * Parameters:
 * fileName-{String}-文件名  必选
 * path-{string}-web路径  可选
 * doObj-{object}-域（窗体）对象  可选
 * Returns:
 */
function download(fileName,path,doObj)
{
	if(doObj==undefined)
	{
		doObj=window;
	}
	if(path==undefined)
	{
		path="";
	}
	fileName=encodeURI(fileName);
	doObj.location.href=path+"/FileManageServlet?method=download&fileName="+fileName+"&mecode="+encryptX()+"&"+Math.random(1000000);
};
/*
 * pdf在线浏览
 * Class: pdfReader 
 * Parameters:
 * Returns:
 */
function PdfReader(fileName)
{
	var self = this;
	var fN = fileName; //用一个会出现Erro————Parameters: Character decoding failed.
	var fS =1024*1024*100;//100M
	var clsName="";
	var readType="#toolbar=0&navpanes=0&view=FitH&page=1&viewrect=wh";
	var readURL = "/FileManageServlet?method=readFileByFileName&fileName=";
	var downURL = "/FileManageServlet?method=download&fileName=";
	var fsURL = "/FileManageServlet?method=fetchFileSize&fileName=";
	
	
	self.webAppPath="";
	//设置样式名称
	self.setUploadCls=function(ul_cls)
	{
		self.cls_upload=ul_cls; 
	};
	//设置WEB路径
	self.setWebAppPath=function(wp)
	{
		self.webAppPath=wp;
	};	
	self.makeUI=function(ctr,doObj)
	{		
		if(doObj==undefined)
		{
			doObj=window;
		}				
		$.ajax({
			url :self.webAppPath+fsURL+fN+"&mecode="+encryptX()+"&"+Math.random(1000000),
			method:"GET",
			success : function(response) {
				if(response<fS)
				{
					var pdfReader = doObj.document.createElement("IFRAME");		
					pdfReader.setAttribute('width','100%');
					pdfReader.setAttribute('height',768);		
					pdfReader.setAttribute('border',0);		
					pdfReader.setAttribute('atomicselection',false);				
					if(typeof ctr == 'object'&&ctr!=null)
					{
						ctr.append(pdfReader);
					}
					else
					{
						doObj.document.body.appendChild(pdfReader);	
					}	
					pdfReader.setAttribute('src',self.webAppPath+readURL+fN+readType+"&mecode="+encryptX()+"&"+Math.random(1000000));	
				}
				else
				{
					alert("由于文件过大，为了不影响浏览速度，系统为您生成了下载链接，请点击“确定”");
					var pdfDNer = doObj.document.createElement("A");
					pdfDNer.setAttribute("href",self.webAppPath+downURL+fN+"&mecode="+encryptX()+"&"+Math.random(1000000));
					pdfDNer.innerHTML=fileName;
					if(typeof ctr == 'object'&&ctr!=null)
					{
						ctr.appendChild(pdfDNer);
					}
					else
					{
						doObj.document.body.appendChild(pdfDNer);	
					}	
				}
			}
		});
	
	};	
};
	/**
	 * 公用的关闭按钮方法
	 */
	function publicClose(){
		window.opener=null;
		window.open('','_self','');
		window.close();
	}
	var isIE = /msie/i.test(navigator.userAgent) && !window.opera;
	function fileChange(target,textId) {
		var fileSize = 0;
		var filetypes = [ ".pdf"];
		var filepath = target.value;
		var filemaxsize = 104857600;// 200KB
		if (filepath) {
			var isnext = false;
			var fileend = filepath.substring(filepath.lastIndexOf("."));
			if (filetypes && filetypes.length > 0) {
				for (var i = 0; i < filetypes.length; i++) {
					if (filetypes[i] == fileend) {
						isnext = true;
						break;
					}
				}
			}
			if (!isnext) {
				alert("不接受此文件类型！");
				target.value = "";
				/*var textContent=document.getElementById(textId);
				textContent.value="";*/
				$(target).siblings("input[type='text']").val(target.value);
				return false;
			}
		} else {
			return false;
		}
//		if (isIE && !target.files) {
//			var filePath = target.value;
//			var fileSystem = new ActiveXObject("Scripting.FileSystemObject");
//			if (!fileSystem.FileExists(filePath)) {
//				alert("附件不存在，请重新输入！");
//				return false;
//			}
//			var file = fileSystem.GetFile(filePath);
//			fileSize = file.Size;
//		} else {
//			fileSize = target.files[0].size;
//		}
//		var size = fileSize / 1024;
//		if (size > filemaxsize) {
//			alert("附件大小不能大于" + filemaxsize + "kb！");
//			target.value = "";
//			return false;
//		} else {
//			return true;
//		}
//		if (size <= 0) {
//			alert("附件大小不能为0M！");
//			target.value = "";
//			return false;
//		}
	}
	
	/**
	 * 公用的上传控件点击/赋值方法
	 */
	var fileChangeValue=function(obj){
		if(obj.value.indexOf('\\')>0){
			$(obj).siblings("input[type='text']").val(obj.value.substring(12));
			$(obj).siblings("input[type='text']").attr("title",obj.value.substring(12));
		}else{
			$(obj).siblings("input[type='text']").val(obj.value);
			$(obj).siblings("input[type='text']").attr("title",obj.value);
		}
		$(obj).parent("div").siblings("div").html("");
		$(obj).parent("div").siblings("input[type='hidden']").val("1");
	} ;

	var fileClick=function(obj){
		$(obj).siblings("input[type='file']").click();
	} ;
	
	//方案录入设置区域信息
	function setAreaInfo(textAreaId,hiddenInputId,selectId){
		//如果选择了一条记录
		var selectedId = $("#"+selectId).val();
		if(""!=selectedId){
			//获取到隐藏域的流域或者省的id串
			var hiddenId = $("#"+hiddenInputId).val();
			//如果不为空
			if(""!=hiddenId&&"undefined"!=hiddenId){
				//如果选择的流域或者省不在已经选择了的流域或者省当中，那么将id添加进去
				var hiddenIdArr = hiddenId.split(",");
				var flag = true;
				for(var i = 0 ;i<hiddenIdArr.length;i++){
					if(selectedId==hiddenIdArr[i]){
						flag = false;
						return;
					}
				}
				if(flag){
					$("#"+hiddenInputId).val(hiddenId+","+selectedId);
					$("#"+textAreaId).val($("#"+textAreaId).val()+"、"+$("#"+selectId+" option:selected").text());
				}
			//如果为空
			}else{
				$("#"+hiddenInputId).val(selectedId);
				$("#"+textAreaId).val($("#"+selectId+" option:selected").text());
			}
		}
	}
	
	/**
	 * 格式化时间
	 */
	Date.prototype.Format = function (fmt) { //author: meizz 
	    var o = {
	        "M+": this.getMonth() + 1, //月份 
	        "d+": this.getDate(), //日 
	        "h+": this.getHours(), //小时 
	        "m+": this.getMinutes(), //分 
	        "s+": this.getSeconds(), //秒 
	        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
	        "S": this.getMilliseconds() //毫秒 
	    };
	    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	    for (var k in o)
	    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	    return fmt;
	};
	
	
	
	
	
	//方案录入删除区域信息时，对相应信息进行修改
	function deleteAreaInfo(textAreaId,hiddenInputId,selectId){
		//获取textArea的文本
		var textAreaCon = $("#"+textAreaId).val(); 
		//textArea的文本数组
		var textAreaConArr=textAreaCon.split("、");
		//隐藏域区域id串
		var hiddenId ="";
		//新的textArea的内容
		var newTextAreaCon = "";
		for(var i = 0;i<textAreaConArr.length;i++){
			$("#"+selectId+" option").each(function(){
				if(textAreaConArr[i]==$(this).text()){
					hiddenId +=$(this).val()+",";
					newTextAreaCon += $(this).text()+"、";
				}
			});
		}
		if(""!=hiddenId){
			hiddenId = hiddenId.substring(0,hiddenId.length-1);
		}
		if(""!=newTextAreaCon){
			newTextAreaCon = newTextAreaCon.substring(0,newTextAreaCon.length-1);
		}
		$("#"+hiddenInputId).val(hiddenId);
		$("#"+textAreaId).val(newTextAreaCon);
	}
	
	/**
	 * 去掉字符串两边的空格
	 */
	function removeBlank(obj){
		$(obj).val($.trim($(obj).val()));
	}
	/**
	 * 由于ie不支持带参数的new Date所以写了一个所有浏览器都兼容的方法
	 * @param str
	 * @returns {Date}
	 */
	function NewDate(str){
		str=str.split('-');
		var date=new Date();
		date.setUTCFullYear(str[0], str[1]-1, str[2]);
		date.setUTCHours(0, 0, 0, 0);
		return date;
	}