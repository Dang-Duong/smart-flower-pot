#include <stdio.h>
#include <string.h>
#include <math.h>
 
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
 
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_log.h"
#include "esp_netif.h"
#include "nvs_flash.h"
 
#include "driver/i2c.h"
#include "esp_adc/adc_oneshot.h"
#include "esp_adc/adc_cali.h"
#include "esp_adc/adc_cali_scheme.h"
#include "esp_http_client.h"
 
#include "cJSON.h"
 

//  KONFIGURACE

#define WIFI_SSID           "TVOJE_WIFI_SSID"
#define WIFI_PASS           "TVOJE_WIFI_HESLO"
#define API_ENDPOINT        "http://tvuj-server.cz/api/sensor-data"
#define DEVICE_ID           "kvetinac-01"
 
// Interval měření (v sekundách)
#define MEASURE_INTERVAL_S  300
 
// I2C konfigurace
#define I2C_MASTER_NUM      I2C_NUM_0
#define I2C_SDA_PIN         GPIO_NUM_21
#define I2C_SCL_PIN         GPIO_NUM_22
#define I2C_FREQ_HZ         100000
#define I2C_TIMEOUT_MS      1000
 
// I2C adresy senzorů
#define SHT30_ADDR          0x44
#define BH1750_ADDR         0x23
#define LTR390_ADDR         0x53
 
// ADC konfigurace pro HD-38
#define SOIL_ADC_CHANNEL    ADC_CHANNEL_6   // GPIO34
#define SOIL_ADC_UNIT       ADC_UNIT_1
#define SOIL_ADC_ATTEN      ADC_ATTEN_DB_12
 
// Kalibrace půdní vlhkosti
#define SOIL_DRY_VALUE      4095
#define SOIL_WET_VALUE      1200
 
//  LOG TAGY
static const char *TAG_MAIN   = "MAIN";
static const char *TAG_WIFI   = "WIFI";
static const char *TAG_I2C    = "I2C";
static const char *TAG_SHT30  = "SHT30";
static const char *TAG_BH1750 = "BH1750";
static const char *TAG_LTR390 = "LTR390";
static const char *TAG_SOIL   = "HD-38";
static const char *TAG_HTTP   = "HTTP";

//  DATOVÉ STRUKTURY
typedef struct {
    float teplota;              // °C
    float vlhkost_vzduch;       // %
    float osvetleni_lux;        // lux
    float uv_index;             // UV index
    int   vlhkost_puda_raw;     // surová ADC hodnota
    float vlhkost_puda_pct;     // %
    bool  sht30_ok;
    bool  bh1750_ok;
    bool  ltr390_ok;
} sensor_data_t;
 

//  GLOBÁLNÍ PROMĚNNÉ
static EventGroupHandle_t s_wifi_event_group;
#define WIFI_CONNECTED_BIT  BIT0
#define WIFI_FAIL_BIT       BIT1
 
static int s_retry_count = 0;
#define WIFI_MAX_RETRY      10
 
static adc_oneshot_unit_handle_t s_adc_handle = NULL;
static adc_cali_handle_t s_adc_cali_handle = NULL;
 
//  WIFI
static void wifi_event_handler(void *arg, esp_event_base_t event_base,
                               int32_t event_id, void *event_data)
{
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START) {
        esp_wifi_connect();
    }
    else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED) {
        if (s_retry_count < WIFI_MAX_RETRY) {
            esp_wifi_connect();
            s_retry_count++;
            ESP_LOGI(TAG_WIFI, "Pokus o reconnect #%d", s_retry_count);
        } else {
            xEventGroupSetBits(s_wifi_event_group, WIFI_FAIL_BIT);
        }
    }
    else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
        ip_event_got_ip_t *event = (ip_event_got_ip_t *)event_data;
        ESP_LOGI(TAG_WIFI, "Připojeno! IP: " IPSTR, IP2STR(&event->ip_info.ip));
        s_retry_count = 0;
        xEventGroupSetBits(s_wifi_event_group, WIFI_CONNECTED_BIT);
    }
}
 
static esp_err_t wifi_init(void)
{
    s_wifi_event_group = xEventGroupCreate();
 
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();
 
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));
 
    esp_event_handler_instance_t instance_any;
    esp_event_handler_instance_t instance_got_ip;
 
    ESP_ERROR_CHECK(esp_event_handler_instance_register(
        WIFI_EVENT, ESP_EVENT_ANY_ID, &wifi_event_handler, NULL, &instance_any));
    ESP_ERROR_CHECK(esp_event_handler_instance_register(
        IP_EVENT, IP_EVENT_STA_GOT_IP, &wifi_event_handler, NULL, &instance_got_ip));
 
    wifi_config_t wifi_config = {
        .sta = {
            .ssid     = WIFI_SSID,
            .password = WIFI_PASS,
            .threshold.authmode = WIFI_AUTH_WPA2_PSK,
        },
    };
 
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
    ESP_ERROR_CHECK(esp_wifi_start());
 
    ESP_LOGI(TAG_WIFI, "Čekám na připojení k %s ...", WIFI_SSID);
 
    EventBits_t bits = xEventGroupWaitBits(
        s_wifi_event_group,
        WIFI_CONNECTED_BIT | WIFI_FAIL_BIT,
        pdFALSE, pdFALSE,
        pdMS_TO_TICKS(30000));
 
    if (bits & WIFI_CONNECTED_BIT) {
        ESP_LOGI(TAG_WIFI, "✓ WiFi připojeno");
        return ESP_OK;
    }
 
    ESP_LOGE(TAG_WIFI, "✗ WiFi připojení selhalo");
    return ESP_FAIL;
}
 
//  I2C MASTER
static esp_err_t i2c_master_init(void)
{
    i2c_config_t conf = {
        .mode             = I2C_MODE_MASTER,
        .sda_io_num       = I2C_SDA_PIN,
        .scl_io_num       = I2C_SCL_PIN,
        .sda_pullup_en    = GPIO_PULLUP_ENABLE,
        .scl_pullup_en    = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_FREQ_HZ,
    };
 
    esp_err_t err = i2c_param_config(I2C_MASTER_NUM, &conf);
    if (err != ESP_OK) {
        ESP_LOGE(TAG_I2C, "Konfigurace I2C selhala: %s", esp_err_to_name(err));
        return err;
    }
 
    err = i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);
    if (err != ESP_OK) {
        ESP_LOGE(TAG_I2C, "Instalace I2C driveru selhala: %s", esp_err_to_name(err));
        return err;
    }
 
    ESP_LOGI(TAG_I2C, "✓ I2C master inicializován (SDA=%d, SCL=%d)",
             I2C_SDA_PIN, I2C_SCL_PIN);
    return ESP_OK;
}
 
/* Pomocná funkce: zápis na I2C */
static esp_err_t i2c_write(uint8_t addr, const uint8_t *data, size_t len)
{
    i2c_cmd_handle_t cmd = i2c_cmd_link_create();
    i2c_master_start(cmd);
    i2c_master_write_byte(cmd, (addr << 1) | I2C_MASTER_WRITE, true);
    i2c_master_write(cmd, data, len, true);
    i2c_master_stop(cmd);
    esp_err_t err = i2c_master_cmd_begin(I2C_MASTER_NUM, cmd, pdMS_TO_TICKS(I2C_TIMEOUT_MS));
    i2c_cmd_link_delete(cmd);
    return err;
}
 
/* Pomocná funkce: čtení z I2C */
static esp_err_t i2c_read(uint8_t addr, uint8_t *buf, size_t len)
{
    i2c_cmd_handle_t cmd = i2c_cmd_link_create();
    i2c_master_start(cmd);
    i2c_master_write_byte(cmd, (addr << 1) | I2C_MASTER_READ, true);
    if (len > 1) {
        i2c_master_read(cmd, buf, len - 1, I2C_MASTER_ACK);
    }
    i2c_master_read_byte(cmd, buf + len - 1, I2C_MASTER_NACK);
    i2c_master_stop(cmd);
    esp_err_t err = i2c_master_cmd_begin(I2C_MASTER_NUM, cmd, pdMS_TO_TICKS(I2C_TIMEOUT_MS));
    i2c_cmd_link_delete(cmd);
    return err;
}
 
/* Pomocná funkce: zápis + čtení */
static esp_err_t i2c_write_read(uint8_t addr, const uint8_t *wr_data, size_t wr_len, uint8_t *rd_buf, size_t rd_len)
{
    esp_err_t err = i2c_write(addr, wr_data, wr_len);
    if (err != ESP_OK) return err;
    vTaskDelay(pdMS_TO_TICKS(20));  // čekáme na odpověď senzoru
    return i2c_read(addr, rd_buf, rd_len);
}
 

//  SHT30 – Teplota + Vlhkost vzduchu
static uint8_t sht30_crc(const uint8_t *data, size_t len)
{
    uint8_t crc = 0xFF;
    for (size_t i = 0; i < len; i++) {
        crc ^= data[i];
        for (int bit = 0; bit < 8; bit++) {
            if (crc & 0x80)
                crc = (crc << 1) ^ 0x31;
            else
                crc = crc << 1;
        }
    }
    return crc;
}
 
static bool sht30_read(float *temperature, float *humidity)
{
    // Příkaz: Single shot, high repeatability, clock stretching enabled
    uint8_t cmd[2] = {0x2C, 0x06};
    uint8_t data[6];
 
    esp_err_t err = i2c_write(SHT30_ADDR, cmd, 2);
    if (err != ESP_OK) {
        ESP_LOGE(TAG_SHT30, "Chyba zápisu příkazu: %s", esp_err_to_name(err));
        return false;
    }
 
    vTaskDelay(pdMS_TO_TICKS(50));
 
    err = i2c_read(SHT30_ADDR, data, 6);
    if (err != ESP_OK) {
        ESP_LOGE(TAG_SHT30, "Chyba čtení dat: %s", esp_err_to_name(err));
        return false;
    }
 
    // Kontrola CRC
    if (sht30_crc(data, 2) != data[2] || sht30_crc(data + 3, 2) != data[5]) {
        ESP_LOGE(TAG_SHT30, "CRC kontrola selhala!");
        return false;
    }
 
    uint16_t raw_temp = (data[0] << 8) | data[1];
    uint16_t raw_hum  = (data[3] << 8) | data[4];
 
    *temperature = -45.0f + 175.0f * ((float)raw_temp / 65535.0f);
    *humidity    = 100.0f * ((float)raw_hum / 65535.0f);
 
    ESP_LOGI(TAG_SHT30, "Teplota: %.2f °C, Vlhkost: %.2f %%",
             *temperature, *humidity);
    return true;
}
 

//  BH1750 – Intenzita osvětlení
static bool bh1750_read(float *lux)
{
    // Power On
    uint8_t cmd_on = 0x01;
    esp_err_t err = i2c_write(BH1750_ADDR, &cmd_on, 1);
    if (err != ESP_OK) {
        ESP_LOGE(TAG_BH1750, "Chyba Power On: %s", esp_err_to_name(err));
        return false;
    }
 
    vTaskDelay(pdMS_TO_TICKS(10));
 
    // Continuous High Resolution Mode (1 lux rozlišení)
    uint8_t cmd_measure = 0x10;
    err = i2c_write(BH1750_ADDR, &cmd_measure, 1);
    if (err != ESP_OK) {
        ESP_LOGE(TAG_BH1750, "Chyba měření: %s", esp_err_to_name(err));
        return false;
    }
 
    // Čekáme na výsledek (max 180ms pro high res mode)
    vTaskDelay(pdMS_TO_TICKS(180));
 
    uint8_t data[2];
    err = i2c_read(BH1750_ADDR, data, 2);
    if (err != ESP_OK) {
        ESP_LOGE(TAG_BH1750, "Chyba čtení: %s", esp_err_to_name(err));
        return false;
    }
 
    uint16_t raw = (data[0] << 8) | data[1];
    *lux = (float)raw / 1.2f;
 
    ESP_LOGI(TAG_BH1750, "Osvětlení: %.1f lux", *lux);
    return true;
}
 

//  LTR390 – UV senzor
/* Registry LTR390 */
#define LTR390_REG_MAIN_CTRL    0x00
#define LTR390_REG_MEAS_RATE    0x04
#define LTR390_REG_GAIN         0x05
#define LTR390_REG_MAIN_STATUS  0x07
#define LTR390_REG_UVSDATA_L    0x10
#define LTR390_REG_UVSDATA_M    0x11
#define LTR390_REG_UVSDATA_H    0x12
 
static esp_err_t ltr390_write_reg(uint8_t reg, uint8_t value)
{
    uint8_t buf[2] = {reg, value};
    return i2c_write(LTR390_ADDR, buf, 2);
}
 
static esp_err_t ltr390_read_reg(uint8_t reg, uint8_t *value)
{
    return i2c_write_read(LTR390_ADDR, &reg, 1, value, 1);
}
 
static bool ltr390_init(void)
{
    // Reset a enable v UV módu
    esp_err_t err;
 
    // Main Control: UVS mode, enable
    err = ltr390_write_reg(LTR390_REG_MAIN_CTRL, 0x0A);
    if (err != ESP_OK) {
        ESP_LOGE(TAG_LTR390, "Init selhala: %s", esp_err_to_name(err));
        return false;
    }
 
    vTaskDelay(pdMS_TO_TICKS(10));
 
    // Measurement rate: 16-bit, 100ms
    ltr390_write_reg(LTR390_REG_MEAS_RATE, 0x22);
 
    // Gain: 3x
    ltr390_write_reg(LTR390_REG_GAIN, 0x01);
 
    ESP_LOGI(TAG_LTR390, "✓ Inicializován (UV mód, gain=3x)");
    return true;
}
 
static bool ltr390_read_uv(float *uv_index)
{
    // Počkáme na nová data
    vTaskDelay(pdMS_TO_TICKS(120));
 
    uint8_t status;
    esp_err_t err = ltr390_read_reg(LTR390_REG_MAIN_STATUS, &status);
    if (err != ESP_OK) {
        ESP_LOGE(TAG_LTR390, "Chyba čtení statusu: %s", esp_err_to_name(err));
        return false;
    }
 
    if (!(status & 0x08)) {
        ESP_LOGW(TAG_LTR390, "Data ještě nejsou připravena");
        return false;
    }
 
    // Přečteme 3 bajty UV dat (20-bit)
    uint8_t uv_l, uv_m, uv_h;
    ltr390_read_reg(LTR390_REG_UVSDATA_L, &uv_l);
    ltr390_read_reg(LTR390_REG_UVSDATA_M, &uv_m);
    ltr390_read_reg(LTR390_REG_UVSDATA_H, &uv_h);
 
    uint32_t raw_uv = ((uint32_t)(uv_h & 0x0F) << 16) | ((uint32_t)uv_m << 8) | (uint32_t)uv_l;
 
    /*
     * Přepočet na UV index:
     * UVI = UVS_DATA / (gain * integration_factor) * WFAC
     * Pro gain=3, resolution=16bit(25ms), WFAC=1:
     * sensitivity ~ 2300 counts/UVI
    */
    *uv_index = (float)raw_uv / 2300.0f;
 
    ESP_LOGI(TAG_LTR390, "UV raw: %lu, UV index: %.2f", raw_uv, *uv_index);
    return true;
}
 
//  HD-38 – Vlhkost půdy (ADC)
static esp_err_t soil_adc_init(void)
{
    adc_oneshot_unit_init_cfg_t init_cfg = {
        .unit_id = SOIL_ADC_UNIT,
    };
 
    esp_err_t err = adc_oneshot_new_unit(&init_cfg, &s_adc_handle);
    if (err != ESP_OK) {
        ESP_LOGE(TAG_SOIL, "ADC init selhala: %s", esp_err_to_name(err));
        return err;
    }
 
    adc_oneshot_chan_cfg_t chan_cfg = {
        .bitwidth = ADC_BITWIDTH_12,
        .atten    = SOIL_ADC_ATTEN,
    };
 
    err = adc_oneshot_config_channel(s_adc_handle, SOIL_ADC_CHANNEL, &chan_cfg);
    if (err != ESP_OK) {
        ESP_LOGE(TAG_SOIL, "ADC kanál konfigurace selhala: %s", esp_err_to_name(err));
        return err;
    }
 
    // Kalibrace (pokud je dostupná)
    adc_cali_curve_fitting_config_t cali_cfg = {
        .unit_id  = SOIL_ADC_UNIT,
        .chan     = SOIL_ADC_CHANNEL,
        .atten   = SOIL_ADC_ATTEN,
        .bitwidth = ADC_BITWIDTH_12,
    };
 
    err = adc_cali_create_scheme_curve_fitting(&cali_cfg, &s_adc_cali_handle);
    if (err == ESP_OK) {
        ESP_LOGI(TAG_SOIL, "ADC kalibrace aktivní");
    } 
    else {
        ESP_LOGW(TAG_SOIL, "ADC kalibrace nedostupná, používám surová data");
        s_adc_cali_handle = NULL;
    }
 
    ESP_LOGI(TAG_SOIL, "ADC inicializován (kanál %d)", SOIL_ADC_CHANNEL);
    return ESP_OK;
}
 
static int soil_read_raw(void)
{
    /* Průměr z 10 měření */
    long suma = 0;
    int value;
 
    for (int i = 0; i < 10; i++) {
        if (adc_oneshot_read(s_adc_handle, SOIL_ADC_CHANNEL, &value) == ESP_OK) {
            suma += value;
        }
        vTaskDelay(pdMS_TO_TICKS(10));
    }
 
    return (int)(suma / 10);
}
 
static float soil_raw_to_percent(int raw)
{
    /* Omez rozsah */
    if (raw > SOIL_DRY_VALUE) raw = SOIL_DRY_VALUE;
    if (raw < SOIL_WET_VALUE) raw = SOIL_WET_VALUE;
 
    /* Invertovaný map: sucho=0%, mokro=100% */
    float pct = (float)(SOIL_DRY_VALUE - raw) /
                (float)(SOIL_DRY_VALUE - SOIL_WET_VALUE) * 100.0f;
 
    return pct;
}
 

//  ČTENÍ VŠECH SENZORŮ
static sensor_data_t read_all_sensors(void)
{
    sensor_data_t data = {0};
 
    ESP_LOGI(TAG_MAIN, "--- Čtu senzory ---");
 
    // SHT30
    data.sht30_ok = sht30_read(&data.teplota, &data.vlhkost_vzduch);
 
    // BH1750
    data.bh1750_ok = bh1750_read(&data.osvetleni_lux);
 
    // LTR390
    data.ltr390_ok = ltr390_read_uv(&data.uv_index);
 
    // HD-38
    data.vlhkost_puda_raw = soil_read_raw();
    data.vlhkost_puda_pct = soil_raw_to_percent(data.vlhkost_puda_raw);
    ESP_LOGI(TAG_SOIL, "Vlhkost půdy: %.1f %% (raw: %d)",
             data.vlhkost_puda_pct, data.vlhkost_puda_raw);
 
    return data;
}
 

//  HTTP ODESLÁNÍ DAT
/* Callback pro HTTP klienta */
static esp_err_t http_event_handler(esp_http_client_event_t *evt)
{
    switch (evt->event_id) {
        case HTTP_EVENT_ON_DATA:
            if (!esp_http_client_is_chunked_response(evt->client)) {
                ESP_LOGI(TAG_HTTP, "Server odpověď: %.*s",
                         evt->data_len, (char *)evt->data);
            }
            break;
        case HTTP_EVENT_ERROR:
            ESP_LOGE(TAG_HTTP, "HTTP chyba");
            break;
        default:
            break;
    }
    return ESP_OK;
}
 
static void send_data_http(const sensor_data_t *data)
{
    /* Sestavení JSON */
    cJSON *root = cJSON_CreateObject();
    cJSON_AddStringToObject(root, "device_id", DEVICE_ID);
    cJSON_AddNumberToObject(root, "uptime_ms", (double)esp_log_timestamp());
 
    /* Senzory */
    cJSON *sensors = cJSON_AddObjectToObject(root, "sensors");
 
    if (data->sht30_ok) {
        cJSON_AddNumberToObject(sensors, "teplota_c", 
                                roundf(data->teplota * 100) / 100);
        cJSON_AddNumberToObject(sensors, "vlhkost_vzduch_pct",
                                roundf(data->vlhkost_vzduch * 100) / 100);
    }
    if (data->bh1750_ok) {
        cJSON_AddNumberToObject(sensors, "osvetleni_lux",
                                roundf(data->osvetleni_lux * 100) / 100);
    }
    if (data->ltr390_ok) {
        cJSON_AddNumberToObject(sensors, "uv_index",
                                roundf(data->uv_index * 100) / 100);
    }
 
    cJSON_AddNumberToObject(sensors, "vlhkost_puda_pct",
                            roundf(data->vlhkost_puda_pct * 100) / 100);
    cJSON_AddNumberToObject(sensors, "vlhkost_puda_raw",
                            data->vlhkost_puda_raw);
 
    /* Stav */
    cJSON *status = cJSON_AddObjectToObject(root, "status");
    cJSON_AddBoolToObject(status, "sht30",  data->sht30_ok);
    cJSON_AddBoolToObject(status, "bh1750", data->bh1750_ok);
    cJSON_AddBoolToObject(status, "ltr390", data->ltr390_ok);
 
    wifi_ap_record_t ap_info;
    if (esp_wifi_sta_get_ap_info(&ap_info) == ESP_OK) {
        cJSON_AddNumberToObject(status, "wifi_rssi", ap_info.rssi);
    }
 
    char *json_str = cJSON_PrintUnformatted(root);
    ESP_LOGI(TAG_HTTP, "Odesílám: %s", json_str);
 
    /* HTTP POST */
    esp_http_client_config_t config = {
        .url            = API_ENDPOINT,
        .method         = HTTP_METHOD_POST,
        .event_handler  = http_event_handler,
        .timeout_ms     = 10000,
    };
 
    esp_http_client_handle_t client = esp_http_client_init(&config);
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_post_field(client, json_str, strlen(json_str));
 
    esp_err_t err = esp_http_client_perform(client);
 
    if (err == ESP_OK) {
        int status_code = esp_http_client_get_status_code(client);
        ESP_LOGI(TAG_HTTP, "✓ Odesláno! HTTP status: %d", status_code);
    } else {
        ESP_LOGE(TAG_HTTP, "✗ Odeslání selhalo: %s", esp_err_to_name(err));
    }
 
    esp_http_client_cleanup(client);
    cJSON_free(json_str);
    cJSON_Delete(root);
}
 

//  VÝPIS DAT DO KONZOLE
static void print_sensor_data(const sensor_data_t *data)
{
    printf("\n");
    printf("Naměřená data \n");
  
    if (data->sht30_ok) {
        printf("Teplota: %6.1f °C\n", data->teplota);
        printf("Vlhkost vzduchu: %6.1f %%\n", data->vlhkost_vzduch);
    }
     else {
        printf("SHT30: CHYBA ČTENÍ\n");
    }

    if (data->bh1750_ok) {
        printf("Osvětlení: %6.1f lux\n", data->osvetleni_lux);
    } 
    else {
        printf("BH1750: CHYBA ČTENÍ\n");
    }
 
    if (data->ltr390_ok) {
        printf("UV index: %6.2f\n", data->uv_index);
    } 
    else {
        printf("LTR390: CHYBA ČTENÍ\n");
    }
 
    printf("Vlhkost půdy:  %5.1f %% (raw: %4d)\n",
           data->vlhkost_puda_pct, data->vlhkost_puda_raw);
}
 

//  HLAVNÍ ÚLOHA (FreeRTOS task)
static void sensor_task(void *pvParameters)
{
    while (1) {
        sensor_data_t data = read_all_sensors();
        print_sensor_data(&data);
        send_data_http(&data);
 
        ESP_LOGI(TAG_MAIN, "Další měření za %d sekund...", MEASURE_INTERVAL_S);
        vTaskDelay(pdMS_TO_TICKS(MEASURE_INTERVAL_S * 1000));
    }
}
 

//  ENTRY POINT
void app_main(void)
{
    
    ESP_LOGI(TAG_MAIN, "  CHYTRÝ KVĚTINÁČ – ESP-IDF (C)");
    
    /* NVS (potřebné pro WiFi) */
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES ||
        ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);
 
    /* Inicializace I2C */
    ESP_ERROR_CHECK(i2c_master_init());
 
    /* Inicializace LTR390 (potřebuje konfiguraci registrů) */
    if (!ltr390_init()) {
        ESP_LOGW(TAG_MAIN, "LTR390 inicializace selhala – bude přeskočen");
    }
 
    /* Inicializace ADC pro HD-38 */
    ESP_ERROR_CHECK(soil_adc_init());
 
    /* Připojení k WiFi */
    if (wifi_init() != ESP_OK) {
        ESP_LOGE(TAG_MAIN, "WiFi selhalo – restartuji za 10s...");
        vTaskDelay(pdMS_TO_TICKS(10000));
        esp_restart();
    }
 
    /* Spuštění měřicí úlohy */
    xTaskCreate(sensor_task, "sensor_task", 8192, NULL, 5, NULL);
 
    ESP_LOGI(TAG_MAIN, "✓ Systém běží");
}