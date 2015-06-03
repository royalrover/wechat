/**
 * the script of the application .
 */
var express = require("express");
var app = express(),
    superAgent = require("superagent"),
    cheerio = require("cheerio"),
    fetch = require("./fetch.js");
// 需要抓取的url列表
var urls = ["http://www.chinatax.gov.cn/middleindex.html"];
app.use("/",function(req,res,next){
    fetch.fetchChinaTaxOfPolicy(urls[0],req,res,next)
});
app.listen(80, function () {
    console.log('app is listening at port 80');
});