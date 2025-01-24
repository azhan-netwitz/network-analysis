import React from 'react';
import { NetworkData } from '../types';
import { WifiOff, Signal, Wifi, Activity } from 'lucide-react';

interface StatsProps {
  data: NetworkData[];
}

export const Stats: React.FC<StatsProps> = ({ data }) => {
  const stats = React.useMemo(() => {
    const lowSnrCount = data.filter(d => d.snr < 15).length;
    // Convert RSSI to dBm before checking threshold
    const lowRssiCount = data.filter(d => (-100 + d.medianRSSI) < -70).length;
    const avgSnr = data.reduce((acc, curr) => acc + curr.snr, 0) / data.length;
    // Convert RSSI to dBm for average calculation
    const avgRssi = data.reduce((acc, curr) => acc + (-100 + curr.medianRSSI), 0) / data.length;

    return {
      lowSnrCount,
      lowRssiCount,
      avgSnr: avgSnr.toFixed(2),
      avgRssi: avgRssi.toFixed(2)
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <Signal className="w-8 h-8 text-blue-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Average SNR</p>
            <p className="text-2xl font-semibold">{stats.avgSnr}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <Wifi className="w-8 h-8 text-blue-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Average RSSI</p>
            <p className="text-2xl font-semibold">{stats.avgRssi} dBm</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <WifiOff className="w-8 h-8 text-red-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Low SNR Instances</p>
            <p className="text-2xl font-semibold">{stats.lowSnrCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <Activity className="w-8 h-8 text-red-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Low RSSI Instances</p>
            <p className="text-2xl font-semibold">{stats.lowRssiCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};