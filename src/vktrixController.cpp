#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <WiFiClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Max72xxPanel.h>
#include <time.h>
#include "vktrix-conf.h"

String version = "v1.0";
ESP8266WebServer server(80);

int pinCS = D4; // Attach CS to this pin, DIN to MOSI and CLK to SCK (cf http://arduino.cc/en/Reference/SPI )
int numberOfHorizontalDisplays = 6;
int numberOfVerticalDisplays = 1;
int wait = 75; // In milliseconds between scroll movements
int spacer = 1;
int width = 5 + spacer; // The font width is 5 pixels
char time_value[20];
String SITE_WIDTH = "1000";
String message;
void display_message(String message);
void print_message(String message);
void callback(char *topic, byte *payload, unsigned int length);
void reconnect();
void processing(String cmd);

//################# DISPLAY CONNECTIONS ################
// LED Matrix Pin -> ESP8266 Pin
// Vcc            -> 3v  (3V on NodeMCU 3V3 on WEMOS)
// Gnd            -> Gnd (G on NodeMCU)
// DIN            -> D7  (Same Pin for WEMOS)
// CS             -> D4  (Same Pin for WEMOS)
// CLK            -> D5  (Same Pin for WEMOS)

//################ PROGRAM SETTINGS ####################

//################ add ####################
int GetRSSIasQuality(int rssi)
{
	int quality = 0;

	if (rssi <= -100)
	{
		quality = 0;
	}
	else if (rssi >= -50)
	{
		quality = 100;
	}
	else
	{
		quality = 2 * (rssi + 100);
	}
	return quality;
}

//################ init ####################

Max72xxPanel matrix = Max72xxPanel(pinCS, numberOfHorizontalDisplays, numberOfVerticalDisplays);

WiFiClient espClient;
PubSubClient client(espClient);

void setup()
{
	WiFi.mode(WIFI_STA);
	WiFi.begin(ssid, password);
	//Wait for connection
	int i = 0;
	while (WiFi.status() != WL_CONNECTED && i++ <= 10)
	{
		delay(1000); //wait 1 seconds
	}

	if (i == 11)
	{
		display_message("Could not connect to network...");
	}

	Serial.begin(115200); // initialize serial communications

	client.setServer(vk_server, 1883);
	client.setCallback(callback);

	//----------------------------------------------------------------------
	matrix.setIntensity(2);   // Use a value between 0 and 15 for brightness
	matrix.setRotation(0, 1); // The first display is position upside down
	matrix.setRotation(1, 1); // The first display is position upside down
	matrix.setRotation(2, 1); // The first display is position upside down
	matrix.setRotation(3, 1); // The first display is position upside down
	matrix.setRotation(4, 1); // The first display is position upside down
	matrix.setRotation(5, 1); // The first display is position upside down
	message = "Msg Board Vicky.L 2019";
	display_message(message); // Display the message
	wait = 50;
}

//################ Function ####################

void display_message(String message)
{
	for (int i = 0; i < width * message.length() + matrix.width() - spacer; i++)
	{
		int letter = i / width;
		int x = (matrix.width() - 1) - i % width;
		int y = (matrix.height() - 8) / 2; // center the text vertically
		while (x + width - spacer >= 0 && letter >= 0)
		{
			if (letter < message.length())
			{
				matrix.drawChar(x, y, message[letter], HIGH, LOW, 1); // HIGH LOW means foreground ON, background OFF, reverse these to invert the display!
			}
			letter--;
			x -= width;
		}
		matrix.write(); // Send bitmap to display
		delay(wait / 2);
	}
}

void print_message(String message)
{	
	matrix.setCursor(0, 0);
	matrix.print(message);
	matrix.write();
}

void reconnect()
{
	while (!client.connected())
	{
		String clientId = "VKLED-";
		clientId += String(random(0xffff), HEX);
		if (client.connect(clientId.c_str()))
		{
			client.subscribe("VKLED/#");
			client.publish("matrixstate", "connected");
		}
		else
		{
			display_message("trying connect again");
			delay(5000);
		}
	}
}

void callback(char *topic, byte *payload, unsigned int length)
{
	String s_payload = String((char *)payload);
	String s_topic = String(topic);
	int last = s_topic.lastIndexOf("/") + 1;
	String channel = s_topic.substring(last);

	DynamicJsonBuffer jsonBuffer;
	JsonObject &json = jsonBuffer.parseObject(s_payload);

	if (channel.equals("show"))
	{
		matrix.fillScreen(HIGH);
	}	
	else if (channel.equals("clock"))
	{
		matrix.clear();
		String text = json["text"];
		print_message(text);		
	}
	else if (channel.equals("todo"))
	{
		matrix.clear();
		String text = json["text"];
		display_message(text);
	}
	else if (channel.equals("clear"))
	{
		String text = json["time"];
		display_message(text);
	}
	else if (channel.equals("drawText"))
	{
		String text = json["text"];
		print_message(text);
	}
	else if (channel.equals("drawBMP"))
	{
		int16_t h = json["height"].as<int16_t>();
		int16_t w = json["width"].as<int16_t>();
		int16_t x = json["x"].as<int16_t>();
		int16_t y = json["y"].as<int16_t>();

		for (int16_t j = 0; j < h; j++, y++)
		{
			for (int16_t i = 0; i < w; i++)
			{
				matrix.drawPixel(x + i, y, json["bmp"][j * w + i].as<int16_t>());
			}
		}
	}
	else if (channel.equals("fill"))
	{
		matrix.fillScreen(HIGH);
	}
	else if (channel.equals("drawPixel"))
	{
		matrix.drawPixel(json["x"].as<int16_t>(), json["y"].as<int16_t>(), 0);
	}
	else if (channel.equals("setBrightness"))
	{
		matrix.setIntensity(json["brightness"].as<int16_t>());
	}
}

void processing(String cmd)
{
	DynamicJsonBuffer jsonBuffer;
	JsonObject &json = jsonBuffer.parseObject(cmd);
	String type = json["type"];
	display_message(cmd);

	if (type.equals("show"))
	{
		matrix.fillScreen(LOW);
	}
	else if (type.equals("clear"))
	{
		matrix.fillScreen(0);
	}
	else if (type.equals("drawText"))
	{
		String text = json["text"];
		print_message(text);
	}
	else if (type.equals("drawBMP"))
	{
		int16_t h = json["height"].as<int16_t>();
		int16_t w = json["width"].as<int16_t>();
		int16_t x = json["x"].as<int16_t>();
		int16_t y = json["y"].as<int16_t>();

		for (int16_t j = 0; j < h; j++, y++)
		{
			for (int16_t i = 0; i < w; i++)
			{
				matrix.drawPixel(x + i, y, json["bmp"][j * w + i].as<int16_t>());
			}
		}
	}
	else if (type.equals("fill"))
	{
		matrix.fillScreen(json["color"][0].as<int16_t>());
	}
	else if (type.equals("drawPixel"))
	{
		matrix.drawPixel(json["x"].as<int16_t>(), json["y"].as<int16_t>(), 0);
	}
	else if (type.equals("setBrightness"))
	{
		matrix.setIntensity(json["brightness"].as<int16_t>());
	}
}

void loop()
{

	while (Serial.available() > 0)
	{
		String message = Serial.readStringUntil('}') + "}";
		processing(message);
	};

	if (!client.connected())
	{
		reconnect();
	}
	else
	{
		client.loop();
	}
}