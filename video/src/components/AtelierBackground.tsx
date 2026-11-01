import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS } from "../constants";

interface AtelierBackgroundProps {
  children?: React.ReactNode;
  showGrid?: boolean;
}

export const AtelierBackground: React.FC<AtelierBackgroundProps> = ({
  children,
  showGrid = true,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        backgroundImage: `
          radial-gradient(circle at 50% 25%, #1e382b 0%, #162821 55%, #0b1511 100%)
        `,
        overflow: "hidden",
      }}
    >
      {showGrid && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.12,
            backgroundImage: `
              linear-gradient(to right, #7b8c4d 1px, transparent 1px),
              linear-gradient(to bottom, #7b8c4d 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Subtle atelier corner brackets */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 40,
          width: 32,
          height: 32,
          borderTop: `2px solid ${COLORS.accent}`,
          borderLeft: `2px solid ${COLORS.accent}`,
          opacity: 0.45,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 40,
          width: 32,
          height: 32,
          borderTop: `2px solid ${COLORS.accent}`,
          borderRight: `2px solid ${COLORS.accent}`,
          opacity: 0.45,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: 40,
          width: 32,
          height: 32,
          borderBottom: `2px solid ${COLORS.accent}`,
          borderLeft: `2px solid ${COLORS.accent}`,
          opacity: 0.45,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 36,
          right: 40,
          width: 32,
          height: 32,
          borderBottom: `2px solid ${COLORS.accent}`,
          borderRight: `2px solid ${COLORS.accent}`,
          opacity: 0.45,
        }}
      />

      {children}
    </AbsoluteFill>
  );
};
