export type Reading = { t: string; value: number };

export type MetricStatus = "ok" | "warn" | "error";

export type Metric = {
  value: number;
  unit: string;
  status: MetricStatus;
};

export type FlowerInfo = {
  name: string;
  species: string;
  imageUrl: string;
};

export type HistoryRow = {
  time: string;
  temperature: number;
  humidity: number;
  light: number;
};

export type Notification = {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
};
