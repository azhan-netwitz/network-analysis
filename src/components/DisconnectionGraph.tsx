import React, { useMemo } from 'react';
import { NetworkData } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { getMACColorMap } from '../utils/colors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend
);

interface DisconnectionGraphProps {
  data: NetworkData[];
  selectedMAC: string;
  selectedDate: string;
}

export const DisconnectionGraph: React.FC<DisconnectionGraphProps> = ({ data, selectedMAC, selectedDate }) => {
  const processedData = useMemo(() => {
    // Get unique APs and MACs
    const uniqueAPs = [...new Set(data.map(d => d.apName))].sort();
    const uniqueMACs = [...new Set(data.map(d => d.macAddress))];
    
    // Create color mapping for MACs using the shared utility
    const macColors = getMACColorMap(uniqueMACs);

    // Filter disconnections and map them to AP positions
    const disconnections = data.filter(d => 
      d.snr === 0 && d.medianRSSI === 0 && d.medianHTRate === 0
    ).map(d => ({
      ...d,
      timestamp: new Date(`${d.date} ${d.time}`).getTime(),
      yPosition: uniqueAPs.indexOf(d.apName),
      color: macColors[d.macAddress]
    }));

    return {
      disconnections,
      uniqueAPs,
      macColors
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time' as const,
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
        type: 'linear' as const,
        min: -0.5,
        max: processedData.uniqueAPs.length - 0.5,
        ticks: {
          callback: (value: number) => processedData.uniqueAPs[Math.round(value)] || ''
        },
        title: {
          display: true,
          text: 'Access Points'
        },
        grid: {
          color: (context: any) => {
            // Draw darker lines between AP sections
            return context.tick.value % 1 === 0 ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)';
          },
          lineWidth: (context: any) => {
            return context.tick.value % 1 === 0 ? 2 : 1;
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const point = processedData.disconnections[context.dataIndex];
            return [
              `MAC: ${point.macAddress}`,
              `AP: ${point.apName}`,
              `Time: ${point.time}`
            ];
          }
        }
      },
      legend: {
        position: 'top' as const,
        title: {
          display: true,
          text: 'MAC Addresses'
        }
      }
    }
  };

  const chartData = {
    datasets: Object.entries(processedData.macColors).map(([mac, color]) => {
      const macDisconnections = processedData.disconnections.filter(d => d.macAddress === mac);
      return {
        label: mac,
        data: macDisconnections.map(d => ({
          x: d.timestamp,
          y: d.yPosition
        })),
        backgroundColor: color,
        borderColor: color,
        pointRadius: 8,
        pointStyle: 'circle'
      };
    }).filter(dataset => dataset.data.length > 0) // Only include datasets with data
  };

  const getFilterInfo = () => {
    const parts = [];
    if (selectedDate !== 'all') parts.push(`Date: ${selectedDate}`);
    return parts.length > 0 ? ` (${parts.join(', ')})` : ' (All Data)';
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">
          Disconnection Events by Access Point
          <span className="text-sm font-normal text-gray-600 ml-2">
            {getFilterInfo()}
          </span>
        </h3>
        <div className="h-[500px]">
          <Scatter options={options} data={chartData} />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <ul className="list-disc pl-5 space-y-1">
            <li>Each dot represents a disconnection event</li>
            <li>Colors indicate different MAC addresses</li>
            <li>Hover over points to see detailed information</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 