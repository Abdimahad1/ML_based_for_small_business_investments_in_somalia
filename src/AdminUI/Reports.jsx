import React, { useEffect, useState } from "react";
import "./Reports.css";//this is the css 
import {
  FaChartLine,
  FaUsers,
  FaBuilding,
  FaFileCsv,
  FaFilePdf,
  FaMoneyBillWave,
  FaFileExcel,
  FaDownload,
} from "react-icons/fa";
import { Line, Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const Reports = () => {
  const [investmentData, setInvestmentData] = useState(null);
  const [userGrowthData, setUserGrowthData] = useState(null);
  const [topBusinessesData, setTopBusinessesData] = useState(null);
  const [rawData, setRawData] = useState({
    investments: [],
    userGrowth: [],
    businesses: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const token = sessionStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        const [investmentsRes, userGrowthRes, overviewRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/my-investments/all`, { headers }),
          axios.get(`${API_BASE_URL}/api/auth/user-growth`, { headers }),
          axios.get(`${API_BASE_URL}/api/overview/all`),
        ]);

        // Store raw data for exports
        setRawData({
          investments: investmentsRes.data,
          userGrowth: userGrowthRes.data,
          businesses: overviewRes.data,
        });

        // Process INVESTMENTS data
        const investments = investmentsRes.data;
        const monthlyInvestments = {};
        investments.forEach((inv) => {
          const date = new Date(inv.createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyInvestments[monthKey]) monthlyInvestments[monthKey] = 0;
          monthlyInvestments[monthKey] += inv.currentContribution || 0;
        });
        const sortedMonths = Object.keys(monthlyInvestments).sort();
        setInvestmentData({
          labels: sortedMonths,
          datasets: [
            {
              label: "Investments ($)",
              data: sortedMonths.map((m) => monthlyInvestments[m]),
              backgroundColor: "rgba(107, 70, 193, 0.2)",
              borderColor: "#6b46c1",
              borderWidth: 2,
              fill: true,
              tension: 0.3,
            },
          ],
        });

        // Process USER GROWTH data
        const growth = userGrowthRes.data;
        const growthLabels = growth.map(
          (g) => `${g.year}-${String(g.month).padStart(2, "0")}`
        );
        const growthCounts = growth.map((g) => g.count);
        setUserGrowthData({
          labels: growthLabels,
          datasets: [
            {
              label: "New Users",
              data: growthCounts,
              backgroundColor: "rgba(72, 187, 120, 0.6)",
              borderColor: "#38a169",
              borderWidth: 1,
            },
          ],
        });

        // Process TOP BUSINESSES data
        const overviews = overviewRes.data;
        const profiles = await Promise.all(
          overviews.map(async (ov) => {
            try {
              const prof = await axios.get(
                `${API_BASE_URL}/api/profile/public/${ov.user_id}`
              );
              return { ...prof.data, income: ov.income, expenses: ov.expenses };
            } catch {
              return null;
            }
          })
        );
        const processed = profiles
          .filter((p) => p !== null)
          .map((biz) => {
            const income = parseFloat(biz.income || 0);
            const expenses = parseFloat(biz.expenses || 0);
            let roi = 0;
            if (expenses >= 100 && income > expenses && !isNaN(income)) {
              roi = ((income - expenses) / (income + expenses)) * 10;
              roi = Math.min(roi, 10);
            }
            return { 
              name: biz.business_name, 
              roi: roi.toFixed(2),
              income,
              expenses,
              owner: biz.full_name,
              industry: biz.industry || 'N/A'
            };
          })
          .sort((a, b) => b.roi - a.roi)
          .slice(0, 5);
        
        setTopBusinessesData({
          labels: processed.map((b) => b.name),
          datasets: [
            {
              data: processed.map((b) => b.roi),
              backgroundColor: [
                "#6b46c1",
                "#ed8936",
                "#48bb78",
                "#3182ce",
                "#f56565",
              ],
            },
          ],
          rawBusinessData: processed // Store the full business data for exports
        });

      } catch (err) {
        console.error("❌ Failed to fetch reports data:", err);
        toast.error("Failed to load reports data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const downloadCSV = (filename, rows) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((row) => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (filename, title, headers, bodyRows) => {
    const doc = new jsPDF();
    doc.text(title, 14, 15);
    autoTable(doc, {
      head: [headers],
      body: bodyRows,
      startY: 25,
      styles: {
        cellPadding: 5,
        fontSize: 10,
        valign: 'middle',
        halign: 'center'
      },
      headStyles: {
        fillColor: [107, 70, 193],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    doc.save(filename);
  };

  const downloadExcel = (filename, data, sheetName = 'Sheet1') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filename);
  };

  const handleExport = (type, report) => {
    toast.info(
      <div>
        <strong>Export Report</strong>
        <div style={{ marginTop: "5px" }}>
          Export the <strong>{report}</strong> report as <strong>{type.toUpperCase()}</strong>?
          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <button
              onClick={() => {
                toast.dismiss();
                actuallyExport(type, report);
              }}
              style={{
                background: "#4caf50",
                border: "none",
                color: "#fff",
                padding: "5px 10px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss()}
              style={{
                background: "#f44336",
                border: "none",
                color: "#fff",
                padding: "5px 10px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>,
      { autoClose: false }
    );
  };

  const actuallyExport = async (type, report) => {
    try {
      setExporting(true);
      
      if (report === "investment") {
        if (type === "csv") {
          const rows = [
            ["Date", "Amount", "Investor", "Business", "Status"],
            ...rawData.investments.map(inv => [
              new Date(inv.createdAt).toLocaleDateString(),
              `$${inv.currentContribution?.toFixed(2) || '0.00'}`,
              inv.investor_name || 'N/A',
              inv.business_name || 'N/A',
              inv.status || 'Active'
            ])
          ];
          downloadCSV("investment-details.csv", rows);
        } 
        else if (type === "pdf") {
          const headers = ["Date", "Amount", "Investor", "Business", "Status"];
          const body = rawData.investments.map(inv => [
            new Date(inv.createdAt).toLocaleDateString(),
            `$${inv.currentContribution?.toFixed(2) || '0.00'}`,
            inv.investor_name || 'N/A',
            inv.business_name || 'N/A',
            inv.status || 'Active'
          ]);
          downloadPDF("investment-details.pdf", "Investment Details Report", headers, body);
        }
        else if (type === "excel") {
          const excelData = rawData.investments.map(inv => ({
            Date: new Date(inv.createdAt).toLocaleDateString(),
            Amount: inv.currentContribution || 0,
            Investor: inv.investor_name || 'N/A',
            Business: inv.business_name || 'N/A',
            Status: inv.status || 'Active',
            ROI: inv.roi ? `${inv.roi}%` : 'N/A'
          }));
          downloadExcel("investment-details.xlsx", excelData, "Investments");
        }
      } 
      else if (report === "user") {
        if (type === "csv") {
          const rows = [
            ["Month", "New Users", "Growth Rate"],
            ...rawData.userGrowth.map((ug, index) => {
              const prevCount = index > 0 ? rawData.userGrowth[index-1].count : 0;
              const growthRate = prevCount > 0 
                ? `${(((ug.count - prevCount) / prevCount) * 100).toFixed(2)}%` 
                : 'N/A';
              return [
                `${ug.year}-${String(ug.month).padStart(2, '0')}`,
                ug.count,
                growthRate
              ];
            })
          ];
          downloadCSV("user-growth-details.csv", rows);
        } 
        else if (type === "pdf") {
          const headers = ["Month", "New Users", "Growth Rate"];
          const body = rawData.userGrowth.map((ug, index) => {
            const prevCount = index > 0 ? rawData.userGrowth[index-1].count : 0;
            const growthRate = prevCount > 0 
              ? `${(((ug.count - prevCount) / prevCount) * 100).toFixed(2)}%` 
              : 'N/A';
            return [
              `${ug.year}-${String(ug.month).padStart(2, '0')}`,
              ug.count,
              growthRate
            ];
          });
          downloadPDF("user-growth-details.pdf", "User Growth Report", headers, body);
        }
        else if (type === "excel") {
          const excelData = rawData.userGrowth.map((ug, index) => {
            const prevCount = index > 0 ? rawData.userGrowth[index-1].count : 0;
            const growthRate = prevCount > 0 
              ? ((ug.count - prevCount) / prevCount) * 100
              : null;
            return {
              Month: `${ug.year}-${String(ug.month).padStart(2, '0')}`,
              'New Users': ug.count,
              'Growth Rate': growthRate ? `${growthRate.toFixed(2)}%` : 'N/A',
              'Cumulative Users': rawData.userGrowth
                .slice(0, index + 1)
                .reduce((sum, item) => sum + item.count, 0)
            };
          });
          downloadExcel("user-growth-details.xlsx", excelData, "User Growth");
        }
      } 
      else if (report === "business") {
        const businessData = topBusinessesData?.rawBusinessData || [];
        
        if (type === "csv") {
          const rows = [
            ["Business", "ROI", "Income", "Expenses", "Owner", "Industry"],
            ...businessData.map(biz => [
              biz.name,
              `${biz.roi}%`,
              `$${(biz.income || 0).toFixed(2)}`,
              `$${(biz.expenses || 0).toFixed(2)}`,
              biz.owner || 'N/A',
              biz.industry || 'N/A'
            ])
          ];
          downloadCSV("top-businesses-details.csv", rows);
        } 
        else if (type === "pdf") {
          const headers = ["Business", "ROI", "Income", "Expenses", "Owner", "Industry"];
          const body = businessData.map(biz => [
            biz.name,
            `${biz.roi}%`,
            `$${(biz.income || 0).toFixed(2)}`,
            `$${(biz.expenses || 0).toFixed(2)}`,
            biz.owner || 'N/A',
            biz.industry || 'N/A'
          ]);
          downloadPDF("top-businesses-details.pdf", "Top Businesses Report", headers, body);
        }
        else if (type === "excel") {
          const excelData = businessData.map(biz => ({
            Business: biz.name,
            ROI: `${biz.roi}%`,
            Income: biz.income || 0,
            Expenses: biz.expenses || 0,
            Profit: (biz.income || 0) - (biz.expenses || 0),
            Owner: biz.owner || 'N/A',
            Industry: biz.industry || 'N/A'
          }));
          downloadExcel("top-businesses-details.xlsx", excelData, "Top Businesses");
        }
      }
      
      toast.success(`Successfully exported ${report} report as ${type.toUpperCase()}`);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error(`Failed to export ${report} report: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const downloadFullDataset = (type) => {
    toast.info(
      <div>
        <strong>Export All Data</strong>
        <div style={{ marginTop: "5px" }}>
          Download complete platform data as <strong>{type.toUpperCase()}</strong>?
          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <button
              onClick={() => {
                toast.dismiss();
                actuallyDownloadFullDataset(type);
              }}
              style={{
                background: "#4caf50",
                border: "none",
                color: "#fff",
                padding: "5px 10px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss()}
              style={{
                background: "#f44336",
                border: "none",
                color: "#fff",
                padding: "5px 10px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>,
      { autoClose: false }
    );
  };

  const actuallyDownloadFullDataset = async (type) => {
    try {
      setExporting(true);
      
      if (type === "excel") {
        // Create a workbook with multiple sheets
        const workbook = XLSX.utils.book_new();
        
        // Investments sheet
        const investmentsData = rawData.investments.map(inv => ({
          Date: new Date(inv.createdAt).toLocaleDateString(),
          Amount: inv.currentContribution || 0,
          Investor: inv.investor_name || 'N/A',
          Business: inv.business_name || 'N/A',
          Status: inv.status || 'Active',
          ROI: inv.roi ? `${inv.roi}%` : 'N/A'
        }));
        const investmentsWS = XLSX.utils.json_to_sheet(investmentsData);
        XLSX.utils.book_append_sheet(workbook, investmentsWS, "Investments");
        
        // User growth sheet
        const userGrowthData = rawData.userGrowth.map((ug, index) => {
          const prevCount = index > 0 ? rawData.userGrowth[index-1].count : 0;
          const growthRate = prevCount > 0 
            ? ((ug.count - prevCount) / prevCount) * 100
            : null;
          return {
            Month: `${ug.year}-${String(ug.month).padStart(2, '0')}`,
            'New Users': ug.count,
            'Growth Rate': growthRate ? `${growthRate.toFixed(2)}%` : 'N/A',
            'Cumulative Users': rawData.userGrowth
              .slice(0, index + 1)
              .reduce((sum, item) => sum + item.count, 0)
          };
        });
        const userGrowthWS = XLSX.utils.json_to_sheet(userGrowthData);
        XLSX.utils.book_append_sheet(workbook, userGrowthWS, "User Growth");
        
        // Businesses sheet
        const businessData = topBusinessesData?.rawBusinessData || [];
        const businessesData = businessData.map(biz => ({
          Business: biz.name || 'N/A',
          Owner: biz.owner || 'N/A',
          Industry: biz.industry || 'N/A',
          Income: biz.income || 0,
          Expenses: biz.expenses || 0,
          Profit: (biz.income || 0) - (biz.expenses || 0),
          ROI: `${biz.roi}%`
        }));
        const businessesWS = XLSX.utils.json_to_sheet(businessesData);
        XLSX.utils.book_append_sheet(workbook, businessesWS, "Businesses");
        
        XLSX.writeFile(workbook, "platform-data-full-report.xlsx");
      }
      else if (type === "pdf") {
        const doc = new jsPDF();
        
        // Investments page
        doc.text("Investments Data", 14, 15);
        autoTable(doc, {
          head: [["Date", "Amount", "Investor", "Business", "Status"]],
          body: rawData.investments.map(inv => [
            new Date(inv.createdAt).toLocaleDateString(),
            `$${inv.currentContribution?.toFixed(2) || '0.00'}`,
            inv.investor_name || 'N/A',
            inv.business_name || 'N/A',
            inv.status || 'Active'
          ]),
          startY: 25
        });
        
        // Add new page for User Growth
        doc.addPage();
        doc.text("User Growth Data", 14, 15);
        autoTable(doc, {
          head: [["Month", "New Users", "Growth Rate"]],
          body: rawData.userGrowth.map((ug, index) => {
            const prevCount = index > 0 ? rawData.userGrowth[index-1].count : 0;
            const growthRate = prevCount > 0 
              ? `${(((ug.count - prevCount) / prevCount) * 100).toFixed(2)}%` 
              : 'N/A';
            return [
              `${ug.year}-${String(ug.month).padStart(2, '0')}`,
              ug.count,
              growthRate
            ];
          }),
          startY: 25
        });
        
        // Add new page for Businesses
        doc.addPage();
        doc.text("Businesses Data", 14, 15);
        const businessData = topBusinessesData?.rawBusinessData || [];
        autoTable(doc, {
          head: [["Business", "ROI", "Income", "Expenses", "Owner", "Industry"]],
          body: businessData.map(biz => [
            biz.name || 'N/A',
            `${biz.roi}%`,
            `$${(biz.income || 0).toFixed(2)}`,
            `$${(biz.expenses || 0).toFixed(2)}`,
            biz.owner || 'N/A',
            biz.industry || 'N/A'
          ]),
          startY: 25
        });
        
        doc.save("platform-data-full-report.pdf");
      }
      
      toast.success(`Successfully exported full platform data as ${type.toUpperCase()}`);
    } catch (err) {
      console.error("Full dataset export failed:", err);
      toast.error(`Failed to export full dataset: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="reports-content">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="reports-header">
        <div className="reports-header-left">
          <FaChartLine className="reports-icon" />
          <h1>Reports & Analytics</h1>
        </div>
        <div className="reports-header-right">
          <button 
            onClick={() => downloadFullDataset("excel")} 
            className="reports-export-btn"
            disabled={exporting}
          >
            <FaFileExcel className="export-icon" /> Export All Data (Excel)
          </button>
          <button 
            onClick={() => downloadFullDataset("pdf")} 
            className="reports-export-btn"
            disabled={exporting}
          >
            <FaFilePdf className="export-icon" /> Export All Data (PDF)
          </button>
        </div>
      </div>

      <div className="reports-banner animate-fade-in">
        <h1>📊 Platform Performance Dashboard</h1>
        <p>
          Comprehensive analytics and visualization tools. Export detailed reports in multiple formats.
        </p>
        {exporting && (
          <div className="export-progress">
            <span>Preparing your download...</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="reports-loading">
          <div className="spinner"></div>
          <p>Loading reports data...</p>
        </div>
      ) : (
        <div className="reports-charts">
          {/* Investment Flow */}
          <div className="reports-card animate-slide-up delay-1">
            <div className="reports-card-header">
              <div className="card-title">
                <FaMoneyBillWave className="card-icon" />
                <h2>Investment Flows</h2>
              </div>
            </div>
            <div className="chart-container">
              {investmentData ? (
                <Line 
                  data={investmentData} 
                  options={{
                    responsive: true,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => `$${context.raw.toLocaleString()}`
                        }
                      }
                    },
                    scales: {
                      y: {
                        ticks: {
                          callback: (value) => `$${value.toLocaleString()}`
                        }
                      }
                    }
                  }}
                />
              ) : (
                <p className="no-data">No investment data available</p>
              )}
            </div>
            <div className="export-options">
              <button
                onClick={() => handleExport("csv", "investment")}
                className="reports-export-btn"
                disabled={exporting}
              >
                <FaFileCsv className="export-icon" /> CSV
              </button>
              <button
                onClick={() => handleExport("pdf", "investment")}
                className="reports-export-btn"
                disabled={exporting}
              >
                <FaFilePdf className="export-icon" /> PDF
              </button>
              <button
                onClick={() => handleExport("excel", "investment")}
                className="reports-export-btn"
                disabled={exporting}
              >
                <FaFileExcel className="export-icon" /> Excel
              </button>
            </div>

          </div>

          {/* User Growth */}
          <div className="reports-card animate-slide-up delay-2">
            <div className="reports-card-header">
              <div className="card-title">
                <FaUsers className="card-icon" />
                <h2>User Growth</h2>
              </div>
            </div>
            <div className="chart-container">
              {userGrowthData ? (
                <Bar 
                  data={userGrowthData} 
                  options={{
                    responsive: true,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.raw} new users`
                        }
                      }
                    }
                  }}
                />
              ) : (
                <p className="no-data">No user growth data available</p>
              )}
            </div>
            <div className="export-options">
              <button
                onClick={() => handleExport("csv", "user")}
                className="reports-export-btn"
                disabled={exporting}
              >
                <FaFileCsv className="export-icon" /> CSV
              </button>
              <button
                onClick={() => handleExport("pdf", "user")}
                className="reports-export-btn"
                disabled={exporting}
              >
                <FaFilePdf className="export-icon" /> PDF
              </button>
              <button
                onClick={() => handleExport("excel", "user")}
                className="reports-export-btn"
                disabled={exporting}
              >
                <FaFileExcel className="export-icon" /> Excel
              </button>
            </div>
  
          </div>

          {/* Top Businesses */}
          <div className="reports-card animate-slide-up delay-3">
            <div className="reports-card-header">
              <div className="card-title">
                <FaBuilding className="card-icon" />
                <h2>Top Performing Businesses</h2>
              </div>
            </div>
            <div className="chart-container">
              {topBusinessesData ? (
                <Pie 
                  data={topBusinessesData} 
                  options={{
                    responsive: true,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value}% (${percentage}% of top performers)`;
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <p className="no-data">No business data available</p>
              )}
            </div>
            <div className="export-options">
              <button
                onClick={() => handleExport("csv", "business")}
                className="reports-export-btn"
                disabled={exporting}
              >
                <FaFileCsv className="export-icon" /> CSV
              </button>
              <button
                onClick={() => handleExport("pdf", "business")}
                className="reports-export-btn"
                disabled={exporting}
              >
                <FaFilePdf className="export-icon" /> PDF
              </button>
              <button
                onClick={() => handleExport("excel", "business")}
                className="reports-export-btn"
                disabled={exporting}
              >
                <FaFileExcel className="export-icon" /> Excel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
