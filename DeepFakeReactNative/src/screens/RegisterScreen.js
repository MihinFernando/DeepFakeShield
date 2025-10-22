import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, StyleSheet, StatusBar, ScrollView } from "react-native";
import { Text, HelperText, Surface, IconButton, ProgressBar } from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import AppTextInput from "../components/AppTextInput";
import AppButton from "../components/AppButton";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../config/firebase";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onRegister = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      // user is now logged in automatically
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

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '#E2E8F0' };
    
    let score = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ];
    
    score = checks.filter(Boolean).length;
    
    if (score < 2) return { strength: 0.2, text: 'Weak', color: '#FF6B6B' };
    if (score < 4) return { strength: 0.6, text: 'Medium', color: '#FFD93D' };
    return { strength: 1, text: 'Strong', color: '#4ECDC4' };
  };

  const passwordStrength = getPasswordStrength(pw);
  const passwordsMatch = pw && confirmPw && pw === confirmPw;
  const canSubmit = name.trim() && email.trim() && pw && confirmPw && 
                   isValidEmail(email.trim()) && passwordsMatch && 
                   passwordStrength.strength >= 0.6;

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
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topSection}>
            <View style={styles.logoContainer}>
              <Surface style={styles.logoSurface} elevation={4}>
                <Text style={styles.logoText}>✨</Text>
              </Surface>
            </View>
            
            <Text variant="headlineLarge" style={styles.welcomeTitle}>
              Join Us Today
            </Text>
            <Text variant="bodyLarge" style={styles.welcomeSubtitle}>
              Create your account to start detecting deepfakes
            </Text>
          </View>

          <Surface style={styles.formContainer} elevation={8}>
            <View style={styles.formContent}>
              <Text variant="titleLarge" style={styles.formTitle}>
                Create Account
              </Text>
              <Text variant="bodyMedium" style={styles.formSubtitle}>
                Fill in your details to get started
              </Text>

              <View style={styles.inputContainer}>
                <AppTextInput 
                  label="Full Name" 
                  value={name} 
                  onChangeText={setName} 
                  autoCapitalize="words"
                  autoComplete="name"
                  style={styles.input}
                  mode="outlined"
                  left={<AppTextInput.Icon icon="account-outline" />}
                />
              </View>

              <View style={styles.inputContainer}>
                <AppTextInput 
                  label="Email Address" 
                  value={email} 
                  onChangeText={setEmail} 
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={styles.input}
                  mode="outlined"
                  left={<AppTextInput.Icon icon="email-outline" />}
                  error={email && !isValidEmail(email)}
                />
                {email && !isValidEmail(email) && (
                  <HelperText type="error" visible>
                    Please enter a valid email address
                  </HelperText>
                )}
              </View>

              <View style={styles.inputContainer}>
                <AppTextInput 
                  label="Password" 
                  value={pw} 
                  onChangeText={setPw} 
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  mode="outlined"
                  left={<AppTextInput.Icon icon="lock-outline" />}
                  right={
                    <AppTextInput.Icon 
                      icon={showPassword ? "eye-off" : "eye"} 
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
                {pw && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.passwordStrengthHeader}>
                      <Text variant="bodySmall" style={styles.passwordStrengthText}>
                        Password strength: {passwordStrength.text}
                      </Text>
                    </View>
                    <ProgressBar 
                      progress={passwordStrength.strength} 
                      color={passwordStrength.color}
                      style={styles.passwordStrengthBar}
                    />
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <AppTextInput 
                  label="Confirm Password" 
                  value={confirmPw} 
                  onChangeText={setConfirmPw} 
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                  mode="outlined"
                  left={<AppTextInput.Icon icon="lock-check-outline" />}
                  right={
                    <AppTextInput.Icon 
                      icon={showConfirmPassword ? "eye-off" : "eye"} 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                  error={confirmPw && !passwordsMatch}
                />
                {confirmPw && !passwordsMatch && (
                  <HelperText type="error" visible>
                    Passwords do not match
                  </HelperText>
                )}
                {confirmPw && passwordsMatch && (
                  <HelperText type="info" visible style={styles.successText}>
                    Passwords match ✓
                  </HelperText>
                )}
              </View>

              {!!error && (
                <View style={styles.errorContainer}>
                  <HelperText type="error" visible style={styles.errorText}>
                    {error}
                  </HelperText>
                </View>
              )}

              <View style={styles.termsContainer}>
                <Text variant="bodySmall" style={styles.termsText}>
                  By creating an account, you agree to our{" "}
                  <Text style={styles.linkText}>Terms of Service</Text>
                  {" "}and{" "}
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </Text>
              </View>

              <AppButton 
                onPress={onRegister}
                loading={loading}
                disabled={!canSubmit || loading}
                style={[
                  styles.registerButton, 
                  { opacity: canSubmit ? 1 : 0.6 }
                ]}
                labelStyle={styles.registerButtonText}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </AppButton>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or sign up with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtonsContainer}>
                <Surface style={styles.socialButton} elevation={2}>
                  <IconButton 
                    icon="google" 
                    size={24}
                    iconColor="#4285F4"
                    onPress={() => {/* Add Google sign up */}}
                  />
                  <Text variant="bodySmall" style={styles.socialButtonText}>Google</Text>
                </Surface>
                
                <Surface style={styles.socialButton} elevation={2}>
                  <IconButton 
                    icon="apple" 
                    size={24}
                    iconColor="#000000"
                    onPress={() => {/* Add Apple sign up */}}
                  />
                  <Text variant="bodySmall" style={styles.socialButtonText}>Apple</Text>
                </Surface>
              </View>

              <View style={styles.bottomSection}>
                <Text variant="bodyMedium" style={styles.loginPrompt}>
                  Already have an account?{" "}
                </Text>
                <AppButton
                  mode="text"
                  onPress={() => navigation.replace("Login")}
                  labelStyle={styles.loginButton}
                  compact
                >
                  Sign In
                </AppButton>
              </View>
            </View>
          </Surface>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoSurface: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '400',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    paddingTop: 32,
  },
  formContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flex: 1,
  },
  formTitle: {
    color: '#2D3748',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F7FAFC',
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  passwordStrengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  passwordStrengthText: {
    color: '#718096',
    fontSize: 12,
  },
  passwordStrengthBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  successText: {
    color: '#4ECDC4',
    fontSize: 12,
  },
  errorContainer: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  termsContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  termsText: {
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#667eea',
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 4,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#718096',
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 100,
  },
  socialButtonText: {
    color: '#2D3748',
    marginTop: 4,
    fontWeight: '500',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    color: '#718096',
  },
  loginButton: {
    color: '#667eea',
    fontWeight: '600',
  },
});