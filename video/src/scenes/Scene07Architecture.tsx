import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AtelierBackground } from "../components/AtelierBackground";
import { Badge } from "../components/Badge";
import { COLORS } from "../constants";
import { SERIF, SANS, MONO } from "../fonts";

export const Scene07Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header entrance
  const headProg = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const headOp = interpolate(headProg, [0, 0.35], [0, 1]);
  const headScale = interpolate(headProg, [0, 1], [0.93, 1]);

  // Left column: Architecture components (enters frame 30)
  const leftProg = spring({
    frame: frame - 25,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const leftOp = interpolate(leftProg, [0, 0.35], [0, 1]);
  const leftX = interpolate(leftProg, [0, 1], [-30, 0]);

  // Right column: Terminal card (enters frame 60)
  const termProg = spring({
    frame: frame - 55,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const termOp = interpolate(termProg, [0, 0.35], [0, 1]);
  const termX = interpolate(termProg, [0, 1], [30, 0]);

  return (
    <AtelierBackground>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "50px 80px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            opacity: headOp,
            transform: `scale(${headScale})`,
            textAlign: "center",
            marginBottom: 36,
          }}
        >
          <Badge text="System Architecture" variant="lime" style={{ marginBottom: 14 }} />
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: 56,
              fontWeight: 600,
              color: COLORS.cream,
              margin: 0,
            }}
          >
            Engineered for Production Reliability
          </h1>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 20,
              color: COLORS.creamMuted,
              marginTop: 10,
              marginBottom: 0,
            }}
          >
            Zero runtime dependencies, deterministic domain logic, and robust S2S task orchestration.
          </p>
        </div>

        {/* Content Columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 40,
            width: "100%",
            maxWidth: 1300,
          }}
        >
          {/* Architecture Blocks */}
          <div
            style={{
              opacity: leftOp,
              transform: `translateX(${leftX}px)`,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {[
              {
                layer: "Client & Presentation",
                desc: "Dual-role workspace (Buyer Studio vs Maker Desk) with zero framework overhead and responsive design.",
              },
              {
                layer: "Zero-Dependency Node.js Server",
                desc: "Native ESM HTTP server, strict HTTPS allowlists, token authorization, and atomic JSON persistence.",
              },
              {
                layer: "YouCam Clothes V4 S2S Adapter",
                desc: "Durable asynchronous task creation, pose detection, outer garment styling, and exponential backoff polling.",
              },
              {
                layer: "Deterministic State Machine",
                desc: "Immutable revision history, discrepancy audit log, and automatic quote invalidation upon spec updates.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "rgba(31, 53, 45, 0.8)",
                  border: `1.5px solid ${COLORS.border}`,
                  borderRadius: 14,
                  padding: "18px 24px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.accentBright,
                    backgroundColor: "rgba(123, 140, 77, 0.2)",
                    padding: "4px 10px",
                    borderRadius: 6,
                  }}
                >
                  0{idx + 1}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: 18,
                      fontWeight: 700,
                      color: COLORS.cream,
                      marginBottom: 4,
                    }}
                  >
                    {item.layer}
                  </div>
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: 14,
                      color: COLORS.creamMuted,
                      lineHeight: 1.45,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Real Terminal Card */}
          <div
            style={{
              opacity: termOp,
              transform: `translateX(${termX}px)`,
              backgroundColor: "#0d1713",
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Terminal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 40,
                padding: "0 18px",
                backgroundColor: "#13221b",
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#e06c75" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#e5c07b" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#98c379" }} />
              </div>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  color: COLORS.accentBright,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                REAL VERIFICATION OUTPUT
              </span>
            </div>

            {/* Terminal Content */}
            <div
              style={{
                padding: "24px 24px",
                fontFamily: MONO,
                fontSize: 13,
                lineHeight: 1.6,
                color: "#abb2bf",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div>
                <span style={{ color: "#98c379" }}>➜</span>{" "}
                <span style={{ color: "#61afef" }}>MakerBrief</span> npm test
              </div>
              <div style={{ color: COLORS.creamMuted, marginTop: 4 }}>
                ▶ makerbrief-domain-tests
              </div>
              <div style={{ color: "#98c379" }}>✔ creates initial commission state</div>
              <div style={{ color: "#98c379" }}>✔ records buyer body measurements</div>
              <div style={{ color: "#98c379" }}>✔ tailor adds physical discrepancy</div>
              <div style={{ color: "#98c379" }}>✔ generates quote with 4-week timeline</div>
              <div style={{ color: "#98c379" }}>✔ buyer locks agreement version 1</div>
              <div style={{ color: "#e5c07b" }}>✔ buyer updates material: silk → boiled wool</div>
              <div style={{ color: "#98c379" }}>✔ automatically invalidates Quote #1</div>
              <div style={{ color: "#98c379" }}>✔ explains invalidation diff clearly</div>
              <div style={{ color: "#98c379" }}>✔ tailor issues updated Quote #2</div>
              <div style={{ color: "#98c379" }}>✔ buyer re-approves revised commission</div>
              <div style={{ color: COLORS.creamMuted, marginTop: 8 }}>
                ℹ tests 16 | suites 1 | pass 16 | fail 0
              </div>
              <div
                style={{
                  color: COLORS.accentBright,
                  fontWeight: 700,
                  borderTop: `1px solid ${COLORS.border}`,
                  paddingTop: 8,
                  marginTop: 4,
                }}
              >
                ✔ 16/16 test suites passing (~480ms)
              </div>
            </div>
          </div>
        </div>
      </div>
    </AtelierBackground>
  );
};
