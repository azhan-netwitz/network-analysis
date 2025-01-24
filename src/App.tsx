import React, { useState } from 'react';
import { NetworkData } from './types';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { Stats } from './components/Stats';
import { NetworkGraphs } from './components/NetworkGraphs';
import { NetworkMap } from './components/NetworkMap';
import { DateFilter } from './components/DateFilter';
import { DisconnectionGraph } from './components/DisconnectionGraph';
import { WifiIcon } from 'lucide-react';

const parseCSV = (text: string): NetworkData[] => {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  return lines
    .slice(1)
    .filter(line => line.trim() !== '')
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
};

function App() {
  const [allData, setAllData] = useState<NetworkData[]>([]);
  const [filteredData, setFilteredData] = useState<NetworkData[]>([]);
  const [selectedMAC, setSelectedMAC] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');

  const handleDataLoaded = (data: NetworkData[]) => {
    setAllData(data);
    setFilteredData(data);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (text) {
            const parsedData = parseCSV(text);
            handleDataLoaded(parsedData);
          }
        };

        reader.readAsText(file);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center mb-8">
          <WifiIcon className="w-10 h-10 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Network Analysis <span className="text-lg font-normal text-gray-600">by azhan</span></h1>
        </div>

        {allData.length === 0 ? (
          <FileUpload onDataLoaded={handleDataLoaded} />
        ) : (
          <div className="space-y-6">
            <DateFilter 
              data={allData} 
              onFilterChange={setFilteredData}
              onMACChange={setSelectedMAC}
              onDateChange={setSelectedDate}
            />
            <Stats data={filteredData} />
            <NetworkGraphs 
              data={filteredData} 
              selectedMAC={selectedMAC}
              selectedDate={selectedDate}
            />
            <DisconnectionGraph 
              data={filteredData}
              selectedMAC={selectedMAC}
              selectedDate={selectedDate}
            />
            <NetworkMap 
              data={filteredData} 
              selectedMAC={selectedMAC}
              selectedDate={selectedDate}
            />
            <DataTable data={filteredData} />
            <button
              onClick={() => {
                setAllData([]);
                setFilteredData([]);
                setSelectedMAC('all');
                setSelectedDate('all');
              }}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Upload New File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;