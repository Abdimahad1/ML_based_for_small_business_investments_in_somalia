import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { ThemeContext } from '../context/ThemeContext';
import './Performance.css';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale);

const Performance = () => {
  const { darkMode } = useContext(ThemeContext);
  const [allInvestments, setAllInvestments] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/my-investments', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allData = res.data;
        setAllInvestments(allData);

        const accepted = allData.filter(inv => inv.status === 'accepted');

        const performancePoints = await Promise.all(
          accepted.map(async (inv) => {
            try {
              const overview = await axios.get(`http://localhost:5000/api/overview/public/${inv.businessId}`);
              const { income = 0, expenses = 0 } = overview.data;
              const incomeNum = parseFloat(income);
              const expensesNum = parseFloat(expenses);

              let roi = 0;
              if (expensesNum >= 100 && incomeNum > expensesNum && !isNaN(incomeNum)) {
                roi = ((incomeNum - expensesNum) / (incomeNum + expensesNum)) * 10;
                roi = Math.min(roi, 10);
              }

              return {
                title: inv.title,
                roi: roi.toFixed(2),
                status: inv.status,
                contribution: inv.currentContribution || 0,
              };
            } catch (err) {
              return {
                title: inv.title,
                roi: '0.00',
                status: inv.status,
                contribution: inv.currentContribution || 0,
              };
            }
          })
        );

        setChartData({
          labels: performancePoints.map(p => p.title),
          datasets: [
            {
              label: 'ROI (%) by Investment',
              data: performancePoints.map(p => parseFloat(p.roi)),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.3,
              pointBackgroundColor: '#1d4ed8',
            },
          ],
        });
      } catch (err) {
        console.error('❌ Error fetching performance data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  // Summary Stats
  const acceptedCount = allInvestments.filter(i => i.status === 'accepted').length;
  const pendingCount = allInvestments.filter(i => i.status === 'pending').length;
  const rejectedCount = allInvestments.filter(i => i.status === 'rejected').length;

  const acceptedInvestments = allInvestments.filter(i => i.status === 'accepted');
  const averageROI = acceptedInvestments.length
    ? (
        acceptedInvestments.reduce((sum, i) => sum + parseFloat(i.roi || 0), 0) /
        acceptedInvestments.length
      ).toFixed(2)
    : '0.00';

  const totalContribution = acceptedInvestments.reduce(
    (sum, i) => sum + (i.currentContribution || 0),
    0
  );

  return (
    <div className={`performance-page ${darkMode ? 'dark' : ''}`}>
      <h2>📊 Investment Performance Summary</h2>

      {/* Metric Cards */}
      <div className="performance-summary-grid">
        <div className="performance-card roi">
          <div className="performance-card-icon">📈</div>
          <h4>Average ROI</h4>
          <p><strong>+{averageROI}%</strong></p>
        </div>

        <div className="performance-card contribution">
          <div className="performance-card-icon">💰</div>
          <h4>Total Contribution</h4>
          <p><strong>${totalContribution.toLocaleString()}</strong></p>
        </div>

        <div className="performance-card status">
          <div className="performance-card-icon">📋</div>
          <h4>Investment Status</h4>
          <p>
            Accepted: <strong>{acceptedCount}</strong><br />
            Pending: <strong>{pendingCount}</strong><br />
            Rejected: <strong>{rejectedCount}</strong>
          </p>
        </div>
      </div>

      {/* ROI Chart */}
      <div className="performance-chart-section">
        <h3>📈 ROI Line Chart</h3>
        {loading ? (
          <p>Loading chart...</p>
        ) : chartData.labels.length > 0 && chartData.datasets.length > 0 ? (
          <Line data={chartData} />
        ) : (
          <p>No chart data available.</p>
        )}
      </div>
    </div>
  );
};

export default Performance;
