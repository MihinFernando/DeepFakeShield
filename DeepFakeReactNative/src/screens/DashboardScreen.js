import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { Avatar, Card, Text, IconButton, ActivityIndicator } from "react-native-paper";
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

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Avatar.Text
          label={(user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase()}
          size={40}
        />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text variant="titleMedium">{user?.displayName || user?.email}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.7 }}>{user?.email}</Text>
        </View>
        <IconButton icon="logout" onPress={() => signOut(auth)} />
      </View>

      <AppButton onPress={() => navigation.navigate("Scan")} style={{ marginBottom: 12 }}>
        New Scan
      </AppButton>
      <AppButton
        mode="outlined"
        onPress={() => navigation.navigate("Report")}
        style={{ marginBottom: 12 }}
      >
        Send Report / Feedback
      </AppButton>

      <Text variant="titleMedium" style={{ marginVertical: 8 }}>Recent Scans</Text>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(_, idx) => String(idx)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 10 }}>
              <Card.Title
                title={item.decision?.toUpperCase() || "UNKNOWN"}
                subtitle={item.timestamp || ""}
                left={(props) => (
                  <Avatar.Icon
                    {...props}
                    icon={item.decision === "fake" ? "alert" : "check"}
                  />
                )}
              />
              <Card.Content>
                <Text>Filename: {item.filename || "-"}</Text>
                <Text>
                  Confidence: {item.confidence != null ? (item.confidence * 100).toFixed(1) + "%" : "-"}
                </Text>
                <Text>
                  Threshold: {item.threshold != null ? (item.threshold * 100).toFixed(0) + "%" : "-"}
                </Text>
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={<Text style={{ opacity: 0.6 }}>No scans yet.</Text>}
        />
      )}
    </View>
  );
}
