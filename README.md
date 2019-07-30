# vktrixLED
Max72xxPanel\ESP8266WiFi\MQTT

![电子钟功能演示含天气](/assets/ikle_led_clock.gif)

![显示屏控制，TODO提醒](/assets/ikle_led_todo.gif)

## 设备

- WIFI模块开发板 (ESP8266-12E)
- 8*8 MAX7219 点阵
- 杜邦线公对公
- micro usb 线

## 电路连接
- 点阵in和out一一连接
- 点阵与wifi连接，Gnd和Vcc请勿接反

LED Matrix Pin -> ESP8266 Pin
Vcc            -> 3v  (3V on NodeMCU 3V3 on WEMOS)
Gnd            -> Gnd (G on NodeMCU)
DIN            -> D7  (Same Pin for WEMOS)
CS             -> D4  (Same Pin for WEMOS)
CLK            -> D5  (Same Pin for WEMOS)

## 客户端固件刷写
- 安装 platformIO
- 将master分支刷入硬件

## 服务端搭建
- 安装MQTT
[Mosquitto](https://mosquitto.org)
- server分支
安装完依赖包后，通过pm2运行node服务

## APP
进行中
