/**
 * Created by bjwsl-001 on 2016/11/1.
 */
var wave=document.getElementById("wave");
var ctx=wave.getContext("2d");
var h=500;
var w=innerWidth;
wave.width=w;
wave.height=h;
var x=0;
var y=h/2;
var rise=0;
var right=0;
var dir=1;
var v=0;
var timer=setInterval(function(){
    ctx.clearRect(0,0,w,h);
    ctx.beginPath();
    x=0;
    ctx.fillStyle="rgba(0,122,192,0.5)";
    ctx.moveTo(x,50*Math.sin((x+right)*Math.PI/180)+y+rise);
    for(;x<w;x++){
        ctx.lineTo(x,50*Math.sin((x+right)/1.2*Math.PI/180)+y+v);
    }
    ctx.lineTo(w,h);
    ctx.lineTo(0,h);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    x=0;
    ctx.moveTo(x,50*Math.sin((x+right+10)*Math.PI/180)+y+rise);
    for(;x<w;x++){
        ctx.lineTo(x,50*Math.sin((x+right+1000)/1.8*Math.PI/180)+y+v);
    }
    ctx.lineTo(w,h);
    ctx.lineTo(0,h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle="white";
    ctx.font="32px 微软雅黑";
    var textWidth=ctx.measureText("欢迎进入全国水土保持监督管理系统！");
    ctx.fillText("欢迎进入全国水土保持监督管理系统！",(w-textWidth.width)/2,300);
    right+=2;
    rise+=dir*0.2;
    v=-Math.pow(rise,2)+h/4;
    if(rise<=-5){
        dir=1;
    }
    else if(rise>=10){
        dir=-1;
    }
},15);

