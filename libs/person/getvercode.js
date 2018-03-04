let request = require('request');
function getverCode(getobj) {
    let obj = undefined;
    request({
        encoding: null,
        url: 'http://222.24.62.120/CheckCode.aspx'
    }, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            let srcs = "data:image/Gif;base64," + body.toString('base64');
            let sessionid = res.headers["set-cookie"].toString().split(';')[0];
            obj = {
                err: false,
                result: {
                    session: sessionid,
                    src: srcs
                }
            }
            getobj(obj);
        }
        else {
            obj = {
                err: true,
                errtype: "can't get vercode！"
            }
            getobj(obj);
        }
    })
}
module.exports = getverCode;