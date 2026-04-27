import type { FlowerInfo, HistoryRow, Metric, Notification, Reading } from "./types";

export const flower: FlowerInfo = {
  name: "Common Sunflower",
  species: "H. annuus",
  imageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=200&h=200&fit=crop",
};

export const currentMetrics: { humidity: Metric; temperature: Metric; light: Metric } = {
  humidity: { value: 62, unit: "%", status: "ok" },
  temperature: { value: 23, unit: "°C", status: "ok" },
  light: { value: 540, unit: "lx", status: "ok" },
};

export const humidityWeek: Reading[] = [
  { t: "Mon", value: 48 },
  { t: "Tue", value: 52 },
  { t: "Wed", value: 45 },
  { t: "Thu", value: 71 },
  { t: "Fri", value: 60 },
  { t: "Sat", value: 55 },
  { t: "Sun", value: 50 },
];

export const tempDay: Reading[] = [
  { t: "9:00", value: 18 },
  { t: "10:00", value: 19 },
  { t: "11:00", value: 20 },
  { t: "12:00", value: 24 },
  { t: "13:00", value: 27 },
  { t: "14:00", value: 28 },
  { t: "15:00", value: 26 },
  { t: "16:00", value: 25 },
  { t: "17:00", value: 24 },
  { t: "18:00", value: 22 },
  { t: "19:00", value: 21 },
  { t: "20:00", value: 20 },
];

export const lightHourly: Reading[] = [
  { t: "9:00", value: 120 },
  { t: "10:00", value: 280 },
  { t: "11:00", value: 420 },
  { t: "12:00", value: 620 },
  { t: "13:00", value: 700 },
  { t: "14:00", value: 660 },
  { t: "15:00", value: 590 },
  { t: "16:00", value: 480 },
  { t: "17:00", value: 350 },
  { t: "18:00", value: 200 },
  { t: "19:00", value: 160 },
  { t: "20:00", value: 90 },
];

export const historyRows: HistoryRow[] = [
  { time: "09:00", temperature: 18, humidity: 55, light: 120 },
  { time: "10:00", temperature: 19, humidity: 57, light: 280 },
  { time: "11:00", temperature: 20, humidity: 60, light: 420 },
  { time: "12:00", temperature: 24, humidity: 62, light: 620 },
  { time: "13:00", temperature: 27, humidity: 65, light: 700 },
  { time: "14:00", temperature: 28, humidity: 63, light: 660 },
  { time: "15:00", temperature: 26, humidity: 61, light: 590 },
  { time: "16:00", temperature: 25, humidity: 59, light: 480 },
];

export const notifications: Notification[] = [];
