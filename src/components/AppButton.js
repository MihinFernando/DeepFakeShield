import React from "react";
import { Button } from "react-native-paper";

export default function AppButton(props) {
  return (
    <Button
      mode="contained"
      style={{ borderRadius: 12 }}
      contentStyle={{ paddingVertical: 8 }}
      {...props}
    />
  );
}
