/**
 * Created by ljk on 2016/11/14.
 */

$(function(){
    $("#header").load('data/header.php',headMenuInit());
    $("#footer").load('data/footer.php');
    function headMenuInit(){
        console.log(document.querySelector('div.menu>ul>li>ul'));
        $('div.menu>ul>li>ul').css('display','none');
        $('#header').on('mouseenter','div.menu>ul>li',function(){
            $(this).children('ul').fadeIn('normal');
        });
        $('#header').on('mouseleave','div.menu>ul>li',function(){
            $(this).children('ul').fadeOut('normal');
        });
    }
    //headMenuInit();
});