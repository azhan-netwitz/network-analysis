import React from 'react';
import { Upload } from 'lucide-react';
import { NetworkData } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: NetworkData[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileUpload(event);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(header => header.trim());
      
      const formattedData: NetworkData[] = lines
        .slice(1) // Skip header row
        .filter(line => line.trim() !== '') // Skip empty lines
        .map(line => {
          const values = line.split(',').map(value => value.trim());
          return {
            date: values[headers.indexOf('Date')] || '',
            time: values[headers.indexOf('Time')] || '',
            apName: values[headers.indexOf('AP Name')] || '',
            apIP: values[headers.indexOf('AP IP')] || '',
            macAddress: values[headers.indexOf('MAC Address')] || '',
            snr: Number(values[headers.indexOf('SNR')]) || 0,
            medianRSSI: Number(values[headers.indexOf('median_rssi')]) || 0,
            medianHTRate: Number(values[headers.indexOf('median_ht_rate')]) || 0
          };
        });

      onDataLoaded(formattedData);
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6">
      <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
        <Upload className="w-12 h-12 text-blue-500 mb-2" />
        <span className="text-lg font-medium text-gray-700">Upload CSV File</span>
        <span className="text-sm text-gray-500 mt-1">CSV files only</span>
        <input
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};