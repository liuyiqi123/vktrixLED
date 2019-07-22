var mqtt = require('mqtt');
var client = mqtt.connect('Enter a server');// TODO:填写MQTT server地址
var intervalID, msgTime;

client.on('connect', function () {
    client.subscribe('matrixInfo')
})

client.on('message', function (topic, message) {
    console.log(message.toString());
})

function queueHandle(msg, time, topic) {
    let isMsg = msg ? true : false;
    let sendMsg = {
        text: msg ? msg : _getTime()
    };
    time = time ? time : 1000;
    topic = topic ? topic : 'VKLED/clock';

    clearTimeout(intervalID);
    if (msgTime && isMsg) {
        setTimeout(queueHandle, msgTime, msg, time, topic);
        return;
    }

    console.log(sendMsg);
    client.publish(topic, JSON.stringify(sendMsg));

    isMsg ? _msgTimer(time) : null;
    intervalID = setTimeout(queueHandle, time);
}

function _msgTimer(time) {
    if (time > 0) {
        time = time - 1000;
        time === 0 ? null : setTimeout(_msgTimer, 1000, time)
    }
    msgTime = time;
}

function _getTime() {
    var date = new Date();
    var h = _addZero(date.getHours()); // 0 - 23
    var m = _addZero(date.getMinutes()); // 0 - 59
    var s = _addZero(date.getSeconds()); // 0 - 59
    var time = h + ":" + m + ":" + s;
    return time;
}

function _addZero(el) {
    el = el < 10 ? "0" + el : el;
    return el;
}

exports.queueHandle = queueHandle;