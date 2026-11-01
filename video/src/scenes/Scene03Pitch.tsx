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

export const Scene03Pitch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animations
  const headProg = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const headOp = interpolate(headProg, [0, 0.35], [0, 1]);
  const headScale = interpolate(headProg, [0, 1], [0.93, 1]);

  // Pillar 1 (enters frame 35)
  const p1Prog = spring({
    frame: frame - 30,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const p1Op = interpolate(p1Prog, [0, 0.35], [0, 1]);
  const p1Y = interpolate(p1Prog, [0, 1], [30, 0]);

  // Pillar 2 (enters frame 85)
  const p2Prog = spring({
    frame: frame - 80,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const p2Op = interpolate(p2Prog, [0, 0.35], [0, 1]);
  const p2Y = interpolate(p2Prog, [0, 1], [30, 0]);

  // Pillar 3 (enters frame 135)
  const p3Prog = spring({
    frame: frame - 130,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const p3Op = interpolate(p3Prog, [0, 0.35], [0, 1]);
  const p3Y = interpolate(p3Prog, [0, 1], [30, 0]);

  // Bottom workflow pipeline (enters frame 300)
  const pipeProg = spring({
    frame: frame - 280,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const pipeOp = interpolate(pipeProg, [0, 0.35], [0, 1]);

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
          <Badge text="The MakerBrief Solution" variant="lime" style={{ marginBottom: 14 }} />
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: 58,
              fontWeight: 600,
              color: COLORS.cream,
              margin: 0,
            }}
          >
            Introducing MakerBrief
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
            Personal garment previews meet master tailor craftsmanship and legally clear agreements.
          </p>
        </div>

        {/* The 3 Pillars */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 28,
            width: "100%",
            maxWidth: 1320,
          }}
        >
          {/* Pillar 1 */}
          <div
            style={{
              opacity: p1Op,
              transform: `translateY(${p1Y}px)`,
              backgroundColor: "rgba(31, 53, 45, 0.8)",
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: 16,
              padding: "30px 26px",
              boxShadow: "0 18px 45px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 12,
                color: COLORS.accentBright,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Pillar 01
            </div>
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: 26,
                color: COLORS.cream,
                margin: "0 0 12px 0",
              }}
            >
              YouCam Clothes V4
            </h3>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 15,
                color: COLORS.creamMuted,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Server-side API orchestration delivering pose detection, garment segmentation, and photorealistic try-on results.
            </p>
          </div>

          {/* Pillar 2 */}
          <div
            style={{
              opacity: p2Op,
              transform: `translateY(${p2Y}px)`,
              backgroundColor: "rgba(31, 53, 45, 0.8)",
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: 16,
              padding: "30px 26px",
              boxShadow: "0 18px 45px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 12,
                color: COLORS.accentBright,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Pillar 02
            </div>
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: 26,
                color: COLORS.cream,
                margin: "0 0 12px 0",
              }}
            >
              Discrepancy Audit
            </h3>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 15,
                color: COLORS.creamMuted,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Authenticated tailors audit the preview against physical measurements, recording textile drape and pattern constraints.
            </p>
          </div>

          {/* Pillar 3 */}
          <div
            style={{
              opacity: p3Op,
              transform: `translateY(${p3Y}px)`,
              backgroundColor: "rgba(31, 53, 45, 0.8)",
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: 16,
              padding: "30px 26px",
              boxShadow: "0 18px 45px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 12,
                color: COLORS.accentBright,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Pillar 03
            </div>
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: 26,
                color: COLORS.cream,
                margin: "0 0 12px 0",
              }}
            >
              Exact-Version Lock
            </h3>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 15,
                color: COLORS.creamMuted,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Binding itemized quotes linked to exact specification versions, with automated invalidation when changes occur.
            </p>
          </div>
        </div>

        {/* Workflow Pipeline */}
        <div
          style={{
            opacity: pipeOp,
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 16,
            backgroundColor: "rgba(13, 23, 19, 0.8)",
            padding: "14px 28px",
            borderRadius: 999,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 13, color: COLORS.cream }}>Buyer Preferences</span>
          <span style={{ color: COLORS.accent, fontSize: 14 }}>→</span>
          <span style={{ fontFamily: MONO, fontSize: 13, color: COLORS.accentBright }}>YouCam Clothes V4 VTO</span>
          <span style={{ color: COLORS.accent, fontSize: 14 }}>→</span>
          <span style={{ fontFamily: MONO, fontSize: 13, color: COLORS.cream }}>Maker Detail Review</span>
          <span style={{ color: COLORS.accent, fontSize: 14 }}>→</span>
          <span style={{ fontFamily: MONO, fontSize: 13, color: COLORS.amber }}>Itemized Quote</span>
          <span style={{ color: COLORS.accent, fontSize: 14 }}>→</span>
          <span style={{ fontFamily: MONO, fontSize: 13, color: COLORS.accentBright }}>Exact Agreement</span>
        </div>
      </div>
    </AtelierBackground>
  );
};
