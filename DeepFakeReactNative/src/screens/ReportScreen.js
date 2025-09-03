import React, { useState } from "react";
import { View, StyleSheet, StatusBar, ScrollView, Animated, KeyboardAvoidingView, Platform } from "react-native";
import { Card, Text, HelperText, Snackbar, Surface, IconButton, Chip } from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import AppTextInput from "../components/AppTextInput";
import AppButton from "../components/AppButton";
import { sendReport } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ReportScreen({ navigation }) {
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [filename, setFilename] = useState("");
  const [reportType, setReportType] = useState("");
  const [error, setError] = useState("");
  const [snack, setSnack] = useState("");
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { id: 'misclassification', label: 'Misclassification', icon: 'alert-circle', color: '#FF6B6B' },
    { id: 'bug', label: 'Bug Report', icon: 'bug', color: '#FFA726' },
    { id: 'feature', label: 'Feature Request', icon: 'lightbulb', color: '#66BB6A' },
    { id: 'other', label: 'Other Feedback', icon: 'message', color: '#42A5F5' },
  ];

  const onSend = async () => {
    setError("");
    setLoading(true);
    try {
      if (!user) throw new Error("Not logged in");
      if (!note.trim()) {
        setError("Please enter a message.");
        return;
      }
      await sendReport(user.uid, { 
        note: note.trim(), 
        filename: filename.trim() || undefined,
        type: reportType || 'other'
      });
      setSnack("Report sent successfully! Thank you for your feedback.");
      setNote(""); 
      setFilename("");
      setReportType("");
    } catch (e) {
      setSnack(e.message || "Failed to send report");
    } finally {
      setLoading(false);
    }
  };

  const selectedType = reportTypes.find(type => type.id === reportType);
  const canSubmit = note.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
    >
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
              Send Feedback
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Help us improve our deepfake detection
            </Text>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Surface style={styles.formContainer} elevation={8}>
            <View style={styles.formContent}>
              
              {/* Report Type Selection */}
              <View style={styles.sectionContainer}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  What type of feedback is this?
                </Text>
                <Text variant="bodySmall" style={styles.sectionSubtitle}>
                  Select the category that best describes your feedback
                </Text>
                
                <View style={styles.typeGrid}>
                  {reportTypes.map((type) => (
                    <Surface
                      key={type.id}
                      style={[
                        styles.typeCard,
                        reportType === type.id && { ...styles.selectedTypeCard, borderColor: type.color }
                      ]}
                      elevation={reportType === type.id ? 4 : 1}
                    >
                      <IconButton
                        icon={type.icon}
                        iconColor={reportType === type.id ? type.color : '#718096'}
                        size={24}
                        onPress={() => setReportType(type.id)}
                        style={styles.typeIcon}
                      />
                      <Text
                        variant="bodySmall"
                        style={[
                          styles.typeLabel,
                          reportType === type.id && { color: type.color, fontWeight: '600' }
                        ]}
                        onPress={() => setReportType(type.id)}
                      >
                        {type.label}
                      </Text>
                    </Surface>
                  ))}
                </View>
              </View>

              {/* Optional Filename */}
              <View style={styles.sectionContainer}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Related File (Optional)
                </Text>
                <AppTextInput 
                  label="Filename or scan reference" 
                  value={filename} 
                  onChangeText={setFilename}
                  style={styles.input}
                  mode="outlined"
                  left={<AppTextInput.Icon icon="file-document-outline" />}
                  placeholder="e.g., image_001.jpg"
                />
                <HelperText type="info" visible>
                  If your feedback relates to a specific scan, enter the filename here
                </HelperText>
              </View>

              {/* Message */}
              <View style={styles.sectionContainer}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Your Message *
                </Text>
                <AppTextInput
                  label="Describe your feedback in detail"
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={6}
                  style={[styles.input, styles.messageInput]}
                  mode="outlined"
                  left={<AppTextInput.Icon icon="message-text-outline" />}
                  placeholder={getPlaceholder(reportType)}
                />
                <View style={styles.characterCount}>
                  <Text variant="bodySmall" style={styles.characterCountText}>
                    {note.length}/1000 characters
                  </Text>
                </View>
                {!!error && <HelperText type="error" visible>{error}</HelperText>}
              </View>

              {/* Submit Button */}
              <AppButton 
                onPress={onSend}
                loading={loading}
                disabled={!canSubmit || loading}
                style={[
                  styles.submitButton,
                  { 
                    opacity: canSubmit ? 1 : 0.6,
                    backgroundColor: selectedType?.color || '#667eea'
                  }
                ]}
                labelStyle={styles.submitButtonText}
              >
                {loading ? "Sending..." : "Send Feedback"}
              </AppButton>

              {/* Footer Info */}
              <View style={styles.footerInfo}>
                <Surface style={styles.infoCard} elevation={1}>
                  <IconButton icon="information" iconColor="#4A90E2" size={20} />
                  <Text variant="bodySmall" style={styles.infoText}>
                    Your feedback helps us improve our AI detection accuracy and user experience. 
                    We typically respond within 24-48 hours.
                  </Text>
                </Surface>
              </View>
            </View>
          </Surface>
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
    </KeyboardAvoidingView>
  );
}

function getPlaceholder(reportType) {
  switch (reportType) {
    case 'misclassification':
      return 'Please describe what the AI got wrong and what the correct result should have been...';
    case 'bug':
      return 'Describe the bug you encountered and the steps to reproduce it...';
    case 'feature':
      return 'Tell us about a feature you\'d like to see added or improved...';
    default:
      return 'Share your thoughts, suggestions, or any other feedback...';
  }
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
    paddingBottom: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    marginTop: 10,
  },
  formContent: {
    padding: 24,
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#2D3748',
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#718096',
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedTypeCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
  },
  typeIcon: {
    margin: 0,
  },
  typeLabel: {
    color: '#718096',
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
  },
  input: {
    backgroundColor: '#F7FAFC',
    marginBottom: 8,
  },
  messageInput: {
    minHeight: 120,
  },
  characterCount: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  characterCountText: {
    color: '#718096',
  },
  submitButton: {
    borderRadius: 16,
    marginTop: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 4,
  },
  footerInfo: {
    marginTop: 24,
  },
  infoCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  infoText: {
    flex: 1,
    color: '#2D3748',
    lineHeight: 18,
    marginLeft: 8,
  },
  snackbar: {
    backgroundColor: '#2D3748',
  },
});