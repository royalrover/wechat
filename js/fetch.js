/**
 * to fetch HTML
 */
var superAgent = require("superagent"),
    cheerio = require("cheerio"),
    URL = require("url"),
    Path = require("path"),
    q = require("q");
var fetchChinaTax = function(url,req,res,next){
        var deferred = q.defer();
        superAgent.get(url)
        .end(function(err,html){
            if(err)
                return next(err);

        //    console.log(html.text);
            // 获取返回的文档内容，并解析
            var $ = cheerio.load(html.text);


            var subUrls = [];
            if($(".ctop3a > ul > li").length){
                var lis = $(".ctop3a > ul > li");
                lis.each(function(i,li){
                    var $li = $(li),
                        t = $li.text();
                    if(t.indexOf("税收政策") !== -1){
                        subUrls.push(URL.resolve(url,$li.find("a").attr("href")));
                        // 输出抓取的url
                        console.log(subUrls.length,subUrls.join(" ,"));
                        deferred.resolve(subUrls);
                    }
                })
            }
        });
        return deferred.promise;
};
var fetchChinaTaxOfPolicy = function(url,req,res,next){
    var jsonData = {
        newestFiles: [],
        policyAnalysis: []
    };
    fetchChinaTax(url,req,res,next)
    .then(function(urls){
        if(urls.length == 0)
            throw new Error("can not find the link of ‘税收政策’");
        // 获取税收政策
        superAgent.get(urls[0])
        .end(function(err,data){
            if(err) return next(err);
            var $ = cheerio.load(data.text);
            // 抓取“最新文件”和“政策解读”一栏
            // id="menua0" "menua1"
            var nf,pr,dds,
                nfData = jsonData.newestFiles,
                prData = jsonData.policyAnalysis;
            if($("#menua0").length){
                nf = $("#menua0"); // 最新文件
                dds = nf.find("dd"); // 获取该div table内的所有dd
                dds.each(function(i,dd){
                    var a = $("a",dd),
                        span = a .find("span"),
                        updateTime,title;
                    updateTime = span.text();
                    span.remove();
                    title = a.text();
                    nfData.push({
                        title: title.replace(/[\r\n]/g,""),
                        updateTime: updateTime,
                        url: URL.resolve(url,Path.normalize(a.attr("href")))
                    })

                    console.log("最新文件",updateTime,title,URL.resolve(url,Path.normalize(a.attr("href"))));
                });
            }

            if($("#menua1").length){
                pr = $("#menua1"); // 政策解读
                dds = pr.find("dd"); // 获取该div table内的所有dd
                dds.each(function(i,dd){
                    var a = $("a",dd),
                        span = a .find("span"),
                        updateTime,title;
                    updateTime = span.text();
                    span.remove();
                    title = a.text();
                    prData.push({
                        title: title.replace(/[\r\n]/g,""),
                        updateTime: updateTime,
                        url: URL.resolve(url,Path.normalize(a.attr("href")))
                    })

                    console.log("政策解读",updateTime,title,URL.resolve(url,Path.normalize(a.attr("href"))));
                });
            }
            // 最终输出的结果为 jsonData
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('<head><meta charset="utf-8"/></head>');
            res.end(JSON.stringify(jsonData));
        })
    })
    .catch(function(err){
        console.log("fetch the policy encounter an error!");
    })
};

exports.fetchChinaTaxOfPolicy = fetchChinaTaxOfPolicy;
