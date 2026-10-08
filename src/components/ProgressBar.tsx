import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

// ============================================================
// 支援達成率プログレスバー
// ============================================================

interface ProgressBarProps {
  percent: number;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({ percent, height = 14, showLabel = false }: ProgressBarProps) {
  const safe = Math.min(100, Math.max(0, percent));
  return (
    <View>
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <View
          style={[
            styles.fill,
            { width: `${safe}%`, height, borderRadius: height / 2 },
            safe >= 100 && styles.fillComplete,
          ]}
        />
      </View>
      {showLabel && <Text style={styles.percentText}>{safe}%</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    backgroundColor: colors.soft,
    overflow: "hidden",
  },
  fill: {
    backgroundColor: colors.accent,
  },
  fillComplete: {
    backgroundColor: colors.primary,
  },
  percentText: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primaryDark,
  },
});
