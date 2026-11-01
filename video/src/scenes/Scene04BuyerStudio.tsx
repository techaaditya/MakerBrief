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

export const Scene04BuyerStudio: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Browser frame entrance
  const browserProg = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const browserOp = interpolate(browserProg, [0, 0.35], [0, 1]);
  const browserScale = interpolate(browserProg, [0, 1], [0.94, 1]);

  // Smooth scroll through screenshot:
  // Height of screenshot is 1400. Visible frame is ~820.
  // We scroll from 0 down to ~340 to show the live YouCam try-on result!
  const scrollY = interpolate(
    frame,
    [0, 120, 260, 480, 750],
    [0, 0, 180, 320, 320],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Callout 1: Measurements (frame 40 to 240)
  const c1Prog = spring({
    frame: frame - 35,
    fps,
    config: { damping: 18, stiffness: 150 },
  });
  const c1Fade = interpolate(frame, [220, 250], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const c1Op = interpolate(c1Prog, [0, 0.3], [0, 1]) * c1Fade;
  const c1Scale = interpolate(c1Prog, [0, 1], [0.93, 1]);

  // Callout 2: YouCam API (frame 240 to 520)
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

  // Callout 3: Live Try-on Result (frame 520 to 830)
  const c3Prog = spring({
    frame: frame - 515,
    fps,
    config: { damping: 18, stiffness: 150 },
  });
  const c3Fade = interpolate(frame, [800, 840], [1, 0], {
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
            url="makerbrief.internal/studio"
            roleBadge="Buyer Studio"
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
                src={staticFile("01-buyer-studio-live-youcam.png")}
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
            label="Step 01: Client Profile"
            title="Verified Anatomical Measurements"
            description="Chest 96cm, waist 78cm, sleeve 86cm recorded alongside personal pose photo and reference attire."
            opacity={c1Op}
            scale={c1Scale}
            variant="lime"
            style={{ top: 120, right: 110 }}
          />
        )}

        {/* Floating Callout 2 */}
        {c2Op > 0.01 && (
          <FloatingCallout
            label="Step 02: API Integration"
            title="YouCam Clothes V4 S2S Pipeline"
            description="Durable task dispatch with outer garment category, strict multi-person filtering, and exponential backoff."
            opacity={c2Op}
            scale={c2Scale}
            variant="lime"
            style={{ top: 220, right: 110 }}
          />
        )}

        {/* Floating Callout 3 */}
        {c3Op > 0.01 && (
          <FloatingCallout
            label="Step 03: Live Result"
            title="Authentic Try-On Inference"
            description="High-resolution try-on rendered directly in the brief. Packaged for collaborative review rather than direct cutting."
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
