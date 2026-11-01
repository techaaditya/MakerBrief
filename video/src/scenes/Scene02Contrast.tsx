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

export const Scene02Contrast: React.FC = () => {
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

  // Left card: Standard VTO (enters frame 30)
  const leftProg = spring({
    frame: frame - 25,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const leftOp = interpolate(leftProg, [0, 0.35], [0, 1]);
  const leftX = interpolate(leftProg, [0, 1], [-40, 0]);

  // Right card: MakerBrief (enters frame 60)
  const rightProg = spring({
    frame: frame - 55,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const rightOp = interpolate(rightProg, [0, 0.35], [0, 1]);
  const rightX = interpolate(rightProg, [0, 1], [40, 0]);

  // Bottom conclusion (enters frame 200)
  const botProg = spring({
    frame: frame - 180,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const botOp = interpolate(botProg, [0, 0.35], [0, 1]);

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
          padding: "60px 100px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            opacity: headOp,
            transform: `scale(${headScale})`,
            textAlign: "center",
            marginBottom: 44,
          }}
        >
          <Badge text="The VTO Paradox" variant="amber" style={{ marginBottom: 16 }} />
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: 56,
              fontWeight: 600,
              color: COLORS.cream,
              margin: 0,
            }}
          >
            Consumer Novelty vs Production Standard
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
            Virtual try-on has solved 2D appearance. But custom fashion demands physical construction.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            width: "100%",
            maxWidth: 1240,
          }}
        >
          {/* Left: Standard VTO */}
          <div
            style={{
              opacity: leftOp,
              transform: `translateX(${leftX}px)`,
              backgroundColor: "rgba(22, 34, 28, 0.7)",
              border: `1.5px dashed ${COLORS.sage}`,
              borderRadius: 18,
              padding: "36px",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 13,
                color: COLORS.sage,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 10,
              }}
            >
              Typical Virtual Try-On
            </div>
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: 32,
                color: COLORS.cream,
                margin: "0 0 16px 0",
              }}
            >
              The Novelty Gap
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: 22,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                fontFamily: SANS,
                fontSize: 16,
                color: COLORS.creamMuted,
                lineHeight: 1.5,
              }}
            >
              <li>Generates a static preview with no pattern linkage</li>
              <li>Ignores chest ease, sleeve pitch, and fabric weight</li>
              <li>Leaves tailors guessing what the buyer expects</li>
              <li>Results in surprise bills, redesign delays, and disputes</li>
            </ul>
          </div>

          {/* Right: MakerBrief */}
          <div
            style={{
              opacity: rightOp,
              transform: `translateX(${rightX}px)`,
              backgroundColor: "rgba(31, 53, 45, 0.9)",
              border: `2px solid ${COLORS.accent}`,
              borderRadius: 18,
              padding: "36px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 13,
                color: COLORS.accentBright,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 10,
              }}
            >
              The MakerBrief Standard
            </div>
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: 32,
                color: COLORS.cream,
                margin: "0 0 16px 0",
              }}
            >
              Verified Commission
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: 22,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                fontFamily: SANS,
                fontSize: 16,
                color: COLORS.cream,
                lineHeight: 1.5,
              }}
            >
              <li>High-fidelity Clothes V4 try-on grounded in verified measurements</li>
              <li>Tailor discrepancy tracking records reality vs preview</li>
              <li>Exact-version quotation locks scope, price, and timeline</li>
              <li>Automated invalidation prevents misaligned expectations</li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div
          style={{
            opacity: botOp,
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ height: 1, width: 80, backgroundColor: COLORS.accent }} />
          <span
            style={{
              fontFamily: MONO,
              fontSize: 15,
              color: COLORS.accentBright,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            You cannot cut silk or wool from pixels alone
          </span>
          <div style={{ height: 1, width: 80, backgroundColor: COLORS.accent }} />
        </div>
      </div>
    </AtelierBackground>
  );
};
