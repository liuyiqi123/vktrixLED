var express = require('express');
var ex = express();
var bodyParser = require('body-parser');
var fs = require("fs");
var port = 8000;
var clock = require('./clock.js');
var mqttHandle = require('./mqttHandle.js');
var _ = require('underscore')._;
var todoData = {
  "all": null,
  "unfinished": null,
}

var urlPool = {
  "encode": "utf8",
  "todo": "/mock/todo.json",
  "msg": "/mock/msg.json",
  "setting": "/mock/setting.json",
}

ex.use(bodyParser.json());
ex.get('/', function (req, res) {
  res.send('Hello World');
})

ex.get('/getSetting', function (req, res) {
  fs.readFile(__dirname + urlPool.setting, urlPool.encode, function (err, data) {
    data = JSON.parse(data);
    data.Setting.time = _getRealTime();
    res.json(data);
  });
})

ex.put('/getSetting/switch', function (req, res) {
  // 读取已存在的数据
  fs.readFile(__dirname + urlPool.setting, urlPool.encode, function (err, data) {
    var result = {
      "result": null
    };

    let params = req.body;
    let power = params.switch;

    data = JSON.parse(data);
    data.Setting.power = power ? "on" : "off";

    fs.writeFile(__dirname + urlPool.setting, JSON.stringify(data), function (err) {
      result.result = err ? err : "success";
      mqttHandle.queueHandle(data.Setting.power, 0, 'VKLED/power')
      res.json(result);
    })
  });
})

ex.get('/listTodo', function (req, res) {
  fs.readFile(__dirname + urlPool.todo, urlPool.encode, function (err, data) {
    let sendData;
    data = JSON.parse(data).data;
    sendData = _.filter(data, function (item) {
      return item.deleted === false;
    });
    res.json(sendData);
  });
})

ex.get('/listTodo/:finished', function (req, res) {
  fs.readFile(__dirname + urlPool.todo, urlPool.encode, function (err, data) {
    let selectedData, isFinished;
    data = JSON.parse(data).data;
    isFinished = req.params.finished === "false" ? false : true;
    selectedData = _.filter(data, function (item) {
      return item.finished === isFinished && item.deleted === false;
    });
    res.json(selectedData);
  });
})

ex.post('/addTodo', function (req, res) {

  // 读取已存在的数据
  fs.readFile(__dirname + urlPool.todo, urlPool.encode, function (err, data) {
    var result = {
      "result": null
    };
    let writeData = {
      "data": null
    };

    let params = req.body;
    let content = params.content;
    let time = params.time;
    let repeat = params.repeat;
    let creator = params.creator;

    data = JSON.parse(data).data;
    let todo = {
      "_id": data.length + 1,
      "content": content,
      "time": time,
      "finished": false,
      "finishedTime": null,
      "deleted": false,
      "detail": {
        "content": content,
        "time": time,
        "repeat": repeat,
        "creator": creator,
        "creatTime": new Date()
      }
    }
    data.push(todo);
    writeData.data = data;
    fs.writeFile(__dirname + urlPool.todo, JSON.stringify(writeData), function (err) {
      result.result = err ? err : "success";
      res.json(result);
      _todoRefresh("add", todo);
    })
  });
})

ex.put('/editTodo', function (req, res) {
  // 读取已存在的数据
  fs.readFile(__dirname + urlPool.todo, urlPool.encode, function (err, data) {
    var result = {
      "result": null
    };
    let writeData = {
      "data": null
    };
    let params = req.body;
    let id = params._id;
    let editdData;

    data = JSON.parse(data).data;
    editdData = _.find(data, function (item) {
      return item._id === id
    });
    editdData.content = params.content;
    editdData.time = params.time;
    editdData.detail.content = params.content;
    editdData.detail.time = params.time;
    editdData.detail.repeat = params.detail.repeat;
    editdData.detail.creator = params.detail.creator;
    editdData.deleted = false;
    editdData.finished = false;
    editdData.finishedTime = null;

    data[id - 1] = editdData;
    writeData.data = data;
    fs.writeFile(__dirname + urlPool.todo, JSON.stringify(writeData), function (err) {
      result.result = err ? err : "success";
      res.json(result);
      _todoRefresh("edit", data[id - 1]);
    })
  });
})

ex.put('/finished/:finished', function (req, res) {
  // 读取已存在的数据
  fs.readFile(__dirname + urlPool.todo, urlPool.encode, function (err, data) {
    var result = {
      "result": null
    };
    let writeData = {
      "data": null
    };
    let isFinished;
    isFinished = req.params.finished === "false" ? false : true;
    let changeIdArr = req.body.data;
    data = JSON.parse(data).data;
    _.each(data, function (item) {
      if (changeIdArr.indexOf(item._id) > -1) {
        item.finished = isFinished;
      }
    });

    writeData.data = data;
    fs.writeFile(__dirname + urlPool.todo, JSON.stringify(writeData), function (err) {
      result.result = err ? err : "success";
      res.json(result);
      _.each(changeIdArr, function (id) {
        isFinished ? _todoRefresh("delete", data[id - 1]) : _todoRefresh("add", data[id - 1]);
      });
    })
  });
})

ex.delete('/deleteTodo/:id', function (req, res) {
  // First read existing users.
  fs.readFile(__dirname + urlPool.todo, urlPool.encode, function (err, data) {
    var result = {
      "result": null
    };
    let id = req.params.id;
    let writeData = {
      "data": null
    };
    data = JSON.parse(data).data;
    data[id - 1].deleted = true;
    writeData.data = data;
    fs.writeFile(__dirname + urlPool.todo, JSON.stringify(writeData), function (err) {
      result.result = err ? err : "success";
      res.json(result);
      _todoRefresh("delete", data[id - 1]);
    })
  });
})

var server = ex.listen(port, function () {
  var host = server.address().address;
  console.log("host address: http://%s:%s", host, port)
})

function _todoRefresh(type, todo) {
  switch (type) {
    case "add": //数组增加
      todoData.unfinished.push(todo);
      _.each(todoData.unfinished, function (obj) {
        if (obj._id === todo._id){
          clock.reminder(obj);
        }
      });
      break;
    case "edit":
      _.each(todoData.unfinished, function (obj) {
        if (obj._id === todo._id){
          obj=todo;
          clock.reminder(obj);
        } 
      });
      break;
    case "delete": //数组清除
      todoData.unfinished = _.filter(todoData.unfinished, function (obj) {
        if (obj._id !== todo._id) {
          return true;
        } else {
          clearTimeout(obj._timer);
          return false;
        }
      });
      break;
    default:
      _.each(todoData.unfinished, function (obj) {
        clock.reminder(obj);
      });
  }
}

function _getRealTime() {
  var date = new Date();
  var Y = date.getFullYear(); // 2019
  var M = date.getMonth() + 1; // 0-11
  var D = date.getDate(); // 1-31
  var h = _addZero(date.getHours()); // 0 - 23
  var m = _addZero(date.getMinutes()); // 0 - 59
  var s = _addZero(date.getSeconds()); // 0 - 59
  var realTime = Y + "-" + M + "-" + D + " " + h + ":" + m + ":" + s;
  return realTime;
}

function _addZero(el) {
  el = el < 10 ? "0" + el : el;
  return el;
}

function _todoUpdate() {
  fs.readFile(__dirname + urlPool.todo, urlPool.encode, function (err, data) {
    data = JSON.parse(data).data;
    todoData.all = _.filter(data, function (item) {
      return item.deleted === false;
    });
    todoData.unfinished = _.filter(todoData.all, function (item) {
      return item.finished === false;
    });
    _todoRefresh();
  });
}

function init() {
  clock.init();
  _todoUpdate();
}

init();

exports._todoUpdate = _todoUpdate;