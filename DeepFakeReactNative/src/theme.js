import { MD3LightTheme as DefaultTheme } from "react-native-paper";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    
    // Primary brand colors
    primary: "#667eea",
    onPrimary: "#ffffff",
    primaryContainer: "#e0e7ff",
    onPrimaryContainer: "#1e1b4b",
    
    // Secondary accent colors
    secondary: "#4ECDC4",
    onSecondary: "#ffffff",
    secondaryContainer: "#ccf7f0",
    onSecondaryContainer: "#134e4a",
    
    // Tertiary colors
    tertiary: "#764ba2",
    onTertiary: "#ffffff",
    tertiaryContainer: "#f3e8ff",
    onTertiaryContainer: "#581c87",
    
    // Error states
    error: "#FF6B6B",
    onError: "#ffffff",
    errorContainer: "#ffebee",
    onErrorContainer: "#7f1d1d",
    
    // Warning colors
    warning: "#FFD93D",
    onWarning: "#1a1a1a",
    warningContainer: "#fff9c4",
    onWarningContainer: "#713f12",
    
    // Success colors
    success: "#4ECDC4",
    onSuccess: "#ffffff",
    successContainer: "#ccf7f0",
    onSuccessContainer: "#134e4a",
    
    // Background colors
    background: "#F8FAFC",
    onBackground: "#1e293b",
    surface: "#ffffff",
    onSurface: "#1e293b",
    
    // Surface variants
    surfaceVariant: "#f1f5f9",
    onSurfaceVariant: "#64748b",
    surfaceDisabled: "#f8fafc",
    onSurfaceDisabled: "#94a3b8",
    
    // Outline colors
    outline: "#cbd5e1",
    outlineVariant: "#e2e8f0",
    
    // Inverse colors
    inverseSurface: "#1e293b",
    inverseOnSurface: "#f1f5f9",
    inversePrimary: "#a5b4fc",
    
    // Elevation and shadow
    shadow: "#000000",
    scrim: "#000000",
    
    // Additional custom colors for the app
    backdrop: "rgba(0, 0, 0, 0.5)",
    
    // Gradient colors
    gradientStart: "#667eea",
    gradientEnd: "#764ba2",
    
    // Status colors
    fake: "#FF6B6B",
    authentic: "#4ECDC4",
    realImage: "#45B7D1",
    unknown: "#95A5A6",
    
    // Confidence levels
    highConfidence: "#4ECDC4",
    mediumConfidence: "#FFD93D",
    lowConfidence: "#FF6B6B",
    
    // Text colors
    textPrimary: "#1e293b",
    textSecondary: "#64748b",
    textTertiary: "#94a3b8",
    textOnDark: "#ffffff",
    textOnLight: "#1e293b",
    
    // Card and surface colors
    cardBackground: "#ffffff",
    cardBorder: "#e2e8f0",
    surfaceElevated: "#ffffff",
    
    // Input colors
    inputBackground: "#f7fafc",
    inputBorder: "#e2e8f0",
    inputFocused: "#667eea",
    inputError: "#FF6B6B",
    
    // Divider colors
    divider: "#e2e8f0",
    dividerLight: "#f1f5f9",
    
    // Overlay colors
    overlayLight: "rgba(255, 255, 255, 0.9)",
    overlayDark: "rgba(0, 0, 0, 0.6)",
  },
  
  // Enhanced roundness for modern look
  roundness: 16,
  
  // Typography enhancements
  fonts: {
    ...DefaultTheme.fonts,
    displayLarge: {
      ...DefaultTheme.fonts.displayLarge,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    displayMedium: {
      ...DefaultTheme.fonts.displayMedium,
      fontWeight: '700',
      letterSpacing: -0.25,
    },
    displaySmall: {
      ...DefaultTheme.fonts.displaySmall,
      fontWeight: '600',
      letterSpacing: 0,
    },
    headlineLarge: {
      ...DefaultTheme.fonts.headlineLarge,
      fontWeight: '700',
      letterSpacing: -0.25,
    },
    headlineMedium: {
      ...DefaultTheme.fonts.headlineMedium,
      fontWeight: '600',
      letterSpacing: 0,
    },
    headlineSmall: {
      ...DefaultTheme.fonts.headlineSmall,
      fontWeight: '600',
      letterSpacing: 0,
    },
    titleLarge: {
      ...DefaultTheme.fonts.titleLarge,
      fontWeight: '600',
      letterSpacing: 0,
    },
    titleMedium: {
      ...DefaultTheme.fonts.titleMedium,
      fontWeight: '600',
      letterSpacing: 0.15,
    },
    titleSmall: {
      ...DefaultTheme.fonts.titleSmall,
      fontWeight: '500',
      letterSpacing: 0.1,
    },
    bodyLarge: {
      ...DefaultTheme.fonts.bodyLarge,
      fontWeight: '400',
      letterSpacing: 0.5,
      lineHeight: 24,
    },
    bodyMedium: {
      ...DefaultTheme.fonts.bodyMedium,
      fontWeight: '400',
      letterSpacing: 0.25,
      lineHeight: 20,
    },
    bodySmall: {
      ...DefaultTheme.fonts.bodySmall,
      fontWeight: '400',
      letterSpacing: 0.4,
      lineHeight: 16,
    },
    labelLarge: {
      ...DefaultTheme.fonts.labelLarge,
      fontWeight: '500',
      letterSpacing: 0.1,
    },
    labelMedium: {
      ...DefaultTheme.fonts.labelMedium,
      fontWeight: '500',
      letterSpacing: 0.5,
    },
    labelSmall: {
      ...DefaultTheme.fonts.labelSmall,
      fontWeight: '500',
      letterSpacing: 0.5,
    },
  },
  
  // Animation and motion
  animation: {
    scale: 1.0,
    defaultAnimationDuration: 200,
    customAnimationDuration: {
      short: 150,
      medium: 300,
      long: 500,
    },
  },
  
  // Custom spacing system
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Elevation levels
  elevation: {
    level0: 0,
    level1: 1,
    level2: 3,
    level3: 6,
    level4: 8,
    level5: 12,
  },
  
  // Button variants
  buttonVariants: {
    primary: {
      backgroundColor: "#667eea",
      textColor: "#ffffff",
    },
    secondary: {
      backgroundColor: "#4ECDC4",
      textColor: "#ffffff",
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: "#667eea",
      textColor: "#667eea",
    },
    text: {
      backgroundColor: "transparent",
      textColor: "#667eea",
    },
    danger: {
      backgroundColor: "#FF6B6B",
      textColor: "#ffffff",
    },
    success: {
      backgroundColor: "#4ECDC4",
      textColor: "#ffffff",
    },
  },
  
  // Card variants
  cardVariants: {
    elevated: {
      backgroundColor: "#ffffff",
      elevation: 4,
      borderRadius: 16,
    },
    outlined: {
      backgroundColor: "#ffffff",
      borderWidth: 1,
      borderColor: "#e2e8f0",
      borderRadius: 16,
    },
    filled: {
      backgroundColor: "#f8fafc",
      borderRadius: 16,
    },
  },
  
  // Status variants for scan results
  scanResultVariants: {
    fake: {
      backgroundColor: "#ffebee",
      borderColor: "#FF6B6B",
      iconColor: "#FF6B6B",
      textColor: "#7f1d1d",
    },
    authentic: {
      backgroundColor: "#ccf7f0",
      borderColor: "#4ECDC4",
      iconColor: "#4ECDC4",
      textColor: "#134e4a",
    },
    real: {
      backgroundColor: "#e0f2fe",
      borderColor: "#45B7D1",
      iconColor: "#45B7D1",
      textColor: "#0c4a6e",
    },
    unknown: {
      backgroundColor: "#f1f5f9",
      borderColor: "#95A5A6",
      iconColor: "#95A5A6",
      textColor: "#475569",
    },
  },
};

export default theme;