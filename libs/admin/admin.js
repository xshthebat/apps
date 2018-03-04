let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let person = new Schema({
    id: Number,
    name: String,
    sex: String,
    username: String,
    class: String,
    tel:String,
    direction: String,
    message: String,
    status: String
})
let mondel = mongoose.model('mondel', person);
let method = {};
method.add = function (data, callback) {
    let obj;
    mongoose.connect('mongodb://192.168.1.102:27017/naxing', function (err) {
        if (err) {
            obj = { err: ture, errtype: "can't collection mongod" };
            callback(obj);
        } else {
            let doc = new mondel(data);
            obj = { err: false, result: 'add success' };
            doc.save(function (err, doc) {
                if (err) {
                    obj = { err: true, errtype: 'add false' };
                } else {
                    obj = { err: false, result: 'add success' };
                }
                callback(obj);
            });
        }
    })
}
method.delete = function (data, callback) {
    let obj;
    mongoose.connect('mongodb://192.168.1.102:27017/naxing', function (err) {
        if (err) {
            obj = { err: ture, errtype: "can't collection mongod" };
            callback(obj);
        } else {
            if (data.all) {
                mondel.remove({}, function (err) {
                    if (err) {
                        obj = { err: ture, errtype: "can't delete all" }
                    }
                    else {
                        obj = { err: false, result: "delete all!" }
                    }
                    callback(obj);
                })
            }
            if (!data.all) {
                mondel.remove(data.conditions, function (errs, doc) {
                    if (errs) {
                        obj = { err: ture, errtype: "can't delete it" }
                    }
                    else {
                        obj = {
                            err: false, result: {
                                success: 'delete it!',
                                doc: doc.n
                            }
                        }
                    }
                    callback(obj);
                })
            }
        }
    })
}
method.find = function (data, callback) {
    let obj;
    mongoose.connect('mongodb://192.168.1.102:27017/naxing', function (err) {
        if (err) {
            obj = { err: ture, errtype: "can't collection mongod" };
            callback(obj);
        }
        else {
            if (data.all) {
                mondel.find({}, function (errs, doc) {
                    if (errs) {
                        obj = { err: true, errtype: "can't find all" }
                    }
                    else {
                        obj = {
                            err: false,
                            result: doc
                        }
                    }
                    callback(obj);
                })
            }
            else {
                mondel.find(data.conditions, function (errs, doc) {
                    if (doc.length == 0) {
                        obj = { err: true, errtype: "can't find it" }
                    }
                    else {
                        obj = {
                            err: false,
                            result: doc
                        }
                    }
                    callback(obj);
                })
            }
        }
    })
}
method.updata = function (data, callback) {
    let obj;
    mongoose.connect('mongodb://192.168.1.102:27017/naxing', function (err) {
        if (err) {
            obj = { err: ture, errtype: "can't collection mongod" };
            callback(obj);
        }
        else {
            mondel.find(data.conditions, function (errs, doc) {
                if (doc.length == 0) {
                    obj = { err: true, errtype: "can't find it" }
                }
                else {
                    mondel.update(data.conditions, data.new, function (err, doc) {
                        if (err) {
                            obj = { err: true, errtype: "can't update it" }
                        } else {
                            obj = {
                                err: false,
                                result: 'update success'
                            }
                            if (doc.nModified == 0) {
                                obj = {
                                    err: false,
                                    result: 'it has update'
                                }
                            }
                        }
                        callback(obj);
                    })
                }
            })
        }
    })
}
module.exports = method;
