//构造方法
//参数：
//提供层图片数据的”根url“（字符串）
//层信息（对象，含有服务端提供的某地拓栅格数据集的相关信息）
//sample（要使用的栅格数据集的通道。通常是0）
ol.source.dt1 = function (rootUrl, lyrInfo, sample) {
    var options = {
        projection:lyrInfo.crs_wkt,
        tileSize: [lyrInfo.tileCols, lyrInfo.tileRows],
        //tileUrlFunction: function (coordinate)
        //{
        //    var url = rootUrl+"/?sourceId=" + lyrInfo.sourceId + "&sample=" + sample
        //        + "&z=" + coordinate[0]
        //        + "&y=" + ((-coordinate[2]) - 1)
        //        + "&x=" + coordinate[1];
        //    return url;
        //},
        url: rootUrl + "?sourceId=" + lyrInfo.sourceId + "&sample=" + sample + "&z={z}" + "&y={y}" + "&x={x}",
        tileGrid: new ol.tilegrid.TileGrid(
        {
            extent: ol.extent.boundingExtent([[lyrInfo.xMin, lyrInfo.yMin], [lyrInfo.xMax, lyrInfo.yMax]]),
            resolutions: lyrInfo.resolutions
            //extent: ol.extent.boundingExtent([[lyrInfo.xMin, lyrInfo.yMin], [lyrInfo.xMax * 10000, lyrInfo.yMax * 10000]]),
            //resolutions: [80000, 40000, 20000, 10000]
        })
    };
    ol.source.XYZ.call(this, options);
    this.rootUrl = rootUrl;
    this.sourceId = lyrInfo.sourceId;
    //心跳间隔
    this.heartbeatInterval = lyrInfo.lifetime - 10;//提前10秒
    if (this.heartbeatInterval < 1) this.heatbeatInterval = 1;
    this.heartbeatInterval *= 1000;
};
ol.inherits(ol.source.dt1, ol.source.XYZ);
//内部函数
ol.source.dt1.prototype.isInDOMTree = function (node) {
    // If the farthest-back ancestor of our node has a "body"
    // property (that node would be the document itself), 
    // we assume it is in the page's DOM tree.
    return !!(this.findUltimateAncestor(node).body);
}
//内部函数
ol.source.dt1.prototype.findUltimateAncestor = function (node) {
    // Walk up the DOM tree until we are at the top (parentNode 
    // will return null at that point).
    // NOTE: this will return the same node that was passed in 
    // if it has no ancestors.
    var ancestor = node;
    while (ancestor.parentNode) {
        ancestor = ancestor.parentNode;
    }
    return ancestor;
}
//内部函数
ol.source.dt1.prototype.isStillInUse = function (map) {
    //先看地图的目标元素是否还在dom树中
    try {
        if (!this.isInDOMTree(map.getTargetElement()))
            return false;
    }
    catch (err) { return false; }
    //在看地图的各个层，是否还有使用当前对象作为源的
    var layers = map.getLayers();
    for (var i = layers.getLength() - 1; i >= 0; --i) {
        try {
            if (layers.item(i).getSource() == this)
                return true;
        }
        catch (err) { }
    }
    return false;
};
//内部函数
ol.source.dt1.prototype.heartbeatOrDie = function (die) {
    if (!this.sourceId) return;
    try {
        $.ajax({
            type: "GET",
            url: this.rootUrl + "?sourceId=" + this.sourceId + "&release=" + die
        });
    }
    catch (err) { }
    if (die)
        this.sourceId = null;
};
//内部函数
ol.source.dt1.prototype.heartbeat0 = function (source) {
    if (source.map == undefined)
        return;
    var release = !source.isStillInUse(source.map);
    source.heartbeatOrDie(release);
    if (!release)
        window.setTimeout(source.heartbeat0, source.heartbeatInterval, source);
};
//开始心跳（维持可用）
//参数是一个openlayers的map对象
ol.source.dt1.prototype.startHeartbeat = function (map) {
    if (this.map != undefined)
        throw "!";
    this.map = map;
    this.heartbeatOrDie(false);//马上ping一次
    window.setTimeout(this.heartbeat0, this.heartbeatInterval, this);
}
//废弃（释放服务端资源）
ol.source.dt1.prototype.dispose = function () {
    this.heartbeatOrDie(true);
};
