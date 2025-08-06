// src/components/History.js
import React, { useEffect, useState } from 'react';
import { Card, Spinner, Table } from 'react-bootstrap';

const History = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:5000/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.uid }),
        });

        const data = await res.json();
        setHistory(data.reverse()); // show latest first
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (!user) return null;

  return (
    <Card className="mt-4 p-3" style={{ backgroundColor: '#2e2e3e', border: 'none' }}>
      <h5 className="mb-3 text-light">Scan History</h5>

      {loading ? (
        <Spinner animation="border" />
      ) : history.length === 0 ? (
        <p className="text-muted">No history found.</p>
      ) : (
        <Table striped bordered hover variant="dark" size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Result</th>
              <th>Confidence</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.filename}</td>
                <td>{item.label.toUpperCase()}</td>
                <td>{(item.confidence * 100).toFixed(2)}%</td>
                <td>{item.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
};

export default History;