
 //  Serial Monitor: 115200 baud

 
#include <Wire.h>

// =============================================================
//  KONFIGURACE PINŮ
// =============================================================

#define I2C_SDA       21
#define I2C_SCL       22
#define SOIL_PIN      34    // HD-38 analog out (AO)

// I2C adresy
#define SHT30_ADDR    0x44
#define BH1750_ADDR   0x23
#define LTR390_ADDR   0x53

// =============================================================
//  SETUP
// =============================================================

void setup() {
  Serial.begin(115200);
  delay(2000);

  Serial.println();
  Serial.println("========================================");
  Serial.println("  TEST SENZORŮ – Chytrý květináč");
  Serial.println("========================================");
  Serial.println();

  // Spustíme I2C
  Wire.begin(I2C_SDA, I2C_SCL);

  // Naskenujeme I2C sběrnici
  Serial.println("[I2C] Skenuji sběrnici...");
  int found = 0;
  for (uint8_t addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.printf("  Nalezen: 0x%02X", addr);
      if (addr == SHT30_ADDR)  Serial.print(" ← SHT30");
      if (addr == BH1750_ADDR) Serial.print(" ← BH1750");
      if (addr == LTR390_ADDR) Serial.print(" ← LTR390");
      Serial.println();
      found++;
    }
  }
  Serial.printf("[I2C] Celkem nalezeno: %d zařízení\n\n", found);

  if (found == 0) {
    Serial.println("!!! ŽÁDNÝ SENZOR NENALEZEN !!!");
    Serial.println("Zkontroluj zapojení SDA/SCL a napájení 3V3.");
  }

  // Konfigurace ADC
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  // Inicializace LTR390
  ltr390_init();

  Serial.println("----------------------------------------");
  Serial.println("Startuji měření každé 3 sekundy...");
  Serial.println("----------------------------------------");
  Serial.println();
}

// =============================================================
//  LOOP – měření každé 3 sekundy
// =============================================================

void loop() {
  Serial.println("╔══════════════════════════════════════╗");

  // --- SHT30 ---
  test_sht30();

  // --- BH1750 ---
  test_bh1750();

  // --- LTR390 ---
  test_ltr390();

  // --- HD-38 ---
  test_soil();

  Serial.println("╚══════════════════════════════════════╝");
  Serial.println();

  delay(3000);
}


//  SHT30 – Teplota + Vlhkost vzduchu

void test_sht30() {
  // Pošli příkaz: single shot, high repeatability
  Wire.beginTransmission(SHT30_ADDR);
  Wire.write(0x2C);
  Wire.write(0x06);
  uint8_t err = Wire.endTransmission();

  if (err != 0) {
    Serial.printf("║ SHT30:    CHYBA (I2C err=%d)          ║\n", err);
    return;
  }

  delay(50);

  // Přečti 6 bajtů
  Wire.requestFrom(SHT30_ADDR, (uint8_t)6);
  if (Wire.available() < 6) {
    Serial.println("║ SHT30:    CHYBA (málo dat)            ║");
    return;
  }

  uint8_t data[6];
  for (int i = 0; i < 6; i++) {
    data[i] = Wire.read();
  }

  // CRC kontrola
  if (crc8(data, 2) != data[2] || crc8(data + 3, 2) != data[5]) {
    Serial.println("║ SHT30:    CHYBA CRC                   ║");
    return;
  }

  uint16_t raw_t = (data[0] << 8) | data[1];
  uint16_t raw_h = (data[3] << 8) | data[4];

  float teplota  = -45.0 + 175.0 * ((float)raw_t / 65535.0);
  float vlhkost  = 100.0 * ((float)raw_h / 65535.0);

  Serial.printf("║ SHT30:    %.1f °C  /  %.1f %% RH     OK ║\n",
                teplota, vlhkost);
}

//  BH1750 – Osvětlení

void test_bh1750() {
  // Power on
  Wire.beginTransmission(BH1750_ADDR);
  Wire.write(0x01);
  Wire.endTransmission();
  delay(10);

  // Continuous high res mode
  Wire.beginTransmission(BH1750_ADDR);
  Wire.write(0x10);
  uint8_t err = Wire.endTransmission();

  if (err != 0) {
    Serial.printf("║ BH1750:   CHYBA (I2C err=%d)          ║\n", err);
    return;
  }

  delay(180);

  Wire.requestFrom(BH1750_ADDR, (uint8_t)2);
  if (Wire.available() < 2) {
    Serial.println("║ BH1750:   CHYBA (málo dat)            ║");
    return;
  }

  uint8_t h = Wire.read();
  uint8_t l = Wire.read();
  float lux = ((h << 8) | l) / 1.2;

  Serial.printf("║ BH1750:   %.1f lux               OK ║\n", lux);
}

//  LTR390 – UV senzor

void ltr390_init() {
  // Main ctrl: UV mode, enable
  ltr390_write_reg(0x00, 0x0A);
  delay(10);
  // Meas rate: 16-bit, 100ms
  ltr390_write_reg(0x04, 0x22);
  // Gain: 3x
  ltr390_write_reg(0x05, 0x01);
}

void test_ltr390() {
  // Znovu aktivuj měření
  ltr390_write_reg(0x00, 0x0A);
  delay(200);

  // Čti status
  uint8_t status = ltr390_read_reg(0x07);

  if (!(status & 0x08)) {
    Serial.println("║ LTR390:   CHYBA - žádná data          ║");
    return;
  }

  uint8_t uv_l = ltr390_read_reg(0x10);
  uint8_t uv_m = ltr390_read_reg(0x11);
  uint8_t uv_h = ltr390_read_reg(0x12);

  uint32_t raw = ((uint32_t)(uv_h & 0x0F) << 16) |
                 ((uint32_t)uv_m << 8) |
                 (uint32_t)uv_l;

  float uv_index = (float)raw / 2300.0;

  Serial.printf("║ LTR390:   UV=%.2f (raw=%lu)       OK ║\n",
                uv_index, raw);
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


//  HD-38 – Vlhkost půdy (Analog)

void test_soil() {
  // Průměr z 10 čtení
  long suma = 0;
  for (int i = 0; i < 10; i++) {
    suma += analogRead(SOIL_PIN);
    delay(10);
  }
  int raw = suma / 10;

  Serial.printf("║ HD-38:    raw=%d", raw);

  if (raw < 100) {
    Serial.println("  (ODPOJENO?)      ║");
  } else if (raw > 3900) {
    Serial.println("  (SUCHO/vzduch)    ║");
  } else if (raw < 1500) {
    Serial.println("  (MOKRO)        OK ║");
  } else {
    Serial.println("  (OK)           OK ║");
  }
}

//  CRC-8 pro SHT30 (polynom 0x31)

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
