drop database if exists supervise;
create database supervise charset=utf8;
use supervise;
/************ 用户信息表 *************/
create table sys_user(
user_no int auto_increment primary key,
user_name varchar(20),
user_pwd varchar(32),
user_type varchar(50) #0:水行政主管部门   1 技术审查单位  2 系统管理员
);
insert into sys_user values(null,'刘建坤','5d93ceb70e2bf5daa84ec3d0cd2c731a','水行政主管部门');
insert into sys_user values(null,'王刚','5d93ceb70e2bf5daa84ec3d0cd2c731a','水行政主管部门');
insert into sys_user values(null,'监测中心','5d93ceb70e2bf5daa84ec3d0cd2c731a','技术审查单位');

/*项目列表*/
create table pro_list(
pro_no int auto_increment primary key,#项目数字编号  自增数字
pro_name varchar(200),#项目名称
pro_builder varchar(32),#项目建设单位编号
pro_schema varchar(32)#方案编号
); 
#建设单位信息表
create table builder_list(
builder_no int auto_increment primary key,#项目数字编号  自增数字
pro_name varchar(200),#项目名称
pro_builder varchar(32),#项目建设单位编号
pro_schema varchar(32)#方案编号
);
/* 空间信息表 */
create table position(
id int primary key auto_increment,#图形编号 主键  自增
pro_id varchar(32),#相关项目id
graph_type int,#1 点 2 线 3 面
location varchar(1000)# 坐标串   每一个坐标对以括号的形式出现 中间以字符串隔开
);