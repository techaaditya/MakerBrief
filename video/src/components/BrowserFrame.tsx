import React from "react";
import { COLORS } from "../constants";
import { MONO } from "../fonts";

interface BrowserFrameProps {
  url?: string;
  roleBadge?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  url = "makerbrief.internal",
  roleBadge,
  children,
  style,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.bgCanvas,
        border: `1.5px solid ${COLORS.border}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 28px 70px rgba(0, 0, 0, 0.65)",
        ...style,
      }}
    >
      {/* Browser Chrome Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 44,
          padding: "0 18px",
          backgroundColor: "#13221b",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        {/* Window controls */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              backgroundColor: "#e06c75",
              opacity: 0.8,
            }}
          />
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              backgroundColor: "#e5c07b",
              opacity: 0.8,
            }}
          />
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              backgroundColor: "#98c379",
              opacity: 0.8,
            }}
          />
        </div>

        {/* URL Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 20px",
            backgroundColor: "rgba(0, 0, 0, 0.35)",
            borderRadius: 8,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <span style={{ color: COLORS.accentBright, fontSize: 12 }}>🔒</span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 12,
              color: COLORS.creamMuted,
            }}
          >
            https://{url}
          </span>
        </div>

        {/* Role badge or status */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {roleBadge && (
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.accentBright,
                backgroundColor: "rgba(123, 140, 77, 0.25)",
                padding: "3px 10px",
                borderRadius: 999,
                border: `1px solid ${COLORS.accent}`,
                textTransform: "uppercase",
              }}
            >
              {roleBadge}
            </span>
          )}
        </div>
      </div>

      {/* Frame Body */}
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
};
