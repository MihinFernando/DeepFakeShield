import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
  ScrollView,
} from "react-native";
import { Text, HelperText, Surface, IconButton, TextInput } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import AppTextInput from "../components/AppTextInput";
import AppButton from "../components/AppButton";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pw);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const canSubmit = email.trim() && pw && isValidEmail(email.trim());

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topSection}>
            <Surface style={styles.logoSurface} elevation={4}>
              <Text style={styles.logoText}>🔍</Text>
            </Surface>
            <Text variant="headlineLarge" style={styles.welcomeTitle}>
              Welcome Back
            </Text>
            <Text variant="bodyLarge" style={styles.welcomeSubtitle}>
              Sign in to continue your journey
            </Text>
          </View>

          <Surface style={styles.formContainer} elevation={8}>
            <View style={styles.formContent}>
              <Text variant="titleLarge" style={styles.formTitle}>
                Sign In
              </Text>
              <Text variant="bodyMedium" style={styles.formSubtitle}>
                Enter your credentials to access your account
              </Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <AppTextInput
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  left={<AppTextInput.Icon icon="email-outline" />}
                  error={email && !isValidEmail(email)}
                />
                {email && !isValidEmail(email) && (
                  <HelperText type="error" visible>
                    Please enter a valid email address
                  </HelperText>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <AppTextInput
                  label="Password"
                  value={pw}
                  onChangeText={setPw}
                  secureTextEntry={!showPassword}
                  left={<AppTextInput.Icon icon="lock-outline" />}
                  right={
                    <AppTextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
              </View>

              {/* Error Message */}
              {!!error && (
                <View style={styles.errorContainer}>
                  <HelperText type="error" visible style={styles.errorText}>
                    {error}
                  </HelperText>
                </View>
              )}

              {/* Login Button */}
              <AppButton
                onPress={onLogin}
                loading={loading}
                disabled={!canSubmit || loading}
                style={[styles.loginButton, { opacity: canSubmit ? 1 : 0.6 }]}
                labelStyle={styles.loginButtonText}
              >
                {loading ? "Signing In..." : "Sign In"}
              </AppButton>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Buttons */}
              <View style={styles.socialButtonsContainer}>
                <Surface style={styles.socialButton} elevation={2}>
                  <IconButton
                    icon="google"
                    size={24}
                    iconColor="#4285F4"
                    onPress={() => {}}
                  />
                  <Text variant="bodySmall" style={styles.socialButtonText}>
                    Google
                  </Text>
                </Surface>

                <Surface style={styles.socialButton} elevation={2}>
                  <IconButton
                    icon="apple"
                    size={24}
                    iconColor="#000000"
                    onPress={() => {}}
                  />
                  <Text variant="bodySmall" style={styles.socialButtonText}>
                    Apple
                  </Text>
                </Surface>
              </View>

              {/* Bottom Section */}
              <View style={styles.bottomSection}>
                <Text variant="bodyMedium" style={styles.signupPrompt}>
                  Don't have an account?{" "}
                </Text>
                <AppButton
                  mode="text"
                  onPress={() => navigation.replace("Register")}
                  labelStyle={styles.signupButton}
                  compact
                >
                  Create Account
                </AppButton>
              </View>

              <AppButton
                mode="text"
                onPress={() => {}}
                labelStyle={styles.forgotButton}
                style={styles.forgotButtonContainer}
                compact
              >
                Forgot Password?
              </AppButton>
            </View>
          </Surface>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContainer: { paddingBottom: 24 },
  topSection: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  logoSurface: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  logoText: { fontSize: 36 },
  welcomeTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 16,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  formContent: {
    paddingHorizontal: 8,
  },
  formTitle: {
    color: "#2D3748",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  formSubtitle: {
    color: "#718096",
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: { marginBottom: 12 },
  errorContainer: { marginBottom: 8 },
  errorText: { fontSize: 14, textAlign: "center" },
  loginButton: { backgroundColor: "#667eea", borderRadius: 16, marginTop: 8 },
  loginButtonText: { fontSize: 16, fontWeight: "600", paddingVertical: 4 },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E2E8F0" },
  dividerText: { marginHorizontal: 16, color: "#718096", fontSize: 14 },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  socialButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minWidth: 100,
  },
  socialButtonText: { color: "#2D3748", marginTop: 4, fontWeight: "500" },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  signupPrompt: { color: "#718096" },
  signupButton: { color: "#667eea", fontWeight: "600" },
  forgotButtonContainer: { alignSelf: "center", marginBottom: 16 },
  forgotButton: { color: "#718096", fontSize: 14 },
});
