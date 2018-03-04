let request = require('request');
let iconv = require('iconv-lite');
let cheerio = require('cheerio');
function getinfo(callback, inf) {
    let obj = undefined;
    if (!inf) {
        callback({
            err: true,
            errtype: "don't has obj"
        })
    }
    else {
        request({
            encoding: null,
            url: 'http://222.24.62.120/default2.aspx',
            method: 'post',
            headers: {
                'Referer': 'http://222.24.62.120/default2.aspx',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip,deflate',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Host': '222.24.62.120',
                'Origin': 'http://222.24.62.120',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
                'Cookie': inf.session,
            },
            form: {
                '__VIEWSTATE': 'dDwxNTMxMDk5Mzc0Ozs+lYSKnsl/mKGQ7CKkWFJpv0btUa8=',
                'txtUserName': inf.name,
                'Textbox1': '',
                'TextBox2': inf.password,
                'txtSecretCode': inf.vercode,
                'RadioButtonList1': '%D1%A7%C9%FA',
                'Button1': '',
                'lbLanguage': '',
                'hidPdrs': '',
                'hidsc': ''
            }
        }, function (err, res, body) {
            if (err) {
                callback({
                    err: true,
                    errtype: "don't get info by default2.aspx"
                })
            }
            else if (!err && res.statusCode == 200) {
                let newbody = iconv.decode(body, "GB2312").toString();
                let $ = cheerio.load(newbody);
                if (!$("#form1").html()) {
                    //登陆成功逻辑
                    // 去爬去详情页信息
                    let name = $("#xhxm").text().split('同学')[0]
                    if (name) {
                        request({
                            url: "http://222.24.62.120/xsgrxx.aspx?xh=" + inf.name + "&xm=" +encodeURI(name)+ '&gnmkdm=N121501',
                            method: "GET",
                            encoding: null,
                            headers: {
                                'Referer':'http://222.24.62.120/xs_main.aspx?xh=' + inf.name,
                                Cookie: inf.session
                            }
                        }, function (err, res, body) {
                            if (err) {
                                console.log(err);
                                callback({
                                    err: true,
                                    errtype: "can't get info by xs_main.aspx",
                                });
                            }
                            if(Math.floor(res.statusCode/100)===3){
                                callback({
                                    err: true,
                                    errtype: "session is out",
                                });
                            }
                            else {
                                let newbody = iconv.decode(body, "GB2312").toString();
                                let $ = cheerio.load(newbody);
                                obj={
                                    username: $("#xh").text(),
                                    name: $("#xm").text(),
                                    sex: $("#lbl_xb").text(),
                                    class: $("#lbl_xzb").text(),
                                }
                                callback({
                                    err: false,
                                    result: {
                                        inf:obj
                                    }
                                });
                            }
                        })
                    }
                    else{
                        callback({
                            err: true,
                            errtype:"not Teaching evaluation||please check your Educational administration system"
                        });
                    }
                }
                else {
                    let errstr = $("#form1").html().split("alert('")[1].split("');")[0];
                    // console.log(errstr);
                    if (errstr == '验证码不正确！！') {
                        // console.log(errstr);
                        callback({
                            err: true,
                            errtype: 'vercode err'
                        });
                    }
                    if (errstr == '密码错误！！') {
                        // console.log(errstr);
                        callback({
                            err: true,
                            errtype: 'password err'
                        });
                    }
                    if (errstr == '用户名不存在或未按照要求参加教学活动！！') {
                        // console.log(errstr);
                        callback({
                            err: true,
                            errtype: "username err"
                        });
                    }
                }
            }
            else {
                callback({
                    err: true,
                    errtype: "severs error"
                });
            }
        });
    }
}
module.exports = getinfo;