export interface NetworkData {
  date: string;
  time: string;
  apName: string;
  apIP: string;
  macAddress: string;
  snr: number;
  medianRSSI: number;
  medianHTRate: number;
}

export interface DataPoint {
  timestamp: string;
  value: number;
}