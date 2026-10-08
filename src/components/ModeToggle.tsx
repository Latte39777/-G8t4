import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppMode } from "../types";
import { colors, radius } from "../theme";

// ============================================================
// 「子育て世代 / 祖父母」の切り替えUI
// ============================================================

interface ModeToggleProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, mode === "parent" && styles.buttonActive]}
        onPress={() => onChange("parent")}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, mode === "parent" && styles.buttonTextActive]}>
          子育て世代
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, mode === "grandparent" && styles.buttonActive]}
        onPress={() => onChange("grandparent")}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, mode === "grandparent" && styles.buttonTextActive]}>
          祖父母
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonActive: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.textMuted,
  },
  buttonTextActive: {
    color: colors.white,
    fontWeight: "bold",
  },
});
