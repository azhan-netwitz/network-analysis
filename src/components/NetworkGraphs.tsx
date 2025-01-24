import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ScatterController,
  TimeScale
} from 'chart.js';
import { Line, Scatter } from 'react-chartjs-2';
import { NetworkData } from '../types';
import 'chartjs-adapter-date-fns';
import { getMACColorMap } from '../utils/colors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
  TimeScale
);

interface NetworkGraphsProps {
  data: NetworkData[];
  selectedMAC: string;
  selectedDate: string;
}

export const NetworkGraphs: React.FC<NetworkGraphsProps> = ({ data, selectedMAC, selectedDate }) => {
  const processedData = useMemo(() => {
    // Get unique MACs
    const uniqueMACs = [...new Set(data.map(d => d.macAddress))];
    const macColors = getMACColorMap(uniqueMACs);

    // Sort data by timestamp
    return data.map(d => ({
      ...d,
      timestamp: new Date(`${d.date} ${d.time}`).getTime(),
      color: macColors[d.macAddress]
    })).sort((a, b) => a.timestamp - b.timestamp);
  }, [data]);

  const getFilterInfo = () => {
    const parts = [];
    if (selectedDate !== 'all') parts.push(`Date: ${selectedDate}`);
    if (selectedMAC !== 'all') parts.push(`MAC: ${selectedMAC}`);
    return parts.length > 0 ? ` (${parts.join(', ')})` : ' (All Data)';
  };

  const scatterOptions: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'MMM d, HH:mm'
          }
        },
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        title: {
          display: true,
          text: 'SNR'
        },
        suggestedMin: 0
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const point = processedData[context.dataIndex];
            return [
              `MAC: ${point.macAddress}`,
              `SNR: ${point.snr}`,
              `RSSI: ${point.medianRSSI} dBm`
            ];
          }
        }
      },
      legend: {
        position: 'top'
      }
    }
  };

  const scatterData = {
    datasets: processedData.reduce((datasets, point) => {
      const macAddress = point.macAddress;
      const existingDataset = datasets.find(d => d.label === macAddress);
      
      const dataPoint = {
        x: point.timestamp,
        y: point.snr
      };

      if (existingDataset) {
        existingDataset.data.push(dataPoint);
      } else {
        datasets.push({
          label: macAddress,
          data: [dataPoint],
          backgroundColor: point.color,
          pointRadius: point.snr < 15 ? 10 : 6,
          pointStyle: point.snr < 15 ? 'triangle' : 'circle',
          borderColor: point.color,
          borderWidth: point.snr < 15 ? 2 : 1
        });
      }
      
      return datasets;
    }, [] as any[])
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">
          Network Performance by MAC Address
          <span className="text-sm font-normal text-gray-600 ml-2">
            {getFilterInfo()}
          </span>
        </h3>
        <div className="h-[500px]">
          <Scatter options={scatterOptions} data={scatterData} />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <ul className="list-disc pl-5 space-y-1">
            <li>Larger triangles indicate problematic SNR values (&lt; 15)</li>
            <li>Each color represents a different MAC address</li>
            <li>Hover over points to see detailed information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};