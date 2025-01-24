# Network Analysis Tool BY Azhan 

A React-based web application for analyzing and visualizing Aruba network performance data. This tool provides comprehensive insights into network connectivity, signal strength, and device interactions across multiple access points.

## Features

- **Interactive Data Visualization**
  - Real-time network performance graphs
  - Signal strength (RSSI) and SNR tracking
  - Access point connection mapping
  - Disconnection event visualization
  - MAC address-based analysis

- **Advanced Filtering**
  - Date-based filtering
  - MAC address filtering
  - Custom data range selection

- **Performance Metrics**
  - SNR (Signal-to-Noise Ratio) analysis
  - RSSI (Received Signal Strength Indicator) monitoring
  - HT Rate tracking
  - AP connection patterns

- **Visual Analytics**
  - Interactive network maps
  - Performance trend graphs
  - Statistical summaries
  - Responsive data tables

## Technology Stack

- **Frontend**
  - React 18 with TypeScript
  - Vite build tool
  - Chart.js for data visualization
  - TailwindCSS for styling
  - Lucide Icons for UI elements

- **Data Processing**
  - Python script for data preprocessing
  - CSV data handling
  - MAC address grouping
  - Period-based data organization

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Data Processing

The application processes three types of network data files:

1. Required input files (place in `src/Full files/`):
   - `message_stats.csv`: Contains SNR and timing data
   - `rssi_stats.csv`: Contains RSSI and HT rate measurements
   - `ap_info.csv`: Contains access point information

2. Run the preprocessing script:
```bash
python src/filter.py
```

The script will:
- Combine data from all input files
- Group data by MAC addresses (3 MACs per file)
- Generate processed files in `combined_stats/` directory
- Add full date information and organize by periods

## Data Format

The application expects processed CSV files with these columns:
- Date (e.g., "Dec 19 2024")
- Time
- AP Name
- AP IP
- MAC Address
- SNR
- median_rssi
- median_ht_rate

## Components

- **FileUpload**: Handles CSV file upload and initial data processing
- **DateFilter**: Provides date-based data filtering
- **NetworkGraphs**: Displays performance metrics over time
- **NetworkMap**: Visualizes AP connections and signal strength
- **Stats**: Shows key performance statistics
- **DataTable**: Presents detailed tabular data
- **DisconnectionGraph**: Tracks network disconnection events

## Performance Considerations

- Data is processed in chunks of 1000 records
- Files are split by MAC addresses (3 per file) for better performance
- Efficient data structures for quick filtering and visualization
- Client-side data management for responsive UI

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Acknowledgments

- Built with React and TypeScript
- Visualization powered by Chart.js
- Styling with TailwindCSS
- Icons by Lucide
