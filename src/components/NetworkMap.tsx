import React, { useMemo, useState, useEffect } from 'react';
import { NetworkData } from '../types';
import ReactFlow, { 
  Node, 
  Edge,
  Background,
  Controls
} from 'reactflow';
import 'reactflow/dist/style.css';

interface NetworkMapProps {
  data: NetworkData[];
  selectedMAC: string;
  selectedDate: string;
}

interface DayDetails {
  date: string;
  apConnections: Record<string, Array<{ time: string; snr: number; isPoor: boolean }>>;
  metrics: {
    averageSnr: number;
    apSwitches: number;
    poorConnectionPercentage: number;
  };
}

export const NetworkMap: React.FC<NetworkMapProps> = ({ data, selectedMAC, selectedDate }) => {
  const [selectedDay, setSelectedDay] = useState<DayDetails | null>(null);

  // Reset state when MAC changes
  useEffect(() => {
    setSelectedDay(null);
  }, [selectedMAC]);

  // Add click handler function
  const onNodeClick = (_: any, node: Node) => {
    const date = node.id.replace('day-', '');
    const readings = data.filter(item => 
      item.macAddress === selectedMAC && 
      item.date === date
    );

    if (readings.length > 0) {
      // Calculate metrics
      const apSwitches = readings.reduce((count, curr, i, arr) => {
        if (i > 0 && curr.apName !== arr[i-1].apName) count++;
        return count;
      }, 0);

      const poorConnections = readings.filter(r => r.snr < 15 || r.medianRSSI < -70).length;
      const poorConnectionPercentage = (poorConnections / readings.length) * 100;
      const averageSnr = readings.reduce((sum, r) => sum + r.snr, 0) / readings.length;

      // Get AP connections
      const apConnections = readings
        .sort((a, b) => a.time.localeCompare(b.time))
        .reduce((acc, curr) => {
          if (!acc[curr.apName]) {
            acc[curr.apName] = [];
          }
          acc[curr.apName].push({
            time: curr.time,
            snr: curr.snr,
            isPoor: curr.snr < 15
          });
          return acc;
        }, {} as Record<string, Array<{ time: string; snr: number; isPoor: boolean }>>);

      setSelectedDay({
        date,
        apConnections,
        metrics: { averageSnr, apSwitches, poorConnectionPercentage }
      });
    }
  };

  const { nodes, edges } = useMemo(() => {
    if (!selectedMAC || selectedMAC === 'all' || !data?.length) {
      return { nodes: [], edges: [] };
    }

    const filteredData = data.filter(item => item.macAddress === selectedMAC);
    if (!filteredData.length) {
      return { nodes: [], edges: [] };
    }

    // Grid layout configuration
    const GRID_COLS = 4;
    const NODE_WIDTH = 200;
    const NODE_HEIGHT = 120;
    const HORIZONTAL_GAP = 50;
    const VERTICAL_GAP = 50;
    const startX = 100;
    const startY = 100;

    // Group by date
    const dateGroups = filteredData.reduce((acc, curr) => {
      if (!acc[curr.date]) {
        acc[curr.date] = [];
      }
      acc[curr.date].push(curr);
      return acc;
    }, {} as Record<string, NetworkData[]>);

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    Object.entries(dateGroups).forEach(([date, readings], index) => {
      const col = index % GRID_COLS;
      const row = Math.floor(index / GRID_COLS);
      
      const x = startX + (col * (NODE_WIDTH + HORIZONTAL_GAP));
      const y = startY + (row * (NODE_HEIGHT + VERTICAL_GAP));

      // Calculate metrics
      const apSwitches = readings.reduce((count, curr, i, arr) => {
        if (i > 0 && curr.apName !== arr[i-1].apName) count++;
        return count;
      }, 0);

      const poorConnections = readings.filter(r => r.snr < 15 || r.medianRSSI < -70).length;
      const poorConnectionPercentage = (poorConnections / readings.length) * 100;
      const averageSnr = readings.reduce((sum, r) => sum + r.snr, 0) / readings.length;

      // Get AP connections with timestamps
      const apConnections = readings
        .sort((a, b) => a.time.localeCompare(b.time))
        .reduce((acc, curr) => {
          if (!acc[curr.apName]) {
            acc[curr.apName] = [];
          }
          acc[curr.apName].push({
            time: curr.time,
            snr: curr.snr,
            isPoor: curr.snr < 15
          });
          return acc;
        }, {} as Record<string, Array<{ time: string; snr: number; isPoor: boolean }>>);

      let statusColor = '#22C55E'; // Default green for good

      // Update the color logic to use SNR thresholds
      if (averageSnr < 15) {
        statusColor = '#EF4444'; // Red for poor SNR
      } else if (averageSnr < 25) {
        statusColor = '#F59E0B'; // Yellow for moderate SNR
      }

      nodes.push({
        id: `day-${date}`,
        data: {
          label: (
            <>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>{date}</div>
              <div style={{ fontSize: '11px', color: statusColor, fontWeight: 'bold' }}>
                SNR: {averageSnr.toFixed(1)} | Switches: {apSwitches}
              </div>
              <div style={{ fontSize: '11px', color: statusColor }}>
                Poor: {poorConnectionPercentage.toFixed(1)}%
              </div>
            </>
          )
        },
        position: { x, y },
        style: {
          background: '#FFFFFF',
          border: `2px solid ${statusColor}`,
          borderRadius: '8px',
          padding: '12px',
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          cursor: 'pointer'
        }
      });

      if (col > 0) {
        edges.push({
          id: `h-${date}`,
          source: `day-${Object.keys(dateGroups)[index-1]}`,
          target: `day-${date}`,
          style: { stroke: '#E5E7EB' }
        });
      }
    });

    return { nodes, edges };
  }, [data, selectedMAC]);

  const getFilterInfo = () => {
    const parts = [];
    if (selectedDate !== 'all') parts.push(`Date: ${selectedDate}`);
    if (selectedMAC !== 'all') parts.push(`MAC: ${selectedMAC}`);
    return parts.length > 0 ? ` (${parts.join(', ')})` : ' (All Data)';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">
        Connection Quality Analysis
        <span className="text-sm font-normal text-gray-600 ml-2">
          {getFilterInfo()}
        </span>
      </h3>
      
      <div className="flex gap-6">
        {/* Legend Panel */}
        <div className="w-64 bg-gray-50 p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-lg mb-3">Metrics Explained</h4>
          
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-blue-600 mb-1">SNR (Signal-to-Noise Ratio)</h5>
              <p className="text-sm text-gray-600">
                Measures signal quality. Higher is better.
                <br/>• Good: ≥25
                <br/>• Moderate: 15-24
                <br/>• Poor: &lt;15
              </p>
            </div>

            <div>
              <h5 className="font-medium text-blue-600 mb-1">AP Switches</h5>
              <p className="text-sm text-gray-600">
                Number of times the bot changed access points.
                Frequent switches may indicate:
                <br/>• Position issues
                <br/>• Coverage gaps
                <br/>• AP problems
              </p>
            </div>

            <div>
              <h5 className="font-medium text-blue-600 mb-1">Poor Connections</h5>
              <p className="text-sm text-gray-600">
                Percentage of readings with poor quality (SNR &lt; 15 or RSSI &lt; -70):
                <br/>• Green: ≤5% - Excellent network health, minimal connection issues
                <br/>• Yellow: 5-20% - Moderate concerns, may need investigation
                <br/>• Red: &gt;20% - Critical issues requiring immediate attention
                <br/><br/>
                What affects this metric:
                <br/>• Physical obstacles between device and AP
                <br/>• Distance from Access Point
                <br/>• Interference from other devices
                <br/>• AP coverage gaps
              </p>
            </div>

            <div className="border-t pt-4">
              <h5 className="font-medium text-blue-600 mb-1">How to Use</h5>
              <p className="text-sm text-gray-600">
                1. Click on any day to see detailed connections
                <br/>2. Check AP switches for mobility issues
                <br/>3. Monitor SNR for connection quality
                <br/>4. Track poor connections % for overall health
                <br/><br/>
                Time Frame Colors:
                <br/>• <span className="text-blue-700">Blue boxes</span>: Good connection quality (SNR ≥ 15)
                <br/>• <span className="text-red-700">Red boxes</span>: Poor connection quality (SNR &lt; 15)
                <br/><br/>
                Note: Red text indicates metrics that have crossed critical thresholds:
                <br/>• SNR below 15
                <br/>• RSSI below -70 dBm
                <br/>• Poor connections above 20%
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Main graph container */}
          <div style={{ height: 500 }} className="border rounded-lg bg-gray-50 mb-4">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              minZoom={0.2}
              maxZoom={2}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              onNodeClick={onNodeClick}
            >
              <Background gap={20} size={1} color="#E5E7EB" />
              <Controls />
            </ReactFlow>
          </div>

          {/* Details panel below */}
          {selectedDay && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-lg">Details for {selectedDay.date}</h4>
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>

              {/* Metrics summary */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-white rounded shadow-sm">
                  <div className="text-sm font-medium text-gray-500">Average SNR</div>
                  <div className="text-lg font-semibold">{selectedDay.metrics.averageSnr.toFixed(1)}</div>
                </div>
                <div className="p-3 bg-white rounded shadow-sm">
                  <div className="text-sm font-medium text-gray-500">AP Switches</div>
                  <div className="text-lg font-semibold">{selectedDay.metrics.apSwitches}</div>
                </div>
                <div className="p-3 bg-white rounded shadow-sm">
                  <div className="text-sm font-medium text-gray-500">Poor Connections</div>
                  <div className="text-lg font-semibold">
                    {selectedDay.metrics.poorConnectionPercentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* AP Connections */}
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selectedDay.apConnections).map(([ap, connections]) => (
                  <div key={ap} className="p-4 bg-white rounded shadow-sm">
                    <div className="font-medium text-blue-600 mb-2">{ap}</div>
                    <div className="flex flex-wrap gap-2">
                      {connections.map((conn, i) => (
                        <span 
                          key={i} 
                          className={`px-2 py-1 rounded text-sm ${
                            conn.isPoor 
                              ? 'bg-red-50 text-red-700' 
                              : 'bg-blue-50 text-blue-700'
                          }`}
                          title={`SNR: ${conn.snr}`}
                        >
                          {conn.time}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Color legend at bottom */}
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Good SNR (≥25)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>Moderate SNR (15-24)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>Poor SNR (&lt;15)</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 