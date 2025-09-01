import React, { useState } from "react";
import { View, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Text, Card, ActivityIndicator, Snackbar } from "react-native-paper";
import AppButton from "../components/AppButton";
import { uploadScan } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ScanScreen({ navigation }) {
  const { user } = useAuth();
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [snack, setSnack] = useState("");

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setSnack("Permission to access gallery is required.");
      return;
    }
    const pick = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: false,
      quality: 1,
    });
    if (!pick.canceled && pick.assets?.[0]?.uri) setImageUri(pick.assets[0].uri);
  };

  const onUpload = async () => {
    if (!user || !imageUri) return;
    setLoading(true);
    try {
      const r = await uploadScan(imageUri, user.uid);
      setResult(r);
      setSnack(`Prediction: ${r.decision.toUpperCase()} (${(r.confidence * 100).toFixed(1)}%)`);
    } catch (e) {
      setSnack(e.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Card style={{ marginBottom: 12 }}>
        <Card.Title title="Scan an Image" subtitle="Pick an image and send it to the detector" />
        <Card.Content>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: 220, borderRadius: 12 }}
            />
          ) : (
            <Text style={{ opacity: 0.7 }}>No image selected.</Text>
          )}
        </Card.Content>
        <Card.Actions>
          <AppButton mode="outlined" onPress={pickImage}>Choose Image</AppButton>
          <AppButton onPress={onUpload} disabled={!imageUri || loading} style={{ marginLeft: 8 }}>
            {loading ? "Scanning..." : "Upload & Scan"}
          </AppButton>
        </Card.Actions>
      </Card>

      {loading && <ActivityIndicator />}

      {result && (
        <Card>
          <Card.Title
            title={`Decision: ${result.decision.toUpperCase()}`}
            subtitle={`Confidence: ${(result.confidence * 100).toFixed(1)}%`}
          />
          <Card.Content>
            <Text>Raw label: {result.label}</Text>
            <Text>Threshold: {(result.threshold * 100).toFixed(0)}%</Text>
            <Text>Time: {result.timestamp}</Text>
          </Card.Content>
          <Card.Actions>
            <AppButton onPress={() => navigation.navigate("Dashboard")}>
              Back to Dashboard
            </AppButton>
          </Card.Actions>
        </Card>
      )}

      <Snackbar visible={!!snack} onDismiss={() => setSnack("")} duration={3000}>
        {snack}
      </Snackbar>
    </View>
  );
}
