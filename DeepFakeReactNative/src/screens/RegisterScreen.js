import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { Text, HelperText } from "react-native-paper";
import AppTextInput from "../components/AppTextInput";
import AppButton from "../components/AppButton";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../config/firebase";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const onRegister = async () => {
    setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      // user is now logged in automatically
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
          Create account
        </Text>
        <Text variant="bodyMedium" style={{ marginBottom: 24, opacity: 0.7 }}>
          Sign up to start scanning images for deepfake detection.
        </Text>

        <AppTextInput label="Full name" value={name} onChangeText={setName} />
        <AppTextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <AppTextInput label="Password" value={pw} onChangeText={setPw} secureTextEntry />

        {!!error && <HelperText type="error" visible>{error}</HelperText>}

        <AppButton onPress={onRegister}>Sign Up</AppButton>
        <AppButton
          mode="text"
          onPress={() => navigation.replace("Login")}
          style={{ marginTop: 8 }}
        >
          Already have an account? Sign in
        </AppButton>
      </View>
    </KeyboardAvoidingView>
  );
}
