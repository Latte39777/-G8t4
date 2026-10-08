import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors } from "../theme";
import { getPlantStage, getStageInfo, PlantStage } from "../utils/plant";

// ============================================================
// 植物の成長表現（React Native の View だけで描く独自デザイン）
//   0%   → 種 / 1-25% → 芽 / 26-50% → 小さな苗
//   51-75% → 葉が増える / 76-99% → 大きな植物 / 100% → 完成
// ============================================================

interface PlantGrowthProps {
  /** 支援達成率（0〜100） */
  percent: number;
  /** small: 一覧カード用 / large: 詳細画面用 */
  size?: "small" | "large";
  /** ステージ名の表示 */
  showLabel?: boolean;
}

interface LeafConfig {
  bottom: number;
  side: -1 | 1;
  len: number;
  tilt: number;
}

const STEM_HEIGHT: Record<PlantStage, number> = {
  0: 0,
  1: 26,
  2: 52,
  3: 80,
  4: 104,
  5: 120,
};

const LEAVES: Record<PlantStage, LeafConfig[]> = {
  0: [],
  1: [
    { bottom: 30, side: -1, len: 20, tilt: -28 },
    { bottom: 30, side: 1, len: 20, tilt: 28 },
  ],
  2: [
    { bottom: 34, side: -1, len: 26, tilt: -28 },
    { bottom: 34, side: 1, len: 26, tilt: 28 },
    { bottom: 60, side: -1, len: 20, tilt: -25 },
    { bottom: 60, side: 1, len: 20, tilt: 25 },
  ],
  3: [
    { bottom: 34, side: -1, len: 30, tilt: -30 },
    { bottom: 34, side: 1, len: 30, tilt: 30 },
    { bottom: 62, side: -1, len: 26, tilt: -26 },
    { bottom: 62, side: 1, len: 26, tilt: 26 },
    { bottom: 90, side: -1, len: 20, tilt: -22 },
    { bottom: 90, side: 1, len: 20, tilt: 22 },
  ],
  4: [
    { bottom: 34, side: -1, len: 32, tilt: -32 },
    { bottom: 34, side: 1, len: 32, tilt: 32 },
    { bottom: 62, side: -1, len: 28, tilt: -28 },
    { bottom: 62, side: 1, len: 28, tilt: 28 },
    { bottom: 90, side: -1, len: 24, tilt: -24 },
    { bottom: 90, side: 1, len: 24, tilt: 24 },
    { bottom: 112, side: -1, len: 18, tilt: -20 },
    { bottom: 112, side: 1, len: 18, tilt: 20 },
  ],
  5: [
    { bottom: 34, side: -1, len: 34, tilt: -32 },
    { bottom: 34, side: 1, len: 34, tilt: 32 },
    { bottom: 64, side: -1, len: 30, tilt: -28 },
    { bottom: 64, side: 1, len: 30, tilt: 28 },
    { bottom: 92, side: -1, len: 26, tilt: -24 },
    { bottom: 92, side: 1, len: 26, tilt: 24 },
    { bottom: 116, side: -1, len: 20, tilt: -20 },
    { bottom: 116, side: 1, len: 20, tilt: 20 },
  ],
};

function leafStyle(u: number, config: LeafConfig): ViewStyle {
  const len = config.len * u;
  const height = len * 0.55;
  const leftLeaf = config.side === -1;
  return {
    position: "absolute",
    bottom: config.bottom * u,
    ...(leftLeaf ? { right: "50%" } : { left: "50%" }),
    width: len,
    height,
    backgroundColor: colors.accent,
    borderTopLeftRadius: leftLeaf ? len : len * 0.2,
    borderBottomLeftRadius: leftLeaf ? len * 0.7 : len * 0.2,
    borderTopRightRadius: leftLeaf ? len * 0.2 : len,
    borderBottomRightRadius: leftLeaf ? len * 0.2 : len * 0.7,
    transform: [{ rotate: `${config.tilt}deg` }],
  };
}

function sparkleStyle(u: number, left: number, bottom: number): ViewStyle {
  return {
    position: "absolute",
    left,
    bottom,
    width: 10 * u,
    height: 10 * u,
    backgroundColor: colors.flowerCore,
    borderRadius: 2 * u,
    transform: [{ rotate: "45deg" }],
  };
}

export function PlantGrowth({ percent, size = "large", showLabel = false }: PlantGrowthProps) {
  const stage = getPlantStage(percent);
  const info = getStageInfo(stage);
  const u = size === "small" ? 0.45 : 1;

  const containerWidth = 150 * u;
  const containerHeight = 190 * u;
  const groundHeight = 26 * u;

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: containerWidth, height: containerHeight }}>
        {/* 葉 */}
        {LEAVES[stage].map((leaf, index) => (
          <View key={`leaf-${index}`} style={leafStyle(u, leaf)} />
        ))}

        {/* 茎 */}
        {stage > 0 && (
          <View
            style={{
              position: "absolute",
              bottom: groundHeight - 6 * u,
              left: containerWidth / 2 - 3.5 * u,
              width: 7 * u,
              height: STEM_HEIGHT[stage] * u,
              backgroundColor: "#43A047",
              borderRadius: 4 * u,
            }}
          />
        )}

        {/* 完成時の花 */}
        {stage === 5 && (
          <View
            style={{
              position: "absolute",
              bottom: (STEM_HEIGHT[5] + 20) * u,
              left: containerWidth / 2 - 15 * u,
              width: 30 * u,
              height: 30 * u,
              borderRadius: 15 * u,
              backgroundColor: colors.flower,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 12 * u,
                height: 12 * u,
                borderRadius: 6 * u,
                backgroundColor: colors.flowerCore,
              }}
            />
          </View>
        )}

        {/* 完成時のきらめき */}
        {stage === 5 && (
          <>
            <View style={sparkleStyle(u, containerWidth * 0.12, (STEM_HEIGHT[5] + 40) * u)} />
            <View style={sparkleStyle(u, containerWidth * 0.82, (STEM_HEIGHT[5] + 28) * u)} />
          </>
        )}

        {/* 種 */}
        {stage === 0 && (
          <View
            style={{
              position: "absolute",
              bottom: groundHeight - 10 * u,
              left: containerWidth / 2 - 13 * u,
              width: 26 * u,
              height: 17 * u,
              borderRadius: 10 * u,
              backgroundColor: "#6D4C41",
              transform: [{ rotate: "-18deg" }],
            }}
          />
        )}

        {/* 土手 */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: containerWidth,
            height: groundHeight,
            backgroundColor: colors.soil,
            borderTopLeftRadius: containerWidth * 0.45,
            borderTopRightRadius: containerWidth * 0.45,
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: groundHeight - 5 * u,
            left: containerWidth * 0.12,
            width: 14 * u,
            height: 8 * u,
            borderRadius: 8 * u,
            backgroundColor: "#7CB342",
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: groundHeight - 4 * u,
            left: containerWidth * 0.72,
            width: 12 * u,
            height: 7 * u,
            borderRadius: 8 * u,
            backgroundColor: "#7CB342",
          }}
        />
      </View>

      {showLabel && (
        <View style={styles.labelBox}>
          <Text style={styles.labelEmoji}>{info.emoji}</Text>
          <Text style={styles.labelText}>{info.label}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labelBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.soft,
  },
  labelEmoji: {
    fontSize: 15,
    marginRight: 6,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primaryDark,
  },
});

