import React from "react";
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AtelierBackground } from "../components/AtelierBackground";
import { Badge } from "../components/Badge";
import { COLORS } from "../constants";
import { SERIF, SANS, MONO } from "../fonts";

export const Scene08Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1 (0 to 300): Printable Brief Showcase
  const phase1Prog = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const phase1Enter = interpolate(phase1Prog, [0, 0.35], [0, 1]);
  const phase1Scale = interpolate(phase1Prog, [0, 1], [0.94, 1]);
  const phase1Exit = interpolate(frame, [280, 315], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phase1Op = phase1Enter * phase1Exit;

  // Phase 2 (300 to 630): Final Hackathon CTA
  const phase2Prog = spring({
    frame: frame - 305,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const phase2Op = interpolate(phase2Prog, [0, 0.35], [0, 1]);
  const phase2Scale = interpolate(phase2Prog, [0, 1], [0.93, 1]);

  return (
    <AtelierBackground>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "50px 80px",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Phase 1: Printable Commission Brief */}
        {phase1Op > 0.01 && (
          <div
            style={{
              opacity: phase1Op,
              transform: `scale(${phase1Scale})`,
              display: "flex",
              alignItems: "center",
              gap: 48,
              maxWidth: 1280,
            }}
          >
            {/* Sheet image with shadow */}
            <div
              style={{
                width: 720,
                height: 720,
                borderRadius: 16,
                overflow: "hidden",
                border: `1.5px solid ${COLORS.border}`,
                boxShadow: "0 28px 70px rgba(0,0,0,0.65)",
              }}
            >
              <Img
                src={staticFile("05-printable-brief.png")}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top center",
                }}
              />
            </div>

            {/* Accompanying info */}
            <div style={{ flex: 1 }}>
              <Badge text="From Screen to Workshop" variant="lime" style={{ marginBottom: 16 }} />
              <h2
                style={{
                  fontFamily: SERIF,
                  fontSize: 48,
                  fontWeight: 600,
                  color: COLORS.cream,
                  margin: "0 0 16px 0",
                  lineHeight: 1.15,
                }}
              >
                The Printable Atelier Specification
              </h2>
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 18,
                  color: COLORS.creamMuted,
                  lineHeight: 1.5,
                  marginBottom: 24,
                }}
              >
                Ready for workshop cutting tables, pattern makers, and stitchers. Contains verified measurements, fabric specifications, resolved discrepancies, and signed agreement timestamps.
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 18px",
                  borderRadius: 10,
                  backgroundColor: "rgba(123, 140, 77, 0.15)",
                  border: `1px solid ${COLORS.accent}`,
                  fontFamily: MONO,
                  fontSize: 13,
                  color: COLORS.accentBright,
                }}
              >
                <span>🖨 Printable Atelier Brief</span>
                <span>•</span>
                <span>Cryptographically Locked</span>
              </div>
            </div>
          </div>
        )}

        {/* Phase 2: Final Hackathon CTA Screen */}
        {phase2Op > 0.01 && (
          <div
            style={{
              opacity: phase2Op,
              transform: `scale(${phase2Scale})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              maxWidth: 960,
            }}
          >
            <Badge
              text="YouCam API Skin AI & eCommerce VTO Hackathon"
              variant="lime"
              style={{ marginBottom: 20 }}
            />

            <h1
              style={{
                fontFamily: SERIF,
                fontSize: 72,
                fontWeight: 600,
                color: COLORS.cream,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              MakerBrief
            </h1>

            <p
              style={{
                fontFamily: SANS,
                fontSize: 22,
                color: COLORS.accentBright,
                marginTop: 12,
                marginBottom: 24,
                fontWeight: 500,
              }}
            >
              Transforming Virtual Try-On into the Foundation of Custom Manufacturing
            </p>

            {/* Badges row */}
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                justifyContent: "center",
                marginBottom: 36,
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  padding: "6px 14px",
                  borderRadius: 999,
                  backgroundColor: "rgba(31, 53, 45, 0.9)",
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.cream,
                }}
              >
                YouCam Clothes V4 S2S
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  padding: "6px 14px",
                  borderRadius: 999,
                  backgroundColor: "rgba(31, 53, 45, 0.9)",
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.cream,
                }}
              >
                Zero Runtime Dependencies
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  padding: "6px 14px",
                  borderRadius: 999,
                  backgroundColor: "rgba(31, 53, 45, 0.9)",
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.cream,
                }}
              >
                Automated Revision Invalidation
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  padding: "6px 14px",
                  borderRadius: 999,
                  backgroundColor: "rgba(31, 53, 45, 0.9)",
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.accentBright,
                }}
              >
                16/16 Unit Tests Passing
              </span>
            </div>

            {/* Repository Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 28px",
                borderRadius: 999,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                border: `1.5px solid ${COLORS.accent}`,
              }}
            >
              <span style={{ color: COLORS.accentBright, fontSize: 16 }}>⌘</span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 15,
                  fontWeight: 600,
                  color: COLORS.cream,
                }}
              >
                github.com/techaaditya/MakerBrief
              </span>
            </div>
          </div>
        )}
      </div>
    </AtelierBackground>
  );
};
