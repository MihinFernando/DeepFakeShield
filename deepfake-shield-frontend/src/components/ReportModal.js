// src/components/ReportModal.js
import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function ReportModal({ show, onClose, file, user, lastScan }) {
  if (!show) return null;

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const reportWithImage = async () => {
    if (!user || !file) return alert("No user or file");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.uid);
    if (lastScan) {
      formData.append("decision", lastScan.decision || lastScan.label || "");
      formData.append("confidence", lastScan.confidence ?? "");
      formData.append("threshold", lastScan.threshold ?? "");
    }
    const res = await fetch(`${API_BASE}/report`, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Report failed");
    alert("Report sent with image!");
    onClose();
  };

  const reportWithoutImage = async () => {
    if (!user) return;
    const body = {
      userId: user.uid,
      decision: lastScan?.decision || lastScan?.label || "",
      confidence: lastScan?.confidence ?? null,
      threshold: lastScan?.threshold ?? null,
    };
    const res = await fetch(`${API_BASE}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Report failed");
    alert("Report sent without image!");
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Report this result?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          This will send a report to admins.  
          If you choose <b>Report with Image</b>, the image file will also be uploaded for review.  
          Otherwise, only the scan details will be reported.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="warning" onClick={reportWithoutImage}>Report (no image)</Button>
        <Button variant="danger" onClick={reportWithImage} disabled={!file}>Report with Image</Button>
      </Modal.Footer>
    </Modal>
  );
}
