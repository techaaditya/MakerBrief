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
import { BrowserFrame } from "../components/BrowserFrame";
import { FloatingCallout } from "../components/FloatingCallout";
import { COLORS } from "../constants";

export const Scene06RevisionInvalidation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Browser entrance
  const browserProg = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const browserOp = interpolate(browserProg, [0, 0.35], [0, 1]);
  const browserScale = interpolate(browserProg, [0, 1], [0.94, 1]);

  // Gentle scroll to center the amber invalidation alert
  const scrollY = interpolate(
    frame,
    [0, 100, 300, 600, 880],
    [80, 140, 220, 260, 260],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Callout 1: The Core Breakthrough (frame 30 to 240)
  const c1Prog = spring({
    frame: frame - 25,
    fps,
    config: { damping: 18, stiffness: 150 },
  });
  const c1Fade = interpolate(frame, [220, 250], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const c1Op = interpolate(c1Prog, [0, 0.3], [0, 1]) * c1Fade;
  const c1Scale = interpolate(c1Prog, [0, 1], [0.93, 1]);

  // Callout 2: Amber Alert (frame 240 to 520)
  const c2Prog = spring({
    frame: frame - 235,
    fps,
    config: { damping: 18, stiffness: 150 },
  });
  const c2Fade = interpolate(frame, [500, 530], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const c2Op = interpolate(c2Prog, [0, 0.3], [0, 1]) * c2Fade;
  const c2Scale = interpolate(c2Prog, [0, 1], [0.93, 1]);

  // Callout 3: Re-Quoting (frame 520 to 880)
  const c3Prog = spring({
    frame: frame - 515,
    fps,
    config: { damping: 18, stiffness: 150 },
  });
  const c3Fade = interpolate(frame, [850, 890], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const c3Op = interpolate(c3Prog, [0, 0.3], [0, 1]) * c3Fade;
  const c3Scale = interpolate(c3Prog, [0, 1], [0.93, 1]);

  return (
    <AtelierBackground>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "40px 80px",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Browser Mockup */}
        <div
          style={{
            opacity: browserOp,
            transform: `scale(${browserScale})`,
            width: 1280,
            height: 840,
          }}
        >
          <BrowserFrame
            url="makerbrief.internal/brief#revision"
            roleBadge="Revision State"
            style={{ width: "100%", height: "100%" }}
          >
            <div
              style={{
                width: "100%",
                height: 1400,
                transform: `translateY(${-scrollY}px)`,
                transition: "transform 0.1s linear",
              }}
            >
              <Img
                src={staticFile("04-revision-invalidation.png")}
                style={{
                  width: 1280,
                  height: 1400,
                  display: "block",
                  objectFit: "cover",
                }}
              />
            </div>
          </BrowserFrame>
        </div>

        {/* Floating Callout 1 */}
        {c1Op > 0.01 && (
          <FloatingCallout
            label="The Core Innovation"
            title="The Specification Change"
            description="Buyer switches material from silk organza to 380gsm boiled wool. Fabric drape and pattern ease altered."
            opacity={c1Op}
            scale={c1Scale}
            variant="amber"
            style={{ top: 110, right: 110 }}
          />
        )}

        {/* Floating Callout 2 */}
        {c2Op > 0.01 && (
          <FloatingCallout
            label="Automatic Protection"
            title="Quote Outdated Warning"
            description="MakerBrief prevents surprise bills by instantly revoking Quote #1. Explains exactly why the quote was invalidated."
            opacity={c2Op}
            scale={c2Scale}
            variant="amber"
            style={{ top: 220, right: 110 }}
          />
        )}

        {/* Floating Callout 3 */}
        {c3Op > 0.01 && (
          <FloatingCallout
            label="Clean Re-Agreement"
            title="Updated Quote #2 Issued"
            description="Tailor reviews the revision, issues Quote #2 for $1,620, and both parties re-confirm without lingering disputes."
            opacity={c3Op}
            scale={c3Scale}
            variant="lime"
            style={{ bottom: 120, right: 110 }}
          />
        )}
      </div>
    </AtelierBackground>
  );
};
