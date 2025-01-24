import React, { useState, useCallback } from 'react';
import { format, parse, isValid } from 'date-fns';
import { NetworkData } from '../types';

interface DateFilterProps {
  data: NetworkData[];
  onFilterChange: (filteredData: NetworkData[]) => void;
  onMACChange: (mac: string) => void;
  onDateChange: (date: string) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({ data, onFilterChange, onMACChange, onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedMAC, setSelectedMAC] = useState<string>('all');

  const dates = React.useMemo(() => {
    const uniqueDates = [...new Set(data.map(item => item.date))];
    return uniqueDates
      .filter(date => {
        try {
          // Handle the full date format with year (e.g., "Dec 19 2024")
          const parsed = parse(date, 'MMM dd yyyy', new Date());
          return isValid(parsed);
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        const dateA = parse(a, 'MMM dd yyyy', new Date());
        const dateB = parse(b, 'MMM dd yyyy', new Date());
        return dateA.getTime() - dateB.getTime();
      });
  }, [data]);

  const macAddresses = React.useMemo(() => {
    return [...new Set(data.map(item => item.macAddress))].sort();
  }, [data]);

  const applyFilters = useCallback(() => {
    let filteredData = [...data];

    if (selectedDate !== 'all') {
      filteredData = filteredData.filter(item => item.date === selectedDate);
    }

    if (selectedMAC !== 'all') {
      filteredData = filteredData.filter(item => item.macAddress === selectedMAC);
    }

    onFilterChange(filteredData);
  }, [data, selectedDate, selectedMAC, onFilterChange]);

  const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    onDateChange(newDate);
    applyFilters();
  };

  const handleMACChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMAC = event.target.value;
    setSelectedMAC(newMAC);
    onMACChange(newMAC);
    applyFilters();
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      // Parse and format the full date with year
      const parsed = parse(dateStr, 'MMM dd yyyy', new Date());
      return format(parsed, 'MMMM d, yyyy');
    } catch {
      return dateStr; // Fallback to original string if parsing fails
    }
  };

  // Apply initial filters when component mounts
  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="mb-6">
      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-md">
        <div className="flex-1">
          <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Date:
          </label>
          <select
            id="date-filter"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            onChange={handleDateChange}
            value={selectedDate}
          >
            <option value="all">All Dates</option>
            {dates.map(date => (
              <option key={date} value={date}>
                {formatDisplayDate(date)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="mac-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by MAC Address:
          </label>
          <select
            id="mac-filter"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            onChange={handleMACChange}
            value={selectedMAC}
          >
            <option value="all">All MAC Addresses</option>
            {macAddresses.map(mac => (
              <option key={mac} value={mac}>
                {mac}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};