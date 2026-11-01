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

export const Scene01Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animations using spring physics (from min 0.93)
  const headerProg = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const headerOp = interpolate(headerProg, [0, 0.35], [0, 1]);
  const headerScale = interpolate(headerProg, [0, 1], [0.93, 1]);

  // Card 1: The Digital Illusion (enters at frame 50)
  const card1Prog = spring({
    frame: frame - 45,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const card1Op = interpolate(card1Prog, [0, 0.35], [0, 1]);
  const card1Y = interpolate(card1Prog, [0, 1], [40, 0]);

  // Card 2: Physical Tailoring Reality (enters at frame 130)
  const card2Prog = spring({
    frame: frame - 120,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const card2Op = interpolate(card2Prog, [0, 0.35], [0, 1]);
  const card2Y = interpolate(card2Prog, [0, 1], [40, 0]);

  // Punchline banner: Pixels are not patterns (enters at frame 340)
  const punchProg = spring({
    frame: frame - 320,
    fps,
    config: { damping: 18, stiffness: 150 },
  });
  const punchOp = interpolate(punchProg, [0, 0.35], [0, 1]);
  const punchScale = interpolate(punchProg, [0, 1], [0.93, 1]);

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
        {/* Scene Header */}
        <div
          style={{
            opacity: headerOp,
            transform: `scale(${headerScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: 44,
          }}
        >
          <Badge text="The Custom Attire Dilemma" variant="lime" style={{ marginBottom: 16 }} />
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: 60,
              fontWeight: 600,
              color: COLORS.cream,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            The Broken Promise of Custom Attire
          </h1>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 21,
              color: COLORS.creamMuted,
              marginTop: 12,
              marginBottom: 0,
              maxWidth: 820,
            }}
          >
            Bringing an AI render or a Pinterest photo to a tailor rarely produces the intended garment.
          </p>
        </div>

        {/* Side-by-side comparison cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            width: "100%",
            maxWidth: 1280,
          }}
        >
          {/* Left: Digital Illusion */}
          <div
            style={{
              opacity: card1Op,
              transform: `translateY(${card1Y}px)`,
              backgroundColor: "rgba(31, 53, 45, 0.75)",
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: 18,
              padding: "36px 36px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 13,
                color: "#e06c75",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              The Buyer Render
            </div>
            <h2
              style={{
                fontFamily: SERIF,
                fontSize: 34,
                color: COLORS.cream,
                margin: "0 0 16px 0",
              }}
            >
              The Digital Illusion
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                "Flat 2D pixels with no physical drape or weight",
                "Unspecified fabric density and unverified stretch",
                "Imaginary silhouette ignoring client measurements",
                "Zero construction allowances or workshop feasibility",
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: "#e06c75", fontSize: 18 }}>✕</span>
                  <span style={{ fontFamily: SANS, fontSize: 16, color: COLORS.creamMuted }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Atelier Reality */}
          <div
            style={{
              opacity: card2Op,
              transform: `translateY(${card2Y}px)`,
              backgroundColor: "rgba(31, 53, 45, 0.75)",
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: 18,
              padding: "36px 36px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 13,
                color: COLORS.accentBright,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Physical Tailoring
            </div>
            <h2
              style={{
                fontFamily: SERIF,
                fontSize: 34,
                color: COLORS.cream,
                margin: "0 0 16px 0",
              }}
            >
              Workshop Reality
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                "Pattern geometry requiring chest ease and sleeve pitch",
                "Textile behavior: warp, weft, bias drape, and GSM",
                "Exact human anatomical landmarks and posture",
                "Itemized labor, canvas interlinings, and lead times",
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: COLORS.accentBright, fontSize: 18 }}>✓</span>
                  <span style={{ fontFamily: SANS, fontSize: 16, color: COLORS.creamMuted }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Punchline Banner */}
        <div
          style={{
            opacity: punchOp,
            transform: `scale(${punchScale})`,
            marginTop: 44,
            padding: "16px 36px",
            backgroundColor: "rgba(123, 140, 77, 0.16)",
            border: `1.5px solid ${COLORS.accent}`,
            borderRadius: 14,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 28,
              fontStyle: "italic",
              color: COLORS.accentBright,
              letterSpacing: "0.02em",
            }}
          >
            Pixels are not patterns. A screen preview is not a contract.
          </span>
        </div>
      </div>
    </AtelierBackground>
  );
};
