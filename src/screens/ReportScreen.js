import React, { useState } from "react";
import { View } from "react-native";
import { Card, Text, HelperText, Snackbar } from "react-native-paper";
import AppTextInput from "../components/AppTextInput";
import AppButton from "../components/AppButton";
import { sendReport } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ReportScreen() {
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [snack, setSnack] = useState("");

  const onSend = async () => {
    setError("");
    try {
      if (!user) throw new Error("Not logged in");
      if (!note.trim()) {
        setError("Please enter a message.");
        return;
      }
      await sendReport(user.uid, { note: note.trim(), filename: filename.trim() || undefined });
      setSnack("Report sent. Thank you!");
      setNote(""); 
      setFilename("");
    } catch (e) {
      setSnack(e.message || "Failed to send report");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Card>
        <Card.Title title="Report / Feedback" subtitle="Tell us about a misclassification or issue" />
        <Card.Content>
          <AppTextInput label="Related filename (optional)" value={filename} onChangeText={setFilename} />
          <AppTextInput
            label="Your message"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={5}
          />
          {!!error && <HelperText type="error" visible>{error}</HelperText>}
        </Card.Content>
        <Card.Actions>
          <AppButton onPress={onSend}>Submit</AppButton>
        </Card.Actions>
      </Card>
      <Snackbar visible={!!snack} onDismiss={() => setSnack("")} duration={3000}>
        {snack}
      </Snackbar>
    </View>
  );
}
