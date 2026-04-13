# Chytrý květináč – ESP-IDF firmware

Firmware pro ESP32 mikrokontrolér, který periodicky čte data ze čtyř senzorů a odesílá je ve formátu JSON na backend server přes HTTP POST.

## Obsah

- [Přehled systému](#přehled-systému)
- [Použitý hardware](#použitý-hardware)
- [Zapojení pinů](#zapojení-pinů)
- [Požadavky](#požadavky)
- [Instalace a build](#instalace-a-build)
- [Konfigurace](#konfigurace)
- [Jak firmware funguje](#jak-firmware-funguje)
- [Formát odesílaných dat](#formát-odesílaných-dat)
- [Kalibrace snímače půdy](#kalibrace-snímače-půdy)
- [Řešení problémů](#řešení-problémů)

## Přehled systému

Firmware běží na ESP-IDF v5.x (čisté C, žádné Arduino závislosti). Po startu inicializuje všechny periferie, připojí se k WiFi a spustí FreeRTOS task, který v pravidelném intervalu (výchozí 5 minut):

1. Přečte data ze všech senzorů
2. Sestaví JSON payload pomocí knihovny cJSON
3. Odešle data přes HTTP POST na definovaný endpoint
4. Uspí se do dalšího cyklu

Komunikace se senzory probíhá na úrovni I2C registrů – firmware nepoužívá žádné externí senzorové knihovny. Veškerý kód (I2C příkazy, CRC kontroly, přepočty surových hodnot) je implementován přímo v `main.c`.

## Použitý hardware

| Komponenta | Model  | Rozhraní | Funkce                      |
|------------|--------|----------|-----------------------------|
| MCU        | ESP32  | –        | Řídící jednotka             |
| Senzor     | SHT30  | I2C      | Teplota a vlhkost vzduchu   |
| Senzor     | BH1750 | I2C      | Intenzita osvětlení (lux)   |
| Senzor     | LTR390 | I2C      | UV záření (UV index)        |
| Senzor     | HD-38  | Analog   | Vlhkost půdy                |

## Zapojení pinů

### I2C sběrnice (sdílená pro 3 senzory)

Všechny tři I2C senzory jsou připojeny paralelně na stejnou sběrnici:

| ESP32 Pin | Funkce | Senzory                  |
|-----------|--------|--------------------------|
| GPIO 21   | SDA    | SHT30, BH1750, LTR390    |
| GPIO 22   | SCL    | SHT30, BH1750, LTR390    |

I2C adresy:

| Senzor  | Adresa |
|---------|--------|
| SHT30   | 0x44   |
| BH1750  | 0x23   |
| LTR390  | 0x53   |

### Analogový vstup

| ESP32 Pin | Senzor | ADC kanál      |
|-----------|--------|----------------|
| GPIO 34   | HD-38  | ADC1_CHANNEL_6 |

### Napájení

| Pin | Připojit na            |
|-----|------------------------|
| 3V3 | VCC všech senzorů      |
| GND | GND všech senzorů      |

> **Poznámka:** I2C vyžaduje pull-up rezistory (4.7 kΩ) na SDA a SCL. Většina breakout desek je má integrované – zkontroluj dokumentaci svých modulů.

## Požadavky

- **ESP-IDF v5.x** nainstalované a nakonfigurované ([návod](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/))
- **ESP32** vývojová deska (DevKitC, NodeMCU-32S, WROOM apod.)
- USB kabel pro programování
- Funkční WiFi síť (2.4 GHz, WPA2)
- Backend server s HTTP endpointem pro příjem dat

Firmware nevyžaduje žádné externí knihovny – `cJSON`, I2C driver, ADC driver a HTTP klient jsou součástí ESP-IDF.

## Instalace a build

### 1. Struktura projektu

```
smart_flowerpot_c/
├── CMakeLists.txt          # Hlavní build soubor
├── sdkconfig.defaults      # Výchozí konfigurace SDK
├── README.md
└── main/
    ├── CMakeLists.txt      # Komponenta main
    └── main.c              # Veškerý zdrojový kód
```

### 2. Nastavení ESP-IDF prostředí

```bash
. $HOME/esp/esp-idf/export.sh
```

### 3. Konfigurace

Uprav konstanty na začátku souboru `main/main.c` (viz sekce [Konfigurace](#konfigurace)).

### 4. Build

```bash
cd smart_flowerpot_c
idf.py build
```

### 5. Flash a monitor

```bash
idf.py -p /dev/ttyUSB0 flash monitor
```

Na Windows nahraď `/dev/ttyUSB0` příslušným COM portem (např. `COM3`).

### 6. Pouze sériový monitor

```bash
idf.py -p /dev/ttyUSB0 monitor
```

Ukončení monitoru: `Ctrl + ]`

## Konfigurace

Veškerá konfigurace se provádí úpravou `#define` konstant na začátku souboru `main/main.c`:

### WiFi

```c
#define WIFI_SSID    "TVOJE_WIFI_SSID"
#define WIFI_PASS    "TVOJE_WIFI_HESLO"
```

### Backend

```c
#define API_ENDPOINT "http://tvuj-server.cz/api/sensor-data"
#define DEVICE_ID    "kvetinac-01"
```

`DEVICE_ID` slouží k identifikaci zařízení na backendu – pokud máš víc květináčů, každý by měl mít unikátní ID.

### Interval měření

```c
#define MEASURE_INTERVAL_S  300   // v sekundách (300 = 5 minut)
```

### Piny

```c
#define I2C_SDA_PIN         GPIO_NUM_21
#define I2C_SCL_PIN         GPIO_NUM_22
#define SOIL_ADC_CHANNEL    ADC_CHANNEL_6   // GPIO 34
```

### Kalibrace půdní vlhkosti

```c
#define SOIL_DRY_VALUE  4095   // ADC hodnota v suchém substrátu
#define SOIL_WET_VALUE  1200   // ADC hodnota ve vodě
```

## Jak firmware funguje

### Boot sekvence (`app_main`)

Po zapnutí ESP32 se postupně provede:

1. **NVS flash init** – inicializace non-volatile storage, kterou WiFi subsystém interně potřebuje pro ukládání kalibračních dat.
2. **I2C master init** – nastavení I2C sběrnice (SDA/SCL piny, frekvence 100 kHz, interní pull-upy). Po této inicializaci může ESP32 komunikovat se všemi třemi I2C senzory.
3. **LTR390 konfigurace** – zápis do registrů senzoru: přepnutí do UV módu, nastavení zesílení (gain 3x) a rozlišení (16-bit). Ostatní I2C senzory nevyžadují úvodní konfiguraci.
4. **ADC init** – konfigurace analogového kanálu pro HD-38 (12-bit rozlišení, plný rozsah 0–3.3 V). Pokud je dostupná hardwarová kalibrace ADC, aktivuje se automaticky.
5. **WiFi připojení** – inicializace WiFi v režimu STA (station), registrace event handlerů a pokus o připojení. Pokud se nepodaří připojit do 30 sekund (max 10 pokusů), ESP32 se restartuje.
6. **Vytvoření FreeRTOS tasku** – spuštění měřicí smyčky jako samostatného vlákna s 8 KB zásobníkem.

### Měřicí smyčka (`sensor_task`)

Běží nekonečně, každý cyklus trvá `MEASURE_INTERVAL_S` sekund:

#### Čtení SHT30 (teplota + vlhkost vzduchu)

Firmware pošle I2C příkaz `0x2C06` (single-shot, high repeatability), počká 50 ms a přečte 6 bajtů odpovědi. Každá dvojice datových bajtů má CRC-8 kontrolní bajt (polynom 0x31). Po ověření CRC se surové 16-bit hodnoty přepočtou:

- Teplota: `T = -45 + 175 × (raw / 65535)` [°C]
- Vlhkost: `H = 100 × (raw / 65535)` [%]

#### Čtení BH1750 (osvětlení)

Firmware pošle příkaz Power On (`0x01`), pak Continuous High Resolution Mode (`0x10`) a počká 180 ms na dokončení měření. Přečte 2 bajty a přepočte na luxy: `lux = raw / 1.2`.

#### Čtení LTR390 (UV index)

Firmware přečte stavový registr (`0x07`) a zkontroluje bit 3 (data ready). Pak přečte 3 bajty UV dat z registrů `0x10–0x12` (20-bit hodnota) a přepočte na UV index: `UVI = raw / 2300` (přibližný vzorec pro gain 3x, rozlišení 16-bit).

#### Čtení HD-38 (vlhkost půdy)

Firmware provede 10 po sobě jdoucích ADC čtení s 10 ms pauzou a výsledek zprůměruje pro filtraci šumu. Surová hodnota (0–4095) se lineárně přepočte na procenta, kde 0 % = sucho (`SOIL_DRY_VALUE`) a 100 % = mokro (`SOIL_WET_VALUE`).

#### Sestavení JSON a odeslání

Pomocí knihovny `cJSON` (součást ESP-IDF) se sestaví JSON objekt. Do payloadu se vloží pouze data z funkčních senzorů – pokud některý selže, jeho hodnoty se vynechají, ale v sekci `status` bude `false`. Payload se odešle přes `esp_http_client` jako HTTP POST s hlavičkou `Content-Type: application/json`. Timeout pro HTTP požadavek je 10 sekund.

## Formát odesílaných dat

```json
{
  "device_id": "kvetinac-01",
  "uptime_ms": 305000,
  "sensors": {
    "teplota_c": 23.45,
    "vlhkost_vzduch_pct": 55.20,
    "osvetleni_lux": 1250.00,
    "uv_index": 3.15,
    "vlhkost_puda_pct": 68.50,
    "vlhkost_puda_raw": 2100
  },
  "status": {
    "sht30": true,
    "bh1750": true,
    "ltr390": true,
    "wifi_rssi": -45
  }
}
```

### Popis polí

| Pole                          | Typ    | Popis                                       |
|-------------------------------|--------|---------------------------------------------|
| `device_id`                   | string | Identifikátor zařízení                      |
| `uptime_ms`                   | number | Doba běhu od startu v milisekundách         |
| `sensors.teplota_c`           | number | Teplota vzduchu ve °C                       |
| `sensors.vlhkost_vzduch_pct`  | number | Relativní vlhkost vzduchu v %               |
| `sensors.osvetleni_lux`       | number | Intenzita osvětlení v luxech                |
| `sensors.uv_index`            | number | UV index (0–11+)                            |
| `sensors.vlhkost_puda_pct`    | number | Vlhkost půdy v % (0 = sucho, 100 = mokro)  |
| `sensors.vlhkost_puda_raw`    | number | Surová ADC hodnota (0–4095)                 |
| `status.sht30`                | bool   | Senzor SHT30 funkční                        |
| `status.bh1750`               | bool   | Senzor BH1750 funkční                       |
| `status.ltr390`               | bool   | Senzor LTR390 funkční                       |
| `status.wifi_rssi`            | number | Síla WiFi signálu v dBm                     |

## Kalibrace snímače půdy

HD-38 je kapacitní snímač, jehož výstupní napětí klesá s rostoucí vlhkostí. Každý kus se mírně liší, proto je nutná kalibrace:

1. **Suchá hodnota:** Vlož senzor do úplně suchého substrátu (nebo ponech na vzduchu). Spusť firmware a v sériovém monitoru najdi řádek `HD-38 raw: XXXX`. Tuto hodnotu zapiš do `SOIL_DRY_VALUE`.

2. **Mokrá hodnota:** Vlož senzor do sklenice s vodou (jen měřicí vidlici, ne celý modul!). Zapiš hodnotu do `SOIL_WET_VALUE`.

3. Překompiluj a flashni firmware.

> **Upozornění:** Neponořuj senzor po konektory – voda by mohla poškodit elektroniku. Ponořuj pouze měřicí část (vidlice).

## Řešení problémů

### Senzor hlásí chybu čtení

- Zkontroluj zapojení SDA/SCL a napájení 3.3 V.
- Ověř, že I2C adresa odpovídá tvému modulu (některé desky mají jumper pro alternativní adresu).
- Spusť I2C scanner pro ověření, že senzor odpovídá na sběrnici.

### WiFi se nepřipojí

- ESP32 podporuje pouze 2.4 GHz sítě – ověř, že router vysílá na tomto pásmu.
- Zkontroluj SSID a heslo (rozlišuje velká/malá písmena).
- Firmware se po 10 neúspěšných pokusech automaticky restartuje.

### HTTP odeslání selhává

- Ověř, že backend server běží a je dostupný z lokální sítě ESP32.
- Zkontroluj URL v `API_ENDPOINT` (včetně portu, pokud není 80).
- V sériovém monitoru se zobrazí konkrétní chybová hláška z `esp_err_to_name()`.

### ADC hodnoty jsou nestabilní

- Firmware čte průměr z 10 vzorků, ale pokud je stále nestabilní, prodluž pauzu mezi čteními (v `soil_read_raw()` změň 10 ms na 50 ms).
- Zkontroluj, že napájecí napětí senzoru je stabilní 3.3 V.
- Dlouhé vodiče k analogovému senzoru mohou zachytávat rušení – zkrať je nebo použij stíněný kabel.

## Licence

Tento projekt je volně k použití pro osobní i komerční účely.
