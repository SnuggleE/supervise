ol.source.tianditu = function (layerType, options) {
    var url = "http://t{0-7}.tianditu.com/" + this.layerType[layerType][1];
    url += "/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=" + this.layerType[layerType][0];
    url += "&tileMatrixSet=c&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles";
    options.url = url;
    ol.source.XYZ.call(this, options);
};
ol.inherits(ol.source.tianditu, ol.source.XYZ);      
//图层类别都是栅格瓦片。有矢量（以合成为栅格形式） 、带注记的矢量、影像、带注记的影像、高程、带注记的高程
ol.source.tianditu.prototype.layerType = {
    "矢量":["vec","vec_c"],
    "矢量注记":["cva","cva_c"],
    "影像":["img","img_c"],
    "影像注记":["cia","cia_c"],
    "高程":["ter","ter_c"],
    "高程注记":["cta","cta_c"]
};
 