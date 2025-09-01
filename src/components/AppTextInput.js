import React from "react";
import { TextInput } from "react-native-paper";

export default function AppTextInput(props) {
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
