// Use your LAN IP or hosted URL:
const API_BASE_URL = "http://192.168.8.226:5000";

export async function apiLogin(email, password) {
  // Using Firebase Auth in the app, so this is unused.
  return;
}

export async function fetchHistory(userId) {
  const res = await fetch(`${API_BASE_URL}/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadScan(fileUri, userId) {
  const filename = fileUri.split("/").pop() || "image.jpg";
  const formData = new FormData();
  formData.append("userId", userId);
  // React Native FormData file type
  formData.append("file", { uri: fileUri, type: "image/jpeg", name: filename });

  const res = await fetch(`${API_BASE_URL}/scan`, {
    method: "POST",
    headers: { "Accept": "application/json" },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function sendReport(userId, payload) {
  const res = await fetch(`${API_BASE_URL}/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...payload }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
