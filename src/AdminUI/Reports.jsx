import React from 'react';
import './reports.css';
import {
  FaChartLine,
  FaUsers,
  FaBuilding,
  FaDownload,
  FaFileCsv,
  FaFilePdf,
  FaMoneyBillWave 
} from 'react-icons/fa';
import { Line, Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const Reports = () => {
  // Example static data (replace with API later)
  const investmentData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Investments ($)',
        data: [5000, 7000, 6500, 9000, 8500, 11000],
        backgroundColor: 'rgba(107, 70, 193, 0.2)',
        borderColor: '#6b46c1',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Users',
        data: [120, 150, 200, 250, 300, 350],
        backgroundColor: 'rgba(72, 187, 120, 0.6)',
        borderColor: '#38a169',
        borderWidth: 1,
      },
    ],
  };

  const topBusinessesData = {
    labels: ['Biz A', 'Biz B', 'Biz C', 'Biz D'],
    datasets: [
      {
        data: [30, 20, 25, 25],
        backgroundColor: [
          '#6b46c1',
          '#ed8936',
          '#48bb78',
          '#3182ce'
        ],
      },
    ],
  };

  const handleExport = (format) => {
    alert(`Exporting as ${format.toUpperCase()}... (implement real export later)`);
  };

  return (
    <div className="reports-content">
      {/* header */}
      <div className="reports-header">
        <div className="reports-header-left">
          <FaChartLine className="reports-icon" />
          <h1>Reports & Analytics</h1>
        </div>
        <div className="reports-header-right">
          <button
            className="reports-export-btn"
            onClick={() => handleExport('csv')}
          >
            <FaFileCsv /> Export CSV
          </button>
          <button
            className="reports-export-btn"
            onClick={() => handleExport('pdf')}
          >
            <FaFilePdf /> Export PDF
          </button>
        </div>
      </div>

      {/* banner */}
      <div className="reports-banner animate-fade-in">
        <h1>📊 Platform Performance</h1>
        <p>Visualize your data with interactive graphs and exportable reports.</p>
      </div>

      {/* charts */}
      <div className="reports-charts">
        {/* investment flow */}
        <div className="reports-card animate-slide-up delay-1">
          <h2>
            <FaMoneyBillWave /> Investment Flows
          </h2>
          <Line data={investmentData} />
        </div>

        {/* user growth */}
        <div className="reports-card animate-slide-up delay-2">
          <h2>
            <FaUsers /> User Growth
          </h2>
          <Bar data={userGrowthData} />
        </div>

        {/* top businesses */}
        <div className="reports-card animate-slide-up delay-3">
          <h2>
            <FaBuilding /> Top Businesses
          </h2>
          <Pie data={topBusinessesData} />
        </div>
      </div>
    </div>
  );
};

export default Reports;
