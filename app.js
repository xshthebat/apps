let express = require('express');
let getverCode = require('./libs/person/getvercode'); //取得验证码
let getinfo = require('./libs/person/getinfo');//获取信息
let adminmethod = require('./libs/admin/admin'); //管理员数据库的一些方法
let session = require('express-session');
let cookieParser = require('cookie-Parser');
let MongoStore = require('connect-mongo')(session);
let app = express();
app.use(cookieParser('person session'));
app.use(['/getinformation', '/login', '/getverCode'], session({
    secret: 'person session',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        url: 'mongodb://192.168.1.102/' + 'app_session',
        port: 27017
    }),
    name: 'inf',
    cookie: {
        maxAge: 10 * 3600
    }
}));
app.use(function (req, res, next) {
    //判断请求类型
    req.jsonp = false;
    console.log('Request Type:', req.method);//查看请求类型
    if (req.query.callback) {
        req.jsonp = true;
    }
    //处理跨域
    else {
        // console.log(req.headers);
        if (req.headers.origin) {
            res.header("Access-Control-Allow-Origin", req.headers.origin); //线上测试cookie
            res.header("Access-Control-Allow-Credentials", true);  //直有具有origin的来源浏览器才会给带上origin不然为null。。很重要
        }
        else {
            res.header("Access-Control-Allow-Origin", '*'); //静态页面
        }
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    }
    next();
})
app.get('/', function (req, res) {
    if (req.jsonp) {
        res.jsonp({ err: true, errtype: "don't has api" });
    }
    else {
        res.json({ err: true, errtype: "don't has api" });
    }
    console.log('请求默认地址');
    res.end();
})
app.get('/getverCode', function (req, res, next) {
    if (req.session.access) {
        console.log('已经登陆 返回情况');
        adminmethod.find({ all: false, conditions: {username:req.session.personinf.username }}, function (obj) {
            if (obj.err && obj.errtype != "can't collection mongod") {
                if (req.jsonp) {
                    res.jsonp({
                        err: false, obj: {
                            type: 'it has access',
                            inf: req.session.personinf
                        }
                    }); //获取验证码不需要参数
                }
                else {
                    res.json({
                        err: false, obj: {
                            type: 'it has access',
                            inf: req.session.personinf
                        }
                    });
                }
            } else{
                if (req.jsonp) {
                    res.jsonp({
                        err: false, obj: {
                            type: 'it has login',
                            inf: obj.result[0]
                        }
                    }); //获取验证码不需要参数
                }
                else {
                    res.json({
                        err: false, obj: {
                            type: 'it has login',
                            inf: obj.result[0]
                        }
                    });
                }
            }
        })
    } else {
        next();
    }
}, function (req, res, next) {
    if (JSON.stringify(req.query) != '{}') {
        if (req.jsonp) {
            res.jsonp({ err: true, errtype: 'get vercode too mary params' }); //获取验证码不需要参数
        }
        else {
            res.json({ err: true, errtype: 'get vercode too mary params' });
        }
    }
    else
        next();
}, function (req, res, next) {
    getverCode(function (obj) {
        if (obj) {
            req.vercode = obj;
            next();
        }
    });
}
    , function (req, res) {
        if (req.jsonp) {
            res.jsonp(req.vercode);
        }
        else {
            res.json(req.vercode);
        }
        console.log('提供验证码!');
        res.end();
    });




// 获取信息 验证接口 通过则其存在教务，没有则out  
//1.判断有无参数 2.判断参数是否合法  加若存在就返回access 3.验证教务，并且爬取信息若其中一项错误，就返回err
//4.加:验证session 对个人信息编码成session(之后报名都要带这个东西)不然无效    5.最终返回结果josn以及编码的session
app.get('/getinformation', function (req, res, next) {
    if (JSON.stringify(req.query) == '{}') {
        if (req.jsonp) {
            res.json({ err: true, errtype: 'get info no params' }); //获取信息没有参数
        }
        else {
            res.json({ err: true, errtype: 'get info no params' });
        }
    }
    else
        next();
}, function (req, res, next) {
    console.log('获取参数');
    if (req.query.name && req.query.password && req.query.session && req.query.vercode) {
        req.information = {
            name: req.query.name,
            password: req.query.password,
            vercode: req.query.vercode,
            session: req.query.session
        }
        next();
    }
    else {
        console.log('参数错误');
        if (req.jsonp) {
            res.jsonp({ err: true, errtype: 'Please check the number and type of the parameters' });
        }
        else {
            res.json({ err: true, errtype: 'Please check the number and type of the parameters' });
        }
    }
},function (req, res, next) {
    getinfo(function (obj) {
        if (obj) {
            req.info = obj;
            if (!obj.err) {
                req.session.access = true;
                req.info = {
                    err: false,
                    result: {
                        state: 'access', //未报名状态
                        stateobj:obj.result.inf
                    }
                }
                req.session.personinf = obj.result.inf; //报名者的信息
            }
            next();
        }
    }, req.information);
}, function (req, res) {
    if (req.jsonp) {
        res.jsonp(req.info);
    }
    else {
        res.json(req.info);
    }
})


app.get('/login', function (req, res, next) {
    //检验参数
    // console.log(req.query);
    if (req.query.username && req.query.name && req.query.sex && req.query.class && req.query.direction && req.query.tel && req.query.message) {
        if (req.session) {
            if (req.session.access) {
                next();//通过检验
            } else {
                if (req.jsonp) {
                    res.jsonp({ err: true, errtype: 'no session' });
                }
                else {
                    res.json({ err: true, errtype: 'no session' });
                }

            }
        } else {
            if (req.jsonp) {
                res.jsonp({ err: true, errtype: 'please check session' });
            }
            else {
                res.json({ err: true, errtype: 'please check session' });
            }
        }
    }
    else {
        if (req.jsonp) {
            res.jsonp({ err: true, errtype: 'please check parameters' });
        }
        else {
            res.json({ err: true, errtype: 'please check parameters' });
        }
    }
}, function (req, res, next) {
    //确认信息
    if (req.query.username == req.session.personinf.username && req.query.name == req.session.personinf.name && req.query.sex == req.session.personinf.sex && req.query.class == req.session.personinf.class) {
        next();//检验合格
    } else {
        if (req.jsonp) {
            res.jsonp({ err: true, errtype: 'parameters err' });
        }
        else {
            res.json({ err: true, errtype: 'parameters err' });
        }
    }
}, function (req, res, next) {
    //报名接口调用
    if (req.session.access) {
        // console.log(req.query);
        //解密。。。之后改
        // 调用报名接口
        let personobj = req.query;
        //先查找 后添加。。
        adminmethod.find({ all: false, conditions: { username: personobj.username } }, function (obj) {
            if (obj.err && obj.errtype != "can't collection mongod") {
                adminmethod.add(personobj, function (obj) {
                    if (!obj.err) {
                        if (req.jsonp) {
                            res.jsonp({ err: false, errtype: 'login success!' });
                        }
                        else {
                            res.json({ err: false, errtype: 'login success!' });
                        }
                    } else {
                        if (req.jsonp) {
                            res.jsonp({ err: true, errtype: 'login error!' });
                        }
                        else {
                            res.json({ err: true, errtype: 'login error!' });
                        }
                    }
                })
            } else {
                if (req.jsonp) {
                    res.jsonp({ err: true, errtype: 'it has login' });
                }
                else {
                    res.json({ err: true, errtype: 'it has login' });
                }
            }
        })
    } else {
        if (req.jsonp) {
            res.jsonp({ err: true, errtype: 'not access' });
        }
        else {
            res.json({ err: true, errtype: 'not access' });
        }
    }
})
//管理接口 //中间件确认权限
app.use(['/add', '/delete', '/find', '/update'], function (req, res, next) {
    if (req.query.adminpass == "xiyou3g2018") {
        req.admin = true;
        // 可能需要加密操作 后续修改
    }
    else {
        req.admin = false;
    }
    next();
}, function (req, res, next) {
    if (req.admin) {
        console.log('管理员权限通过!');
        next();
    }
    else {
        console.log('没有管理员权限!');
        if (req.jsonp) {
            res.jsonp({ err: true, errtype: "don't has authority" });
        }
        else {
            res.json({ err: true, errtype: "don't has authority" });
        }
    }
})

//添加
app.get('/add', function (req, res, next) {
    if (req.query.obj) {
        next();
    } else {
        if (req.jsonp) {
            res.jsonp({ err: true, errtype: "don't has obj" });
        }
        else {
            res.json({ err: true, errtype: "don't has obj" });
        }
    }
}, function (req, res, next) {
    let data = {
        all: false,
        conditions: { username: req.query.obj.username }
    }
    adminmethod.find(data, function (obj) {
        if (obj.err) {
            next();
        } else {
            if (req.jsonp) {
                res.jsonp({ err: true, errtype: 'it has save' });
            }
            else {
                res.json({ err: true, errtype: 'it has save' });
            }
        }
    })
}, function (req, res) {
    adminmethod.add(req.query.obj, function (obj) {
        console.log('添加操作');
        if (req.jsonp) {
            res.jsonp(obj);
        }
        else {
            res.json(obj);
        }
    })
})

//删除   //全删
app.get('/delete', function (req, res, next) {
    if (req.query.data) {
        next();
    } else {
        if (req.jsonp) {
            res.jsonp({ err: true, errtype: "don't has data" });
        }
        else {
            res.json({ err: true, errtype: "don't has data" });
        }
    }
}, function (req, res, next) {
    if (req.query.data.conditions && req.query.data.conditions != '{}') {
        //删除逻辑
        console.log('删除操作');
        if (req.query.data.all == 'true') {
            if (req.query.deleteall) {
                if (req.query.deleteall == '123456') {
                    adminmethod.delete({ all: true }, function (obj) {
                        console.log('删库!!!')
                        if (req.jsonp) {
                            res.jsonp(obj);
                        }
                        else {
                            res.json(obj);
                        }
                    })
                } else {
                    if (req.jsonp) {
                        res.jsonp({ err: true, errtype: "don't has deleteall error" });
                    }
                    else {
                        res.json({ err: true, errtype: "don't has deleteall error" });
                    }
                }
            } else {
                if (req.jsonp) {
                    res.jsonp({ err: true, errtype: "don't has deleteall password" });
                }
                else {
                    res.json({ err: true, errtype: "don't has deleteall password" });
                }
            }
        } else {
            console.log('非删库')
            adminmethod.delete({
                all: false,
                conditions: req.query.data.conditions
            }, function (obj) {
                if (!obj.err) {
                    if (obj.result.doc == 0) {
                        if (req.jsonp) {
                            res.jsonp({ err: true, errtype: "don't has delete because of don't find" });
                        }
                        else {
                            res.json({ err: true, errtype: "don't has delete because of don't find" });
                        }
                    } else {
                        if (req.jsonp) {
                            res.jsonp(obj);
                        }
                        else {
                            res.json(obj);
                        }
                    }
                }
                else {
                    if (req.jsonp) {
                        res.jsonp(obj);
                    }
                    else {
                        res.json(obj);
                    }
                }
            })
        }
    } else {
        if (req.jsonp) {
            res.jsonp({ err: true, errtype: "don't has conditions" });
        }
        else {
            res.json({ err: true, errtype: "don't has conditions" });
        }
    }
})
//查看 //全部。。
app.get('/find', function (req, res, next) {
    if (req.query.data) {
        next();
    } else {
        if (req.jsonp) {
            res.jsonp({ err: true, errtype: "don't has data" });
        }
        else {
            res.json({ err: true, errtype: "don't has data" });
        }
    }
}, function (req, res, next) {
    if (req.query.data.conditions && req.query.data.conditions != '{}') {
        //查看逻辑
        console.log('查看操作');
        if (req.query.data.all == 'true') {
            adminmethod.find({ all: true }, function (obj) {
                if (req.jsonp) {
                    res.jsonp(obj);
                }
                else {
                    res.json(obj);
                }
            })
        }
        else {
            adminmethod.find({ all: false, conditions: req.query.data.conditions }, function (obj) {
                if (req.jsonp) {
                    res.jsonp(obj);
                }
                else {
                    res.json(obj);
                }
            })
        }
    }
    else {
        if (req.jsonp) {
            res.jsonp({ err: true, errtype: "don't has conditions" });
        }
        else {
            res.json({ err: true, errtype: "don't has conditions" });
        }
    }
})
//修改
app.get('/updata', function (req, res, next) {
    if (req.query.data) {
        next();
    } else {
        if (req.jsonp) {
            res.jsonp({ err: true, errtype: "don't has data" });
        }
        else {
            res.json({ err: true, errtype: "don't has data" });
        }
    }
}, function (req, res, next) {
    if (req.query.data.conditions && req.query.data.conditions != '{}') {
        if (req.query.data.new) {
            adminmethod.updata({ conditions: req.query.data.conditions, new: req.query.data.new }, function (obj) {
                if (req.jsonp) {
                    res.jsonp(obj);
                }
                else {
                    res.json(obj);
                }
            })
        }
        else {
            if (req.jsonp) {
                res.jsonp({ err: true, errtype: "don't has newdata" });
            }
            else {
                res.json({ err: true, errtype: "don't has newdata" });
            }
        }
    }
    else {
        if (req.jsonp) {
            res.jsonp({ err: true, errtype: "don't has conditions" });
        }
        else {
            res.json({ err: true, errtype: "don't has conditions" });
        }
    }
});
app.listen(8888);
console.log('running');