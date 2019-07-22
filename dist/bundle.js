/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./app.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./app.js":
/*!****************!*\
  !*** ./app.js ***!
  \****************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var express = __webpack_require__(/*! express */ \"express\");\nvar ex = express();\nvar bodyParser = __webpack_require__(/*! body-parser */ \"body-parser\");\nvar fs = __webpack_require__(/*! fs */ \"fs\");\nvar port = 8000;\nvar clock = __webpack_require__(/*! ./clock.js */ \"./clock.js\");\nvar _ = __webpack_require__(/*! underscore */ \"underscore\")._;\nvar todoData = {\n  \"all\": null,\n  \"unfinished\": null,\n}\n\nvar urlPool = {\n  \"encode\": \"utf8\",\n  \"todo\": \"/mock/todo.json\",\n  \"msg\": \"/mock/msg.json\",\n}\n\nex.use(bodyParser.json());\nex.get('/', function (req, res) {\n  res.send('Hello World');\n})\n\nex.get('/listTodo', function (req, res) {\n  fs.readFile(__dirname + urlPool.todo, urlPool.encode, function (err, data) {\n    let sendData;\n    data = JSON.parse(data).data;\n    sendData = _.filter(data, function (item) {\n      return item.deleted === false;\n    });\n    res.json(sendData);\n  });\n})\n\nex.get('/listTodo/:finished', function (req, res) {\n  fs.readFile(__dirname + urlPool.todo, urlPool.encode, function (err, data) {\n    let selectedData, isFinished;\n    data = JSON.parse(data).data;\n    isFinished = req.params.finished === \"false\" ? false : true;\n    selectedData = _.filter(data, function (item) {\n      return item.finished === isFinished && item.deleted === false;\n    });\n    res.json(selectedData);\n  });\n})\n\nex.post('/addTodo', function (req, res) {\n\n  // 读取已存在的数据\n  fs.readFile(__dirname + urlPool.todo, urlPool.encode, function (err, data) {\n    var result = {\n      \"result\": null\n    };\n    let writeData = {\n      \"data\": null\n    };\n\n    let params = req.body;\n    let content = params.content;\n    let time = params.time;\n    let repeat = params.repeat;\n    let creator = params.creator;\n\n    data = JSON.parse(data).data;\n    let todo = {\n      \"_id\": data.length + 1,\n      \"content\": content,\n      \"time\": time,\n      \"finished\": false,\n      \"finishedTime\": null,\n      \"deleted\": false,\n      \"detail\": {\n        \"content\": content,\n        \"time\": time,\n        \"repeat\": repeat,\n        \"creator\": creator,\n        \"creatTime\": new Date()\n      }\n    }\n    data.push(todo);\n    writeData.data = data;\n    fs.writeFile(__dirname + urlPool.todo, JSON.stringify(writeData), function (err) {\n      result.result = err ? err : \"success\";\n      res.json(result);\n      _todoRefresh(\"add\", todo);\n    })\n  });\n})\n\nex.put('/editTodo/:id', function (req, res) {\n  // 读取已存在的数据\n  fs.readFile(__dirname + urlPool.todo, urlPool.encode, function (err, data) {\n    var result = {\n      \"result\": null\n    };\n    let writeData = {\n      \"data\": null\n    };\n    let id = req.params.id;\n    let params = req.body;\n    let editdData;\n\n    data = JSON.parse(data).data;\n    editdData = _.find(data, function (item) {\n      return item._id === id\n    });\n    editdData.content = params.content;\n    editdData.time = params.time;\n    editdData.detail.content = params.content;\n    editdData.detail.time = params.time;\n    editdData.detail.repeat = params.detail.repeat;\n    editdData.detail.creator = params.detail.creator;\n    editdData.deleted = false;\n    editdData.finished = false;\n    editdData.finishedTime = null;\n\n    data[id - 1] = editdData;\n    writeData.data = data;\n    fs.writeFile(__dirname + urlPool.todo, JSON.stringify(writeData), function (err) {\n      result.result = err ? err : \"success\";\n      res.json(result);\n      _todoRefresh(\"edit\", data[id - 1]);\n    })\n  });\n})\n\nex.put('/finished/:finished', function (req, res) {\n  // 读取已存在的数据\n  fs.readFile(__dirname + urlPool.todo, urlPool.encode, function (err, data) {\n    var result = {\n      \"result\": null\n    };\n    let writeData = {\n      \"data\": null\n    };\n    let isFinished;\n    isFinished = req.params.finished === \"false\" ? false : true;\n    let changeIdArr = req.body.data;\n    data = JSON.parse(data).data;\n    _.each(data, function (item) {\n      if (changeIdArr.indexOf(item._id) > -1) {\n        item.finished = isFinished;\n      }\n    });\n\n    writeData.data = data;\n    fs.writeFile(__dirname + urlPool.todo, JSON.stringify(writeData), function (err) {\n      result.result = err ? err : \"success\";\n      res.json(result);\n      _.each(changeIdArr, function (id) {\n        isFinished ? _todoRefresh(\"delete\", data[id - 1]) : _todoRefresh(\"add\", data[id - 1]);\n      });\n    })\n  });\n})\n\nex.delete('/deleteTodo/:id', function (req, res) {\n  // First read existing users.\n  fs.readFile(__dirname + urlPool.todo, urlPool.encode, function (err, data) {\n    var result = {\n      \"result\": null\n    };\n    let id = req.params.id;\n    let writeData = {\n      \"data\": null\n    };\n    data = JSON.parse(data).data;\n    data[id - 1].deleted = true;\n    writeData.data = data;\n    fs.writeFile(__dirname + urlPool.todo, JSON.stringify(writeData), function (err) {\n      result.result = err ? err : \"success\";\n      res.json(result);\n      _todoRefresh(\"delete\", data[id - 1]);\n    })\n  });\n})\n\nvar server = ex.listen(port, function () {\n  var host = server.address().address;\n  console.log(\"host address: http://%s:%s\", host, port)\n})\n\nfunction _todoRefresh(type, todo) {\n  switch (type) {\n    case \"add\": //数组增加\n      todoData.unfinished.push(todo);\n      _.each(todoData.unfinished, function (obj) {\n        if (obj._id === todo._id);\n        clock.reminder(obj);\n      });\n      break;\n    case \"edit\":\n      _.each(todoData.unfinished, function (obj) {\n        if (obj._id === todo._id);\n        clock.reminder(obj);\n      });\n      break;\n    case \"delete\": //数组清除\n      todoData.unfinished = _.filter(todoData.unfinished, function (obj) {\n        if (obj._id !== todo._id) {\n          return true;\n        } else {\n          clearTimeout(obj._timer);\n          return false;\n        }\n      });\n      break;\n    default:\n      _.each(todoData.unfinished, function (obj) {\n        clock.reminder(obj);\n      });\n  }\n}\n\nfunction _todoUpdate() {\n  fs.readFile(__dirname + urlPool.todo, urlPool.encode, function (err, data) {\n    data = JSON.parse(data).data;\n    todoData.all = _.filter(data, function (item) {\n      return item.deleted === false;\n    });\n    todoData.unfinished = _.filter(todoData.all, function (item) {\n      return item.finished === false;\n    });\n    _todoRefresh();\n  });\n}\n\nfunction init() {\n  clock.init();\n  _todoUpdate();\n}\n\ninit();\n\nexports._todoUpdate = _todoUpdate;\n\n//# sourceURL=webpack:///./app.js?");

/***/ }),

/***/ "./clock.js":
/*!******************!*\
  !*** ./clock.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var http = __webpack_require__(/*! http */ \"http\");\nvar mqttHandle = __webpack_require__(/*! ./mqttHandle.js */ \"./mqttHandle.js\");\nvar urlencode = __webpack_require__(/*! urlencode */ \"urlencode\");\nvar app = __webpack_require__(/*! ./app.js */ \"./app.js\");\nvar weatherKey = \"65e4296bee52b2dd78d7a9d42e4c0db0\";\nvar SWITCHTIME = 1000 * 60;\nvar displayTime = 5000;\nvar reminderTime = 10000;\nvar clockData = {\n    Day: null,\n    weather: null\n};\n\nfunction getDay() {\n    var date = new Date();\n    //var Y = date.getFullYear(); // 2019\n    var M = date.getMonth() + 1; // 0-11\n    var D = date.getDate(); // 1-31\n    var d = _weekDay(date.getDay()); // 0-6\n    var Day = M + \"/\" + D + \" \" + d;\n    clockData.Day = Day;\n}\n\nfunction _weekDay(d) {\n    switch (d) {\n        case 0:\n            d = \"Sun\";\n            break;\n        case 1:\n            d = \"Mon\";\n            break;\n        case 2:\n            d = \"Tues\";\n            break;\n        case 3:\n            d = \"Wed\";\n            break;\n        case 4:\n            d = \"Thur\";\n            break;\n        case 5:\n            d = \"Fri\";\n            break;\n        case 6:\n            d = \"Sat\";\n    }\n    return d;\n}\n\nfunction getWeather() {\n    http.get('http://apis.juhe.cn/simpleWeather/query?key=' + weatherKey + '&city=' + urlencode('天津'), (res) => {\n        let rawData = '';\n        let weather = '';\n        res.on('data', (chunk) => { rawData += chunk; });\n        res.on('end', () => {\n            try {\n                const parsedData = JSON.parse(rawData);\n                weather = parsedData.result.realtime.temperature + \" \" + _weatherTrans(parsedData.result.realtime.info);\n                clockData.weather = weather;\n            } catch (e) {\n                console.error(e.message);\n            }\n        });\n    }).on('error', (e) => {\n        console.log(e.message);\n    });\n}\n\nfunction _weatherTrans(ch) {\n    let en;\n    if (ch.indexOf(\"晴\") >= 0) {\n        en = \"Sunny\";\n    } else if (ch.indexOf(\"雪\") >= 0) {\n        en = \"Snowy\";\n    } else if (ch.indexOf(\"雨\") >= 0) {\n        en = \"Rainy\";\n    } else if (ch.indexOf(\"阴\" >= 0) || ch.indexOf(\"多云\") >= 0) {\n        en = \"Cloudy\";\n    } else if (ch.indexOf(\"沙\") >= 0) {\n        en = \"sandy\";\n    } else {\n        en = \"x!x\";\n    }\n    return en;\n}\n\nexports.init = () => {\n    refreshDay();\n    refreshWeather();\n    mqttHandle.queueHandle();\n    setInterval(dayRun, SWITCHTIME);\n}\n\nfunction dayRun() {\n    mqttHandle.queueHandle(clockData.Day, displayTime)\n    mqttHandle.queueHandle(clockData.weather, displayTime)\n}\n\nfunction refreshWeather() {\n    let timeout = 1 * 60 * 60 * 1000;\n    getWeather();\n    setTimeout(() => {\n        refreshWeather\n    }, timeout);\n}\n\nfunction refreshDay() {\n    let timeout = _timer();\n    getDay();\n    setTimeout(() => {\n        refreshDay\n    }, timeout);\n    setTimeout(() => {\n        app._todoUpdate\n    }, timeout+8 * 60 * 60 * 1000);\n}\n\nfunction _timer(time) {\n    var dayTime = 24 * 60 * 60 * 1000;\n    var realTime = new Date().getTime();\n    var nightTime = time ? string2Date(time) : new Date(new Date().toLocaleDateString()).getTime() + dayTime + 1000;\n    var diff = nightTime - realTime;\n    return diff;\n}\n\nfunction string2Date(time) {\n    // let _dif = new Date().getTimezoneOffset();\n    // time = new Date(time).getTime() - _dif * 60 * 1000;\n    time = new Date(time).getTime();\n    return time;\n}\nfunction reminder(obj) {\n    let timeout = _timer(obj.time);\n    obj._timer ? clearTimeout(obj._timer) : null;\n    obj._timer = setTimeout(() => {\n        mqttHandle.queueHandle(obj.content, reminderTime, 'VKLED/todo')\n    }, timeout);\n}\n\nexports.reminder = reminder;\n\n//# sourceURL=webpack:///./clock.js?");

/***/ }),

/***/ "./mqttHandle.js":
/*!***********************!*\
  !*** ./mqttHandle.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var mqtt = __webpack_require__(/*! mqtt */ \"mqtt\");\nvar client = mqtt.connect('mqtt:/led.ikle.top');\nvar intervalID, msgTime;\n\nclient.on('connect', function () {\n    client.subscribe('matrixInfo')\n})\n\nclient.on('message', function (topic, message) {\n    console.log(message.toString());\n})\n\nfunction queueHandle(msg, time, topic) {\n    let isMsg = msg ? true : false;\n    let sendMsg = {\n        text: msg ? msg : _getTime()\n    };\n    time = time ? time : 1000;\n    topic = topic ? topic : 'VKLED/clock';\n\n    clearTimeout(intervalID);\n    if (msgTime && isMsg) {\n        setTimeout(queueHandle, msgTime, msg, time, topic);\n        return;\n    }\n\n    console.log(sendMsg);\n    client.publish(topic, JSON.stringify(sendMsg));\n\n    isMsg ? _msgTimer(time) : null;\n    intervalID = setTimeout(queueHandle, time);\n}\n\nfunction _msgTimer(time) {\n    if (time > 0) {\n        time = time - 1000;\n        time === 0 ? null : setTimeout(_msgTimer, 1000, time)\n    }\n    msgTime = time;\n}\n\nfunction _getTime() {\n    var date = new Date();\n    var h = _addZero(date.getHours()); // 0 - 23\n    var m = _addZero(date.getMinutes()); // 0 - 59\n    var s = _addZero(date.getSeconds()); // 0 - 59\n    var time = h + \":\" + m + \":\" + s;\n    return time;\n}\n\nfunction _addZero(el) {\n    el = el < 10 ? \"0\" + el : el;\n    return el;\n}\n\nexports.queueHandle = queueHandle;\n\n//# sourceURL=webpack:///./mqttHandle.js?");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"body-parser\");\n\n//# sourceURL=webpack:///external_%22body-parser%22?");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"express\");\n\n//# sourceURL=webpack:///external_%22express%22?");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"fs\");\n\n//# sourceURL=webpack:///external_%22fs%22?");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"http\");\n\n//# sourceURL=webpack:///external_%22http%22?");

/***/ }),

/***/ "mqtt":
/*!***********************!*\
  !*** external "mqtt" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"mqtt\");\n\n//# sourceURL=webpack:///external_%22mqtt%22?");

/***/ }),

/***/ "underscore":
/*!*****************************!*\
  !*** external "underscore" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"underscore\");\n\n//# sourceURL=webpack:///external_%22underscore%22?");

/***/ }),

/***/ "urlencode":
/*!****************************!*\
  !*** external "urlencode" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"urlencode\");\n\n//# sourceURL=webpack:///external_%22urlencode%22?");

/***/ })

/******/ });