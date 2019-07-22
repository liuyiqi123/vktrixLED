var http = require('http');
var mqttHandle = require('./mqttHandle.js');
var urlencode = require('urlencode');
var app = require('./app.js');
var weatherKey = "Enter a key"; // TODO:填写聚合数据Key
var SWITCHTIME = 1000 * 60;
var displayTime = 5000;
var reminderTime = 10000;
var clockData = {
    Day: null,
    weather: null
};

function getDay() {
    var date = new Date();
    var Y = date.getFullYear(); // 2019
    var M = date.getMonth() + 1; // 0-11
    var D = date.getDate(); // 1-31
    var d = _weekDay(date.getDay()); // 0-6
    var Day = M + "/" + D + " " + d;
    clockData.Day = Day;
    return Y + "-" + M + "-" + D;
}

function _weekDay(d) {
    switch (d) {
        case 0:
            d = "Sun";
            break;
        case 1:
            d = "Mon";
            break;
        case 2:
            d = "Tues";
            break;
        case 3:
            d = "Wed";
            break;
        case 4:
            d = "Thur";
            break;
        case 5:
            d = "Fri";
            break;
        case 6:
            d = "Sat";
    }
    return d;
}

function getWeather() {
    http.get('http://apis.juhe.cn/simpleWeather/query?key=' + weatherKey + '&city=' + urlencode('天津'), (res) => {
        let rawData = '';
        let weather = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                weather = parsedData.result.realtime.temperature + " " + _weatherTrans(parsedData.result.realtime.info);
                clockData.weather = weather;
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.log(e.message);
    });
}

function _weatherTrans(ch) {
    let en;
    if (ch.indexOf("晴") >= 0) {
        en = "Sunny";
    } else if (ch.indexOf("雪") >= 0) {
        en = "Snowy";
    } else if (ch.indexOf("雨") >= 0) {
        en = "Rainy";
    } else if (ch.indexOf("阴" >= 0) || ch.indexOf("多云") >= 0) {
        en = "Cloudy";
    } else if (ch.indexOf("沙") >= 0) {
        en = "sandy";
    } else {
        en = "x!x";
    }
    return en;
}

exports.init = () => {
    refreshDay();
    refreshWeather();
    mqttHandle.queueHandle();
    setInterval(dayRun, SWITCHTIME);
}

function dayRun() {
    mqttHandle.queueHandle(clockData.Day, displayTime)
    mqttHandle.queueHandle(clockData.weather, displayTime)
}

function refreshWeather() {
    let timeout = 1 * 60 * 60 * 1000;
    getWeather();
    setTimeout(() => {
        refreshWeather()
    }, timeout);
}

function refreshDay() {
    let timeout = _timer();
    getDay();
    setTimeout(() => {
        refreshDay()
    }, timeout);
    setTimeout(() => {
        app._todoUpdate()
    }, timeout+8 * 60 * 60 * 1000);
}

function _timer(time) {
    var dayTime = 24 * 60 * 60 * 1000;
    var realTime = new Date().getTime();
    var nightTime = time ? string2Date(time) : new Date(new Date().toLocaleDateString()).getTime() + dayTime + 1000;
    var diff = nightTime - realTime;
    return diff;
}

function string2Date(time) {
    // let _dif = new Date().getTimezoneOffset();
    // time = new Date(time).getTime() - _dif * 60 * 1000;
    time = new Date(time).getTime();
    return time;
}
function reminder(obj) {
    let timeout = _timer(obj.time);
    obj._timer ? clearTimeout(obj._timer) : null;
    obj._timer = setTimeout(() => {
        mqttHandle.queueHandle(obj.content, reminderTime, 'VKLED/todo')
    }, timeout);
}

exports.reminder = reminder;