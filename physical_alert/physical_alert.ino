#include <WiFiManager.h>
#include <MQTTClient.h>
#include <PubSubClient.h>
#include <ESP8266WiFi.h>
#include <Arduino.h>

const char deviceName[] = "CPSS-11.4A";
const char* mqtt_server = "192.168.1.4";
const int mqtt_port = 1883;
const char* topic = "wazuh/alerts";

const int merah = 15;
//const int biru = 4;
//const int kuning = 2;
const int buzzer = 13;

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

void configModeCallback (WiFiManager *myWiFiManager) {
  Serial.println("\" Could not connect to Wi-Fi. Device is in configuration mode.");
  Serial.print("\nUser must connect to device \"");
  Serial.print(myWiFiManager->getConfigPortalSSID());
  Serial.print("\" as a WiFi access point,");
  Serial.print("\nand open the configuration page at ");
  Serial.print(WiFi.softAPIP());
  Serial.print(" to configure Wi-Fi.\n"); 
}

void setup() {
  Serial.begin(9600);
  //pinMode(kuning, OUTPUT); 
  //pinMode(biru, OUTPUT); 
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(merah, OUTPUT); 
  //digitalWrite(merah, HIGH);

  pinMode(buzzer, OUTPUT); 
  //digitalWrite(buzzer, LOW);
  while (!Serial) {
    ;
  }
  delay(1000);
  Serial.println();
  Serial.println("IoT DEVICE STARTED");
  Serial.printf("Previously used SSID: %s\n", WiFi.SSID().c_str());

  WiFiManager wifiManager;
  wifiManager.setAPCallback(configModeCallback);
  wifiManager.setDebugOutput(false);

  wifiManager.autoConnect(deviceName, "Password");
  //wifiManager.resetSettings();

  Serial.print("\nDevice is on the network at ");
  Serial.print(WiFi.localIP());

  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(callback);
}

void loop() {
  if (!mqttClient.connected()) {
    connect();
  }

  mqttClient.loop();
}

void connect(){
  while(WiFi.status() != WL_CONNECTED){
    Serial.print("Attempting to connect to Wi-Fi");
    delay(1000);
  }
  Serial.println("\nConnected to Wi-Fi");
  if (mqttClient.connect(deviceName)) {
    Serial.println("Connected to MQTT broker");
    mqttClient.subscribe(topic);
  } else {
    Serial.println("Could not connect to MQTT broker");
    delay(1000);
  }
}

void callback(char* topic, byte* payload, unsigned int length){
  Serial.print("\nMessage arrived in topic:");
  Serial.println(topic);
  String message = "";

  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  int intValue = message.toInt();
  Serial.println(intValue);

  for (int i = 0; i < intValue; i++){
    digitalWrite(merah, HIGH);
    digitalWrite(LED_BUILTIN, HIGH);
    digitalWrite(buzzer, HIGH);
    delay(1000);
        
    digitalWrite(merah, LOW);
    digitalWrite(LED_BUILTIN, LOW);
    digitalWrite(buzzer, LOW);
    delay(1000);

  }

}
