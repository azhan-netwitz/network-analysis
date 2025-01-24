import React, { useMemo } from 'react';
import { NetworkData } from '../types';
import { format } from 'date-fns';
import { getMACColorMap } from '../utils/colors';

interface DataTableProps {
  data: NetworkData[];
}

const getSnrColor = (snr: number) => {
  if (snr >= 25) return 'bg-green-100 text-green-800';
  if (snr >= 15) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getRssiColor = (rssi: number) => {
  // Convert RSSI to dBm
  const dbm = -100 + rssi;
  if (dbm >= -65) return 'bg-green-100 text-green-800';
  if (dbm >= -70) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getHtRateColor = (htRate: number) => {
  if (htRate >= 200) return 'bg-green-100 text-green-800';
  if (htRate >= 150) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const macColors = useMemo(() => {
    const uniqueMACs = [...new Set(data.map(d => d.macAddress))];
    return getMACColorMap(uniqueMACs);
  }, [data]);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Access Point
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MAC Address
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SNR
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RSSI
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                HT Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => {
              const isDisconnected = row.snr === 0 && row.medianRSSI === 0 && row.medianHTRate === 0;
              return (
                <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${isDisconnected ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {`${row.date} ${row.time}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{row.apName}</div>
                    <div className="text-gray-500">{row.apIP}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span style={{ color: macColors[row.macAddress] }}>
                      {row.macAddress}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded ${getSnrColor(row.snr)}`}>
                      {row.snr}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded ${getRssiColor(row.medianRSSI)}`}>
                      {-100 + row.medianRSSI} dBm
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded ${getHtRateColor(row.medianHTRate)}`}>
                      {row.medianHTRate}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};