/*
 * ============================================================================
 * FIRMWARE OFICIAL NODO TELEMÉTRICO APÍCOLA BEESENSE IoT (ESP32 + ARDUINO C++)
 * ============================================================================
 * Sensores integrados en placa:
 * - DHT22 (GPIO 4): Temperatura y Humedad Relativa Exterior
 * - DS18B20 (GPIO 5): Sonda impermeable de Temperatura Interior (Cámara de cría)
 * - Reed Switch Magnético (GPIO 18): Seguridad física (Apertura/Cierre de Tapa)
 * - Divisor Resistivo ADC (GPIO 34): Voltaje y Porcentaje de Batería LiFePO4/Li-Ion
 *
 * Comunicación Segura:
 * - MQTT sobre TLS 1.2 (Puerto 8883) con Certificados X.509 hacia AWS IoT Core
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <time.h>

// ---------------------- CONFIGURACIÓN DE PINES HARDWARE ---------------------
#define PIN_DHT22          4
#define DHTTYPE            DHT22
#define PIN_DS18B20        5
#define PIN_REED_TAPA      18
#define PIN_ADC_BATERIA    34

// ---------------------- CREDENCIALES WIFI Y AWS IOT CORE --------------------
const char* WIFI_SSID       = "TU_RED_WIFI_APICOLA";
const char* WIFI_PASSWORD   = "TU_PASSWORD_WIFI";
const char* AWS_IOT_ENDPOINT = "xxxxxxxxxxxxxx-ats.iot.us-east-1.amazonaws.com";
const int   AWS_IOT_PORT    = 8883;
const char* COLMENAR_ID     = "COLMENAR-NORTE-01";
const char* MQTT_TOPIC_PUB  = "beesense/COLMENAR-NORTE-01/telemetria";

// ---------------------- CERTIFICADOS X.509 DE AWS IOT -----------------------
static const char AWS_CERT_CA[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
MIIDQTCCAimgAwIBAgITBmyfz5m/jAo54vB4ikPmljZbyjANBgkqhkiG9w0BAQsF
... [REEMPLAZAR CON AMAZON ROOT CA 1] ...
-----END CERTIFICATE-----
)EOF";

static const char AWS_CERT_CRT[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
... [REEMPLAZAR CON DEVICE CERTIFICATE X.509 DE AWS IOT] ...
-----END CERTIFICATE-----
)EOF";

static const char AWS_CERT_PRIVATE[] PROGMEM = R"EOF(
-----BEGIN RSA PRIVATE KEY-----
... [REEMPLAZAR CON PRIVATE KEY DEL NODO ESP32] ...
-----END RSA PRIVATE KEY-----
)EOF";

// ---------------------- INSTANCIAS DE SENSORES Y CLIENTES -------------------
DHT dht(PIN_DHT22, DHTTYPE);
OneWire oneWire(PIN_DS18B20);
DallasTemperature sensorInterior(&oneWire);

WiFiClientSecure netSecure;
PubSubClient mqttClient(netSecure);

unsigned long lastPublishMs = 0;
const unsigned long PUBLISH_INTERVAL_MS = 10000; // Envío cada 10 segundos

/**
 * Calcula el porcentaje de batería a partir del divisor resistivo en GPIO 34
 * Rango Li-Ion 18650: 3.0V (0%) a 4.2V (100%)
 */
float leerPorcentajeBateria() {
  uint32_t mv = analogReadMilliVolts(PIN_ADC_BATERIA);
  if (mv < 100) {
    return -1.0; // Indica desconexión de línea de sensado de batería (N/A)
  }
  float voltajeReal = (mv / 1000.0) * 2.0; // Factor divisor resistivo 100k/100k
  float pct = ((voltajeReal - 3.0) / (4.2 - 3.0)) * 100.0;
  if (pct > 100.0) pct = 100.0;
  if (pct < 0.0) pct = 0.0;
  return pct;
}

void conectarWiFi() {
  Serial.print("[BeeSense] Conectando a Wi-Fi: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n[BeeSense] Wi-Fi conectado. IP: " + WiFi.localIP().toString());
}

void conectarAWSIoT() {
  netSecure.setCACert(AWS_CERT_CA);
  netSecure.setCertificate(AWS_CERT_CRT);
  netSecure.setPrivateKey(AWS_CERT_PRIVATE);

  mqttClient.setServer(AWS_IOT_ENDPOINT, AWS_IOT_PORT);

  while (!mqttClient.connected()) {
    Serial.print("[BeeSense] Autenticando con AWS IoT Core (TLS 8883)...");
    if (mqttClient.connect(COLMENAR_ID)) {
      Serial.println(" ¡Conectado exitosamente!");
    } else {
      Serial.print(" Falló rc=");
      Serial.print(mqttClient.state());
      Serial.println(". Reintentando en 5 segundos...");
      delay(5000);
    }
  }
}

void publicarTelemetria() {
  // 1. Lectura de Temperatura Interna (Cámara de Cría - DS18B20)
  sensorInterior.requestTemperatures();
  float tempInt = sensorInterior.getTempCByIndex(0);
  bool tempIntValida = (tempInt != DEVICE_DISCONNECTED_C && tempInt > -40.0 && tempInt < 85.0);

  // 2. Lectura de Clima Exterior (DHT22)
  float tempExt = dht.readTemperature();
  float humExt  = dht.readHumidity();
  bool dhtValido = (!isnan(tempExt) && !isnan(humExt));

  // 3. Lectura de Seguridad Física (Tapa de la Colmena - Reed Switch con INPUT_PULLUP)
  // LOW = Imán cerca (Tapa Cerrada) | HIGH = Imán separado (Tapa ABIERTA)
  int estadoPinTapa = digitalRead(PIN_REED_TAPA);
  const char* estadoTapaStr = (estadoPinTapa == HIGH) ? "ABIERTA" : "Cerrada";

  // 4. Lectura de Nivel Energético (Batería)
  float bateriaPct = leerPorcentajeBateria();

  // 5. Construcción del paquete JSON para AWS IoT Core
  StaticJsonDocument<384> doc;
  doc["colmenarId"] = COLMENAR_ID;
  doc["timestamp"]  = (unsigned long)time(nullptr);

  if (tempIntValida) {
    doc["tempInterior"] = serialized(String(tempInt, 1));
  } else {
    doc["tempInterior"] = nullptr; // Se interpreta como N/A en DynamoDB y Front-End
  }

  if (dhtValido) {
    doc["tempExterior"]    = serialized(String(tempExt, 1));
    doc["humedadExterior"] = serialized(String(humExt, 1));
  } else {
    doc["tempExterior"]    = nullptr;
    doc["humedadExterior"] = nullptr;
  }

  doc["estadoTapa"] = estadoTapaStr;

  if (bateriaPct >= 0.0) {
    doc["bateria"] = serialized(String(bateriaPct, 1));
  } else {
    doc["bateria"] = nullptr;
  }

  char jsonBuffer[384];
  serializeJson(doc, jsonBuffer);

  Serial.print("[BeeSense MQTT -> AWS] ");
  Serial.println(jsonBuffer);

  mqttClient.publish(MQTT_TOPIC_PUB, jsonBuffer);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_REED_TAPA, INPUT_PULLUP);
  analogReadResolution(12);

  dht.begin();
  sensorInterior.begin();

  conectarWiFi();
  configTime(-3 * 3600, 0, "pool.ntp.org", "time.nist.gov");
  conectarAWSIoT();
}

void loop() {
  if (!mqttClient.connected()) {
    conectarAWSIoT();
  }
  mqttClient.loop();

  unsigned long now = millis();
  if (now - lastPublishMs >= PUBLISH_INTERVAL_MS) {
    lastPublishMs = now;
    publicarTelemetria();
  }
}
