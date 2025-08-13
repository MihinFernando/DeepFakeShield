document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('imageInput');
  const fileName = document.getElementById('fileName');
  const scanBtn = document.getElementById('scanBtn');
  const resultContainer = document.getElementById('resultContainer');
  const resultText = document.getElementById('resultText');
  const confidenceMeter = document.getElementById('confidenceMeter');
  const confidenceText = document.getElementById('confidenceText');

  // Update UI when file is selected
  input.addEventListener('change', () => {
    if (input.files.length) {
      fileName.textContent = input.files[0].name;
      scanBtn.disabled = false;
      resultContainer.style.display = 'none';
    } else {
      fileName.textContent = 'No file selected';
      scanBtn.disabled = true;
    }
  });

  // Scan button click handler
  scanBtn.addEventListener('click', async () => {
    if (!input.files.length) return;

    scanBtn.disabled = true;
    scanBtn.textContent = 'Scanning...';
    resultContainer.style.display = 'none';

    const formData = new FormData();
    formData.append('file', input.files[0]);

    try {
      const response = await fetch('http://127.0.0.1:5000/scan', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      
      // Update result display
      resultText.textContent = data.label === 'fake' ? 
        'Potential Deepfake Detected' : 
        'Real Image';
      
      const confidencePercent = Math.round(data.confidence * 100);
      confidenceMeter.style.width = `${confidencePercent}%`;
      confidenceMeter.style.backgroundColor = data.label === 'fake' ? '#e74c3c' : '#2ecc71';
      confidenceText.textContent = `Confidence: ${confidencePercent}%`;
      
      resultContainer.style.display = 'block';
    } catch (error) {
      resultText.textContent = 'Error: ' + (error.message || 'Scan failed');
      confidenceText.textContent = '';
      resultContainer.style.display = 'block';
      console.error('Scan error:', error);
    } finally {
      scanBtn.disabled = false;
      scanBtn.textContent = 'Scan Image';
    }
  });
});