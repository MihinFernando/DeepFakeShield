import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { Text, HelperText } from "react-native-paper";
import AppTextInput from "../components/AppTextInput";
import AppButton from "../components/AppButton";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const onLogin = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pw);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
        <Text variant="headlineLarge" style={{ marginBottom: 12 }}>
          Welcome back
        </Text>
        <Text variant="bodyMedium" style={{ marginBottom: 24, opacity: 0.7 }}>
          Sign in to continue scanning images.
        </Text>

        <AppTextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <AppTextInput label="Password" value={pw} onChangeText={setPw} secureTextEntry />
        {!!error && <HelperText type="error" visible>{error}</HelperText>}

        <AppButton onPress={onLogin}>Sign In</AppButton>
        <AppButton
          mode="text"
          onPress={() => navigation.replace("Register")}
          style={{ marginTop: 8 }}
        >
          Create an account
        </AppButton>
      </View>
    </KeyboardAvoidingView>
  );
}
