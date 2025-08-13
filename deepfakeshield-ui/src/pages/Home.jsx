import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Animation for background elements
  const floatAnimation = keyframes`
    0% { transform: translate(0, 0); }
    25% { transform: translate(100px, 100px); }
    50% { transform: translate(-50px, -100px); }
    75% { transform: translate(-100px, 50px); }
    100% { transform: translate(0, 0); }
  `;

  const scanAnimation = keyframes`
    0% { transform: translateY(0); }
    100% { transform: translateY(100vh); }
  `;

  const analyzeImage = async (file) => {
    setError(null);
    setIsLoading(true);
    setSelectedFile(URL.createObjectURL(file));
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('http://localhost:5000/api/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setResult(response.data.prediction);
        setConfidenceLevel(response.data.confidence);
      } else {
        throw new Error(response.data.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to analyze image');
      setResult(null);
      setConfidenceLevel(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      analyzeImage(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      analyzeImage(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <AppContainer>
      {/* Tech Animation Background */}
      <TechBackground>
        {[...Array(20)].map((_, i) => (
          <Particle 
            key={i} 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          />
        ))}
        <ConnectionLines />
      </TechBackground>
      
      {/* Main Content */}
      <ContentWrapper>
        <Header>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <AuthButton>Register</AuthButton>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <AuthButton primary>Login</AuthButton>
          </motion.div>
        </Header>

        <MainContent>
          <Title>DeepFakeShield</Title>
          <Subtitle>AI-powered deepfake detection</Subtitle>

          <UploadArea
            onClick={triggerFileInput}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            $isDragging={isDragging}
            $hasFile={selectedFile}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            {selectedFile ? (
              <>
                <PreviewImage src={selectedFile} alt="Selected" />
                {isLoading && (
                  <LoadingOverlay>
                    <LoadingSpinner />
                    <LoadingText>Analyzing image...</LoadingText>
                  </LoadingOverlay>
                )}
              </>
            ) : (
              <>
                <UploadIcon
                  animate={{ rotate: isDragging ? 10 : 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  +
                </UploadIcon>
                <UploadText>
                  {isDragging ? 'Drop image here' : 'Click or drag image to upload'}
                </UploadText>
              </>
            )}
          </UploadArea>

          {error && (
            <ErrorMessage>
              {error}
            </ErrorMessage>
          )}

          <AnalysisResults>
            <ConfidenceBar>
              <ConfidenceLabel>Confidence Level:</ConfidenceLabel>
              <ProgressBarContainer>
                <ProgressBarFill 
                  initial={{ width: 0 }}
                  animate={{ width: `${confidenceLevel}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  $confidence={confidenceLevel}
                />
                <ProgressText>{confidenceLevel}%</ProgressText>
              </ProgressBarContainer>
            </ConfidenceBar>

            <ResultContainer>
              <ResultLabel>Result:</ResultLabel>
              <ResultText $isReal={result === 'REAL'}>
                {result || '--'}
              </ResultText>
            </ResultContainer>
          </AnalysisResults>
        </MainContent>

        <Footer>
          <InfoText>ⓘ Results are generated by AI.</InfoText>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <LearnMoreButton 
              href="https://example.com" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Learn More →
            </LearnMoreButton>
          </motion.div>
        </Footer>
      </ContentWrapper>
    </AppContainer>
  );
};

// New styled components
const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid #3b82f6;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: white;
  margin-top: 1rem;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  width: 100%;
  max-width: 500px;
  padding: 1rem;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
`;

// ... (keep all other styled components the same as in your original file)

export default Home;