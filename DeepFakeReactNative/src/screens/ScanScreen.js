import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, StatusBar, ScrollView, Dimensions, Animated } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Text, Card, ActivityIndicator, Snackbar, Surface, IconButton, ProgressBar, Chip } from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import AppButton from "../components/AppButton";
import { uploadScan } from "../api";
import { useAuth } from "../context/AuthContext";

const { width: screenWidth } = Dimensions.get('window');

export default function ScanScreen({ navigation }) {
  const { user } = useAuth();
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [snack, setSnack] = useState("");
  const [progress, setProgress] = useState(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (result) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [result]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setSnack("Camera roll permission is required to select images.");
      return;
    }
    const pick = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: false,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!pick.canceled && pick.assets?.[0]?.uri) {
      setImageUri(pick.assets[0].uri);
      setResult(null); // Clear previous result
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      setSnack("Camera permission is required to take photos.");
      return;
    }
    const photo = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: false,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!photo.canceled && photo.assets?.[0]?.uri) {
      setImageUri(photo.assets[0].uri);
      setResult(null); // Clear previous result
    }
  };

  const onUpload = async () => {
    if (!user || !imageUri) return;
    setLoading(true);
    setProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 0.9) {
          clearInterval(progressInterval);
          return 0.9;
        }
        return prev + 0.1;
      });
    }, 200);

    try {
      const r = await uploadScan(imageUri, user.uid);
      setProgress(1);
      setTimeout(() => {
        setResult(r);
        setSnack(`Analysis complete: ${r.decision.toUpperCase()}`);
      }, 500);
    } catch (e) {
      setSnack(e.message || "Upload failed. Please try again.");
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setProgress(0);
    }
  };

  const getResultColor = (decision) => {
    switch (decision?.toLowerCase()) {
      case 'fake': return '#FF6B6B';
      case 'real': return '#4ECDC4';
      case 'authentic': return '#45B7D1';
      default: return '#95A5A6';
    }
  };

  const getResultIcon = (decision) => {
    switch (decision?.toLowerCase()) {
      case 'fake': return 'alert-circle';
      case 'real': return 'check-circle';
      case 'authentic': return 'shield-check';
      default: return 'help-circle';
    }
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.8) return { level: 'High', color: '#4ECDC4' };
    if (confidence >= 0.6) return { level: 'Medium', color: '#FFD93D' };
    return { level: 'Low', color: '#FF6B6B' };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            iconColor="#FFFFFF"
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <View style={styles.headerContent}>
            <Text variant="headlineMedium" style={styles.headerTitle}>
              Deepfake Scanner
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Upload an image to analyze its authenticity
            </Text>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Selection Card */}
          <Surface style={styles.imageCard} elevation={8}>
            <View style={styles.imageContainer}>
              {imageUri ? (
                <View style={styles.selectedImageContainer}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.selectedImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay}>
                    <IconButton
                      icon="close"
                      iconColor="#FFFFFF"
                      style={styles.removeImageButton}
                      onPress={() => setImageUri(null)}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.placeholderContainer}>
                  <IconButton
                    icon="image-plus"
                    iconColor="#667eea"
                    size={48}
                    style={styles.placeholderIcon}
                  />
                  <Text variant="titleMedium" style={styles.placeholderTitle}>
                    Select an Image
                  </Text>
                  <Text variant="bodyMedium" style={styles.placeholderSubtitle}>
                    Choose from gallery or take a photo to analyze
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <AppButton
                mode="outlined"
                onPress={pickImage}
                style={[styles.actionButton, styles.galleryButton]}
                labelStyle={styles.buttonLabel}
                icon="image"
              >
                Gallery
              </AppButton>
              <AppButton
                mode="outlined"
                onPress={takePhoto}
                style={[styles.actionButton, styles.cameraButton]}
                labelStyle={styles.buttonLabel}
                icon="camera"
              >
                Camera
              </AppButton>
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <Text variant="bodyMedium" style={styles.loadingText}>
                  Analyzing image with AI...
                </Text>
                <ProgressBar 
                  progress={progress} 
                  color="#667eea"
                  style={styles.progressBar}
                />
                <ActivityIndicator size="small" color="#667eea" style={styles.spinner} />
              </View>
            )}

            <AppButton
              onPress={onUpload}
              disabled={!imageUri || loading}
              loading={loading}
              style={[
                styles.scanButton,
                { opacity: (!imageUri || loading) ? 0.6 : 1 }
              ]}
              labelStyle={styles.scanButtonText}
              icon="magnify-scan"
            >
              {loading ? "Analyzing..." : "Analyze Image"}
            </AppButton>
          </Surface>

          {/* Results Card */}
          {result && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Surface style={styles.resultCard} elevation={8}>
                <View style={styles.resultHeader}>
                  <IconButton
                    icon={getResultIcon(result.decision)}
                    iconColor={getResultColor(result.decision)}
                    size={48}
                    style={[styles.resultIcon, { backgroundColor: getResultColor(result.decision) + '20' }]}
                  />
                  <View style={styles.resultInfo}>
                    <Text variant="headlineSmall" style={[styles.resultDecision, { color: getResultColor(result.decision) }]}>
                      {result.decision.toUpperCase()}
                    </Text>
                    <Chip 
                      mode="flat"
                      style={[styles.confidenceChip, { backgroundColor: getConfidenceLevel(result.confidence).color + '20' }]}
                      textStyle={[styles.confidenceText, { color: getConfidenceLevel(result.confidence).color }]}
                    >
                      {getConfidenceLevel(result.confidence).level} Confidence
                    </Chip>
                  </View>
                </View>

                <View style={styles.metricsContainer}>
                  <View style={styles.metricRow}>
                    <View style={styles.metricItem}>
                      <Text variant="bodySmall" style={styles.metricLabel}>Confidence Score</Text>
                      <Text variant="titleMedium" style={styles.metricValue}>
                        {(result.confidence * 100).toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text variant="bodySmall" style={styles.metricLabel}>Detection Threshold</Text>
                      <Text variant="titleMedium" style={styles.metricValue}>
                        {(result.threshold * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.confidenceBarContainer}>
                    <Text variant="bodySmall" style={styles.confidenceBarLabel}>
                      Confidence Level
                    </Text>
                    <View style={styles.confidenceBar}>
                      <View 
                        style={[
                          styles.confidenceFill, 
                          { 
                            width: `${result.confidence * 100}%`,
                            backgroundColor: getResultColor(result.decision)
                          }
                        ]} 
                      />
                    </View>
                  </View>

                  {result.label && (
                    <View style={styles.additionalInfo}>
                      <Text variant="bodySmall" style={styles.additionalLabel}>
                        Raw Detection Label:
                      </Text>
                      <Text variant="bodyMedium" style={styles.additionalValue}>
                        {result.label}
                      </Text>
                    </View>
                  )}

                  {result.timestamp && (
                    <View style={styles.additionalInfo}>
                      <Text variant="bodySmall" style={styles.additionalLabel}>
                        Analysis Time:
                      </Text>
                      <Text variant="bodyMedium" style={styles.additionalValue}>
                        {new Date(result.timestamp).toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.resultActions}>
                  <AppButton
                    mode="outlined"
                    onPress={() => setResult(null)}
                    style={styles.newScanButton}
                    labelStyle={styles.newScanButtonText}
                    icon="refresh"
                  >
                    New Scan
                  </AppButton>
                  <AppButton
                    onPress={() => navigation.navigate("Dashboard")}
                    style={styles.dashboardButton}
                    labelStyle={styles.dashboardButtonText}
                    icon="view-dashboard"
                  >
                    Dashboard
                  </AppButton>
                </View>
              </Surface>
            </Animated.View>
          )}
        </ScrollView>

        <Snackbar 
          visible={!!snack} 
          onDismiss={() => setSnack("")} 
          duration={4000}
          style={styles.snackbar}
          action={{
            label: 'OK',
            onPress: () => setSnack(''),
          }}
        >
          {snack}
        </Snackbar>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  imageContainer: {
    marginBottom: 24,
  },
  selectedImageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  selectedImage: {
    width: screenWidth - 88,
    height: screenWidth - 88,
    borderRadius: 16,
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  removeImageButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  placeholderIcon: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    marginBottom: 16,
  },
  placeholderTitle: {
    color: '#2D3748',
    fontWeight: '600',
    marginBottom: 8,
  },
  placeholderSubtitle: {
    color: '#718096',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderColor: '#667eea',
    borderWidth: 2,
  },
  galleryButton: {
    marginRight: 8,
  },
  cameraButton: {
    marginLeft: 8,
  },
  buttonLabel: {
    color: '#667eea',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
  },
  loadingText: {
    color: '#718096',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginBottom: 12,
  },
  spinner: {
    marginTop: 8,
  },
  scanButton: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    elevation: 4,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 4,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultIcon: {
    marginRight: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultDecision: {
    fontWeight: '700',
    marginBottom: 8,
  },
  confidenceChip: {
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricsContainer: {
    marginBottom: 24,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  metricLabel: {
    color: '#718096',
    marginBottom: 4,
  },
  metricValue: {
    color: '#2D3748',
    fontWeight: '700',
  },
  confidenceBarContainer: {
    marginBottom: 16,
  },
  confidenceBarLabel: {
    color: '#718096',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  additionalLabel: {
    color: '#718096',
    flex: 1,
  },
  additionalValue: {
    color: '#2D3748',
    flex: 2,
    textAlign: 'right',
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  newScanButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#667eea',
    borderWidth: 2,
  },
  newScanButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  dashboardButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#667eea',
  },
  dashboardButtonText: {
    fontWeight: '600',
  },
  snackbar: {
    backgroundColor: '#2D3748',
  },
});