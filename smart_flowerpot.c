/*
 * ============================================================
 *  CHYTRÝ KVĚTINÁČ – ESP32 Firmware
 * ============================================================
 *  Čte senzory → posílá přímo do MongoDB Atlas (Data API)
 *  Žádný vlastní backend – jen ESP32 a MongoDB.
 *
 *  Serial Monitor: 115200 baud
 *
 *  Nastavení MongoDB Atlas Data API:
 *    1. atlas.mongodb.com → tvůj cluster
 *    2. App Services → Create Application
 *    3. HTTPS Endpoints nebo Data API → Enable
 *    4. Zkopíruj URL, API Key a doplň níže
 * ============================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Wire.h>

// =============================================================
//  KONFIGURACE – VYPLŇ SVÉ ÚDAJE
// =============================================================

// WiFi
const char* WIFI_SSID = "TVOJE_WIFI";
const char* WIFI_PASS = "TVOJE_HESLO";

// MongoDB Atlas Data API
const char* ATLAS_URL       = "mongodb+srv://esp:EsP154839@main.cwbofbs.mongodb.net/SmartPot?retryWrites=true&w=majority&appName=Main";
const char* ATLAS_API_KEY   = "TVUJ_API_KEY";
const char* ATLAS_DATABASE  = "kvetinac";
const char* ATLAS_COLLECTION = "mereni";
const char* ATLAS_DATASOURCE = "Cluster0";  // název tvého clusteru

// Zařízení
const char* DEVICE_ID = "kvetinac-01";

// Interval měření (sekund)
#define MEASURE_INTERVAL  300   // 5 minut

// Piny
#define I2C_SDA       21
#define I2C_SCL       22
#define SOIL_PIN      34

// I2C adresy
#define SHT30_ADDR    0x44
#define BH1750_ADDR   0x23
#define LTR390_ADDR   0x53

// Kalibrace HD-38
#define SOIL_DRY      4095
#define SOIL_WET      1200

// =============================================================
//  SETUP
// =============================================================

void setup() {
  Serial.begin(115200);
  delay(2000);

  Serial.println();
  Serial.println("========================================");
  Serial.println("  CHYTRY KVETINAC");
  Serial.println("  ESP32 -> MongoDB Atlas");
  Serial.println("========================================");

  Wire.begin(I2C_SDA, I2C_SCL);

  // I2C scan
  Serial.println("[I2C] Skenuji...");
  for (uint8_t addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.printf("  0x%02X", addr);
      if (addr == SHT30_ADDR)  Serial.print(" <- SHT30");
      if (addr == BH1750_ADDR) Serial.print(" <- BH1750");
      if (addr == LTR390_ADDR) Serial.print(" <- LTR390");
      Serial.println();
    }
  }

  // ADC
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  // LTR390 init
  ltr390_write_reg(0x00, 0x10);
  delay(100);
  ltr390_write_reg(0x00, 0x00);
  delay(50);
  ltr390_write_reg(0x05, 0x01);
  delay(10);
  ltr390_write_reg(0x04, 0x22);
  delay(10);
  ltr390_write_reg(0x00, 0x0A);
  delay(500);

  // WiFi
  pripoj_wifi();

  Serial.println("System bezi!\n");
}

// =============================================================
//  LOOP
// =============================================================

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    pripoj_wifi();
  }

  // Čtení senzorů
  float teplota = 0, vlhkost_vzd = 0;
  bool sht30_ok = read_sht30(&teplota, &vlhkost_vzd);

  float lux = 0;
  bool bh1750_ok = read_bh1750(&lux);

  float uv_index = 0;
  uint32_t uv_raw = 0;
  bool ltr390_ok = read_ltr390(&uv_index, &uv_raw);

  int soil_raw = read_soil_raw();
  float soil_pct = soil_to_percent(soil_raw);

  // Výpis do Serial
  Serial.println("------- MERENI -------");
  if (sht30_ok)  Serial.printf("Teplota: %.1f C, Vlhkost vzd: %.1f %%\n", teplota, vlhkost_vzd);
  else           Serial.println("SHT30: CHYBA");
  if (bh1750_ok) Serial.printf("Osvetleni: %.1f lux\n", lux);
  else           Serial.println("BH1750: CHYBA");
  if (ltr390_ok) Serial.printf("UV index: %.2f (raw=%lu)\n", uv_index, uv_raw);
  else           Serial.println("LTR390: CHYBA");
  Serial.printf("Puda: %.1f %% (raw=%d)\n", soil_pct, soil_raw);

  // Sestavení MongoDB Atlas Data API payloadu
  // Formát: { dataSource, database, collection, document: {...} }
  String doc = "{";
  doc += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  doc += "\"timestamp\":{\"$date\":{\"$numberLong\":\"" + String(millis()) + "\"}},";
  doc += "\"sensors\":{";
  if (sht30_ok) {
    doc += "\"teplota_c\":" + String(teplota, 2) + ",";
    doc += "\"vlhkost_vzduch_pct\":" + String(vlhkost_vzd, 2) + ",";
  }
  if (bh1750_ok) {
    doc += "\"osvetleni_lux\":" + String(lux, 2) + ",";
  }
  if (ltr390_ok) {
    doc += "\"uv_index\":" + String(uv_index, 2) + ",";
  }
  doc += "\"vlhkost_puda_pct\":" + String(soil_pct, 2) + ",";
  doc += "\"vlhkost_puda_raw\":" + String(soil_raw);
  doc += "},";
  doc += "\"status\":{";
  doc += "\"sht30\":" + String(sht30_ok ? "true" : "false") + ",";
  doc += "\"bh1750\":" + String(bh1750_ok ? "true" : "false") + ",";
  doc += "\"ltr390\":" + String(ltr390_ok ? "true" : "false") + ",";
  doc += "\"wifi_rssi\":" + String(WiFi.RSSI());
  doc += "}}";

  String payload = "{";
  payload += "\"dataSource\":\"" + String(ATLAS_DATASOURCE) + "\",";
  payload += "\"database\":\"" + String(ATLAS_DATABASE) + "\",";
  payload += "\"collection\":\"" + String(ATLAS_COLLECTION) + "\",";
  payload += "\"document\":" + doc;
  payload += "}";

  // Odeslání do MongoDB Atlas
  odesli_do_atlas(payload);

  Serial.printf("Dalsi mereni za %d s...\n\n", MEASURE_INTERVAL);
  delay(MEASURE_INTERVAL * 1000);
}

// =============================================================
//  ODESLÁNÍ DO MONGODB ATLAS
// =============================================================

void odesli_do_atlas(String &payload) {
  Serial.println("[MongoDB] Odesilam...");

  WiFiClientSecure client;
  client.setInsecure();  // Pro produkci nahraď certifikátem

  HTTPClient http;
  http.begin(client, ATLAS_URL);
  http.addHeader("Content-Type", "application/ejson");
  http.addHeader("Accept", "application/json");
  http.addHeader("api-key", ATLAS_API_KEY);

  int code = http.POST(payload);

  if (code == 200 || code == 201) {
    String response = http.getString();
    Serial.println("[MongoDB] OK - ulozeno!");
    Serial.println("[MongoDB] " + response);
  } else if (code > 0) {
    String response = http.getString();
    Serial.printf("[MongoDB] Chyba %d: %s\n", code, response.c_str());
  } else {
    Serial.printf("[MongoDB] Spojeni selhalo: %s\n",
                  http.errorToString(code).c_str());
  }

  http.end();
}

// =============================================================
//  WiFi
// =============================================================

void pripoj_wifi() {
  Serial.printf("[WiFi] Pripojuji k: %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int pokusy = 0;
  while (WiFi.status() != WL_CONNECTED && pokusy < 30) {
    delay(500);
    Serial.print(".");
    pokusy++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WiFi] OK! IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WiFi] SELHALO! Restart za 10s...");
    delay(10000);
    ESP.restart();
  }
}

// =============================================================
//  SHT30
// =============================================================

bool read_sht30(float *temp, float *hum) {
  Wire.beginTransmission(SHT30_ADDR);
  Wire.write(0x2C);
  Wire.write(0x06);
  if (Wire.endTransmission() != 0) return false;

  delay(50);

  Wire.requestFrom(SHT30_ADDR, (uint8_t)6);
  if (Wire.available() < 6) return false;

  uint8_t data[6];
  for (int i = 0; i < 6; i++) data[i] = Wire.read();

  if (crc8(data, 2) != data[2] || crc8(data + 3, 2) != data[5])
    return false;

  uint16_t raw_t = (data[0] << 8) | data[1];
  uint16_t raw_h = (data[3] << 8) | data[4];

  *temp = -45.0 + 175.0 * ((float)raw_t / 65535.0);
  *hum  = 100.0 * ((float)raw_h / 65535.0);
  return true;
}

// =============================================================
//  BH1750
// =============================================================

bool read_bh1750(float *lux) {
  Wire.beginTransmission(BH1750_ADDR);
  Wire.write(0x01);
  Wire.endTransmission();
  delay(10);

  Wire.beginTransmission(BH1750_ADDR);
  Wire.write(0x10);
  if (Wire.endTransmission() != 0) return false;

  delay(180);

  Wire.requestFrom(BH1750_ADDR, (uint8_t)2);
  if (Wire.available() < 2) return false;

  uint8_t h = Wire.read();
  uint8_t l = Wire.read();
  *lux = ((h << 8) | l) / 1.2;
  return true;
}

// =============================================================
//  LTR390
// =============================================================

bool read_ltr390(float *uv_index, uint32_t *raw_out) {
  ltr390_write_reg(0x00, 0x0A);
  delay(200);

  uint8_t status = ltr390_read_reg(0x07);

  if (!(status & 0x08)) {
    delay(300);
    status = ltr390_read_reg(0x07);
  }

  if (!(status & 0x08)) return false;

  uint8_t uv_l = ltr390_read_reg(0x10);
  uint8_t uv_m = ltr390_read_reg(0x11);
  uint8_t uv_h = ltr390_read_reg(0x12);

  *raw_out = ((uint32_t)(uv_h & 0x0F) << 16) |
             ((uint32_t)uv_m << 8) |
             (uint32_t)uv_l;

  *uv_index = (float)(*raw_out) / 2300.0;
  return true;
}

void ltr390_write_reg(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(LTR390_ADDR);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

uint8_t ltr390_read_reg(uint8_t reg) {
  Wire.beginTransmission(LTR390_ADDR);
  Wire.write(reg);
  Wire.endTransmission();
  delay(5);
  Wire.requestFrom(LTR390_ADDR, (uint8_t)1);
  return Wire.available() ? Wire.read() : 0;
}

// =============================================================
//  HD-38
// =============================================================

int read_soil_raw() {
  long suma = 0;
  for (int i = 0; i < 10; i++) {
    suma += analogRead(SOIL_PIN);
    delay(10);
  }
  return suma / 10;
}

float soil_to_percent(int raw) {
  if (raw > SOIL_DRY) raw = SOIL_DRY;
  if (raw < SOIL_WET) raw = SOIL_WET;
  return (float)(SOIL_DRY - raw) / (float)(SOIL_DRY - SOIL_WET) * 100.0;
}

// =============================================================
//  CRC-8 pro SHT30
// =============================================================

uint8_t crc8(const uint8_t *data, size_t len) {
  uint8_t crc = 0xFF;
  for (size_t i = 0; i < len; i++) {
    crc ^= data[i];
    for (int b = 0; b < 8; b++) {
      crc = (crc & 0x80) ? (crc << 1) ^ 0x31 : (crc << 1);
    }
  }
  return crc;
}