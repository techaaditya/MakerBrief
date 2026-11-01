import React from "react";
import { COLORS } from "../constants";
import { SANS, MONO } from "../fonts";

interface FloatingCalloutProps {
  label?: string;
  title: string;
  description?: string;
  opacity?: number;
  scale?: number;
  variant?: "lime" | "amber" | "sage";
  style?: React.CSSProperties;
}

export const FloatingCallout: React.FC<FloatingCalloutProps> = ({
  label,
  title,
  description,
  opacity = 1,
  scale = 1,
  variant = "lime",
  style,
}) => {
  const borderColor =
    variant === "amber" ? COLORS.amber : variant === "sage" ? COLORS.sage : COLORS.accent;
  const accentColor =
    variant === "amber" ? COLORS.amber : variant === "sage" ? COLORS.creamMuted : COLORS.accentBright;

  return (
    <div
      style={{
        position: "absolute",
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        backgroundColor: "rgba(22, 40, 33, 0.92)",
        border: `1.5px solid ${borderColor}`,
        borderRadius: 14,
        padding: "16px 22px",
        boxShadow: "0 18px 45px rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(12px)",
        maxWidth: 440,
        zIndex: 20,
        ...style,
      }}
    >
      {label && (
        <div
          style={{
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 700,
            color: accentColor,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          fontFamily: SANS,
          fontSize: 19,
          fontWeight: 700,
          color: COLORS.cream,
          lineHeight: 1.3,
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            fontFamily: SANS,
            fontSize: 14,
            fontWeight: 400,
            color: COLORS.creamMuted,
            marginTop: 6,
            lineHeight: 1.45,
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
};
