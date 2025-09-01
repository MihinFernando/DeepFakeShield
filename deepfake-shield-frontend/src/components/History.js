// src/components/History.js
import React, { useEffect, useMemo, useState } from 'react';
import { Card, Spinner, Table, Button, Row, Col, Badge } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const History = ({ user, refreshKey = 0 }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch history from backend (Firestore-backed)
  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    setErrMsg('');
    try {
      const res = await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Normalize + sort (fallback if backend didn’t sort)
      const items = Array.isArray(data) ? data : [];
      items.forEach(d => {
        // Ensure timestamp is a string
        if (d.timestamp && typeof d.timestamp !== 'string' && d.timestamp?.toString) {
          d.timestamp = String(d.timestamp);
        }
      });
      items.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

      setHistory(items);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Failed to fetch history', e);
      setErrMsg('Failed to load history. Please try again.');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refreshKey]);

  // Stats
  const stats = useMemo(() => {
    const total = history.length;
    const ai = history.filter(h => (h.decision || h.label || '').toLowerCase() === 'fake').length;
    const real = total - ai;
    const aiPct = total ? Math.round((ai / total) * 100) : 0;
    const realPct = total ? Math.round((real / total) * 100) : 0;
    return { total, ai, real, aiPct, realPct };
  }, [history]);

  // Chart (donut) with readable colors
  const chartData = useMemo(() => ({
    labels: ['AI-generated', 'Real'],
    datasets: [
      {
        data: [stats.ai, stats.real],
        backgroundColor: ['rgba(255, 45, 117, 0.45)', 'rgba(0, 204, 255, 0.45)'],
        borderColor:   ['rgba(255, 45, 117, 0.9)',  'rgba(0, 204, 255, 0.9)'],
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  }), [stats]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e6edf3',
          font: { size: 13, weight: 500 },
          boxWidth: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(20, 24, 34, 0.92)',
        titleColor: '#e6edf3',
        bodyColor: '#e6edf3',
        borderColor: 'rgba(0, 204, 255, 0.5)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) => {
            const val = ctx.raw ?? 0;
            const pct = stats.total ? Math.round((val / stats.total) * 100) : 0;
            return ` ${ctx.label}: ${val} (${pct}%)`;
          },
        },
      },
    },
  };

  // CSV export
  const exportCSV = () => {
    const headers = ['filename', 'decision', 'confidence', 'threshold', 'timestamp'];
    const rows = history.map(h => ([
      h.filename ?? '',
      (h.decision || h.label || '').toUpperCase(),
      h.confidence != null ? (Number(h.confidence) * 100).toFixed(2) + '%' : '',
      h.threshold != null ? Math.round(Number(h.threshold) * 100) + '%' : '',
      typeof h.timestamp === 'string' ? h.timestamp : '',
    ]));
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'deepfake_history.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // NEW: Report from history (no image available here)
  const reportFromHistory = async (item) => {
    if (!user) return;
    try {
      const body = {
        userId: user.uid,
        decision: item.decision || item.label || '',
        confidence: item.confidence ?? null,
        threshold: item.threshold ?? null,
        filename: item.filename || '',
      };
      const res = await fetch(`${API_BASE}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Report failed');
      alert('Thanks! Report sent without saving the image.');
    } catch (e) {
      console.error('Report failed', e);
      alert(e.message || 'Report failed');
    }
  };

  if (!user) return null;

  return (
    <Card className="custom-card p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h4 className="text-glow mb-0">History & Insights</h4>
        <div className="d-flex align-items-center gap-2">
          {lastUpdated && (
            <small className="text-light-muted">
              Updated: {lastUpdated.toLocaleTimeString()}
            </small>
          )}
          <Button size="sm" variant="outline-secondary" onClick={fetchHistory}>
            Refresh
          </Button>
          <Button size="sm" variant="outline-info" onClick={exportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : errMsg ? (
        <p className="text-warning mb-0">{errMsg}</p>
      ) : history.length === 0 ? (
        <p className="text-light-muted">No history found yet.</p>
      ) : (
        <>
          {/* KPIs */}
          <Row className="mb-4 text-center g-3">
            <Col xs={12} md={4}>
              <div className="kpi-box">
                <div className="kpi-title">Total</div>
                <div className="kpi-value">{stats.total}</div>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="kpi-box">
                <div className="kpi-title">AI-generated</div>
                <div className="kpi-value">
                  {stats.ai} <Badge bg="danger" pill className="ms-2">{stats.aiPct}%</Badge>
                </div>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="kpi-box">
                <div className="kpi-title">Real</div>
                <div className="kpi-value">
                  {stats.real} <Badge bg="info" pill className="ms-2">{stats.realPct}%</Badge>
                </div>
              </div>
            </Col>
          </Row>

          {/* Donut chart */}
          <div className="mb-4 chart-wrap">
            <Pie data={chartData} options={chartOptions} />
          </div>

          {/* Table */}
          <div className="table-responsive">
            <Table bordered hover variant="dark" size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Filename</th>
                  <th>Decision</th>
                  <th>Confidence</th>
                  <th>Threshold</th>
                  <th>Timestamp</th>
                  <th>Actions</th> {/* NEW */}
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td className="text-truncate" style={{ maxWidth: 260 }}>
                      {item.filename}
                    </td>
                    <td>{(item.decision || item.label || '').toUpperCase()}</td>
                    <td>{item.confidence != null ? (Number(item.confidence) * 100).toFixed(2) + '%' : ''}</td>
                    <td>{item.threshold != null ? Math.round(Number(item.threshold) * 100) + '%' : ''}</td>
                    <td>{typeof item.timestamp === 'string' ? item.timestamp : ''}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-warning"
                        onClick={() => reportFromHistory(item)}
                      >
                        Report
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </Card>
  );
};

export default History;
