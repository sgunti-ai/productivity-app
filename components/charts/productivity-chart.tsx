import { View, Text, Dimensions } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface BarChartProps {
  data: { label: string; value: number }[];
  maxValue?: number;
  height?: number;
}

export function BarChart({ data, maxValue = 100, height = 200 }: BarChartProps) {
  const colors = useColors();
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 48; // Account for padding
  const barWidth = chartWidth / data.length - 8;

  const actualMax = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={{ height, justifyContent: "flex-end", marginVertical: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", height: "100%" }}>
        {data.map((item, index) => {
          const barHeight = (item.value / actualMax) * (height - 40);
          return (
            <View key={index} style={{ alignItems: "center", gap: 8 }}>
              <View
                style={{
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: colors.primary,
                  borderRadius: 6,
                  opacity: 0.8,
                }}
              />
              <Text style={{ fontSize: 11, color: colors.muted, textAlign: "center", width: barWidth }}>
                {item.label}
              </Text>
              <Text style={{ fontSize: 10, fontWeight: "600", color: colors.foreground }}>
                {item.value}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  maxValue?: number;
  height?: number;
}

export function LineChart({ data, maxValue = 100, height = 200 }: LineChartProps) {
  const colors = useColors();
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 48;
  const pointSpacing = chartWidth / (data.length - 1 || 1);

  const actualMax = maxValue || Math.max(...data.map((d) => d.value), 1);

  const points = data.map((item, index) => ({
    x: index * pointSpacing,
    y: height - (item.value / actualMax) * (height - 40),
  }));

  return (
    <View style={{ height, marginVertical: 12, position: "relative" }}>
      {/* Grid Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
        <View
          key={index}
          style={{
            position: "absolute",
            top: height * ratio,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: colors.border,
            opacity: 0.3,
          }}
        />
      ))}

      {/* Line */}
      <View style={{ flex: 1, position: "relative" }}>
        {points.map((point, index) => {
          const nextPoint = points[index + 1];
          if (!nextPoint) return null;

          const dx = nextPoint.x - point.x;
          const dy = nextPoint.y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);

          return (
            <View
              key={index}
              style={{
                position: "absolute",
                left: point.x,
                top: point.y,
                width: distance,
                height: 2,
                backgroundColor: colors.primary,
                transformOrigin: "left center",
                transform: [{ rotate: `${angle}deg` }],
              }}
            />
          );
        })}

        {/* Points */}
        {points.map((point, index) => (
          <View
            key={`point-${index}`}
            style={{
              position: "absolute",
              left: point.x - 4,
              top: point.y - 4,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.primary,
            }}
          />
        ))}
      </View>

      {/* Labels */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
        {data.map((item, index) => (
          <Text key={index} style={{ fontSize: 11, color: colors.muted, flex: 1, textAlign: "center" }}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ProgressCircle({ percentage, size = 120, strokeWidth = 8, label }: ProgressCircleProps) {
  const colors = useColors();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ alignItems: "center", gap: 8 }}>
      <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
        {/* Background Circle */}
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.border,
          }}
        />
        {/* Progress Circle */}
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.primary,
            borderTopColor: colors.border,
            borderRightColor: colors.border,
            borderBottomColor: colors.border,
            opacity: percentage / 100,
          }}
        />
        {/* Percentage Text */}
        <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
          {Math.round(percentage)}%
        </Text>
      </View>
      {label && <Text style={{ fontSize: 12, color: colors.muted, textAlign: "center" }}>{label}</Text>}
    </View>
  );
}
