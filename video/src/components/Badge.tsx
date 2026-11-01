import React from "react";
import { COLORS } from "../constants";
import { MONO } from "../fonts";

interface BadgeProps {
  text: string;
  variant?: "lime" | "amber" | "sage" | "red";
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = "lime",
  style,
}) => {
  let bg = "rgba(123, 140, 77, 0.18)";
  let border = COLORS.accent;
  let color = COLORS.accentBright;

  if (variant === "amber") {
    bg = "rgba(245, 158, 11, 0.18)";
    border = COLORS.amber;
    color = COLORS.amber;
  } else if (variant === "red") {
    bg = "rgba(239, 68, 68, 0.18)";
    border = COLORS.red;
    color = COLORS.red;
  } else if (variant === "sage") {
    bg = "rgba(104, 115, 107, 0.22)";
    border = COLORS.sage;
    color = COLORS.creamMuted;
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 14px",
        borderRadius: 999,
        background: bg,
        border: `1px solid ${border}`,
        color,
        fontFamily: MONO,
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        ...style,
      }}
    >
      {text}
    </div>
  );
};
