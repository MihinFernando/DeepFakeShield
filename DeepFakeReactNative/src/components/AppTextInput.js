import React from "react";
import { TextInput } from "react-native-paper";

function AppTextInput(props) {
  return (
    <TextInput
      mode="outlined"
      style={{ marginBottom: 12 }}
      autoCapitalize="none"
      outlineStyle={{ borderRadius: 12 }}
      {...props}
    />
  );
}

// Attach the Icon component to AppTextInput
AppTextInput.Icon = TextInput.Icon;

export default AppTextInput;
