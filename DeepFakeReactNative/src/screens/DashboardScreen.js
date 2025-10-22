import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl, StyleSheet, StatusBar, ScrollView } from "react-native";
import { Avatar, Card, Text, IconButton, ActivityIndicator, Chip, Surface } from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import AppButton from "../components/AppButton";
import { fetchHistory } from "../api";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchHistory(user.uid);
      setItems(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const getStatusColor = (decision) => {
    switch (decision?.toLowerCase()) {
      case 'fake': return '#FF6B6B';
      case 'real': return '#4ECDC4';
      case 'authentic': return '#45B7D1';
      default: return '#95A5A6';
    }
  };

  const getStatusIcon = (decision) => {
    switch (decision?.toLowerCase()) {
      case 'fake': return 'alert-circle';
      case 'real': return 'check-circle';
      case 'authentic': return 'shield-check';
      default: return 'help-circle';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.userSection}>
          <Avatar.Text
            label={(user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase()}
            size={56}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text variant="headlineSmall" style={styles.userName}>
              {user?.displayName?.split(' ')[0] || 'User'}
            </Text>
            <Text variant="bodyMedium" style={styles.userEmail}>
              {user?.email}
            </Text>
          </View>
          <IconButton 
            icon="logout" 
            iconColor="#FFFFFF"
            size={24}
            onPress={() => signOut(auth)}
            style={styles.logoutButton}
          />
        </View>
      </LinearGradient>
      
      <View style={styles.statsContainer}>
        <Surface style={styles.statCard} elevation={2}>
          <Text variant="headlineMedium" style={styles.statNumber}>
            {items.length}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Total Scans
          </Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text variant="headlineMedium" style={[styles.statNumber, { color: '#FF6B6B' }]}>
            {items.filter(item => item.decision === 'fake').length}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Fake Detected
          </Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text variant="headlineMedium" style={[styles.statNumber, { color: '#4ECDC4' }]}>
            {items.filter(item => item.decision === 'real' || item.decision === 'authentic').length}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Authentic
          </Text>
        </Surface>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <AppButton 
        onPress={() => navigation.navigate("Scan")} 
        style={[styles.primaryButton, { backgroundColor: '#667eea' }]}
        labelStyle={styles.buttonLabel}
      >
        🔍 New Scan
      </AppButton>
      <AppButton
        mode="outlined"
        onPress={() => navigation.navigate("Report")}
        style={styles.secondaryButton}
        labelStyle={[styles.buttonLabel, { color: '#667eea' }]}
      >
        📋 Send Report
      </AppButton>
    </View>
  );

  const renderScanItem = ({ item, index }) => (
    <Card style={[styles.scanCard, { marginTop: index === 0 ? 0 : 12 }]} elevation={3}>
      <View style={styles.cardHeader}>
        <View style={styles.statusContainer}>
          <Avatar.Icon
            size={40}
            icon={getStatusIcon(item.decision)}
            style={[styles.statusIcon, { backgroundColor: getStatusColor(item.decision) }]}
          />
          <View style={styles.statusInfo}>
            <Chip 
              mode="flat" 
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.decision) + '20' }]}
              textStyle={[styles.statusText, { color: getStatusColor(item.decision) }]}
            >
              {item.decision?.toUpperCase() || "UNKNOWN"}
            </Chip>
            <Text variant="bodySmall" style={styles.timestamp}>
              {formatDate(item.timestamp)}
            </Text>
          </View>
        </View>
      </View>
      
      <Card.Content style={styles.cardContent}>
        <View style={styles.detailRow}>
          <Text variant="bodySmall" style={styles.detailLabel}>File:</Text>
          <Text variant="bodySmall" style={styles.detailValue} numberOfLines={1}>
            {item.filename || "Unknown file"}
          </Text>
        </View>
        
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text variant="bodySmall" style={styles.metricLabel}>Confidence</Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { 
                    width: `${(item.confidence || 0) * 100}%`,
                    backgroundColor: getStatusColor(item.decision)
                  }
                ]} 
              />
            </View>
            <Text variant="bodySmall" style={styles.metricValue}>
              {item.confidence != null ? (item.confidence * 100).toFixed(1) + "%" : "N/A"}
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text variant="bodySmall" style={styles.metricLabel}>Threshold</Text>
            <Text variant="bodySmall" style={styles.metricValue}>
              {item.threshold != null ? (item.threshold * 100).toFixed(0) + "%" : "N/A"}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderActionButtons()}
        
        <View style={styles.recentScansSection}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Recent Scans
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Loading your scans...
              </Text>
            </View>
          ) : items.length === 0 ? (
            <Surface style={styles.emptyState} elevation={1}>
              <Text variant="headlineSmall" style={styles.emptyTitle}>
                🔍 No scans yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptyMessage}>
                Start by scanning your first image to detect authenticity
              </Text>
              <AppButton 
                onPress={() => navigation.navigate("Scan")}
                style={styles.emptyButton}
              >
                Start Scanning
              </AppButton>
            </Surface>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(_, idx) => String(idx)}
              renderItem={renderScanItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: 24,
  },
  gradientHeader: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#2D3748',
  },
  statLabel: {
    color: '#718096',
    marginTop: 4,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  primaryButton: {
    borderRadius: 16,
    marginBottom: 12,
    elevation: 4,
  },
  secondaryButton: {
    borderRadius: 16,
    borderColor: '#667eea',
    borderWidth: 2,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 4,
  },
  recentScansSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 16,
  },
  scanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timestamp: {
    color: '#718096',
  },
  cardContent: {
    paddingTop: 0,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#718096',
    width: 40,
  },
  detailValue: {
    flex: 1,
    color: '#2D3748',
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    marginRight: 16,
  },
  metricLabel: {
    color: '#718096',
    marginBottom: 4,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricValue: {
    color: '#2D3748',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#718096',
    marginTop: 12,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#2D3748',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyMessage: {
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
  },
});