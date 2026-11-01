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

export const Scene05MakerDesk: React.FC = () => {
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

  // Scroll position through maker desk
  const scrollY = interpolate(
    frame,
    [0, 120, 300, 480, 800],
    [40, 120, 240, 200, 200],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Transition from review screen (02-maker-desk) to agreed quote (03-agreed-commission)
  // Crossfade around frame 460
  const crossfadeOp = interpolate(frame, [440, 480], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Callout 1: Dual-Role Auth (frame 30 to 230)
  const c1Prog = spring({
    frame: frame - 25,
    fps,
    config: { damping: 18, stiffness: 150 },
  });
  const c1Fade = interpolate(frame, [210, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const c1Op = interpolate(c1Prog, [0, 0.3], [0, 1]) * c1Fade;
  const c1Scale = interpolate(c1Prog, [0, 1], [0.93, 1]);

  // Callout 2: Discrepancy Tracker (frame 230 to 470)
  const c2Prog = spring({
    frame: frame - 225,
    fps,
    config: { damping: 18, stiffness: 150 },
  });
  const c2Fade = interpolate(frame, [450, 480], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const c2Op = interpolate(c2Prog, [0, 0.3], [0, 1]) * c2Fade;
  const c2Scale = interpolate(c2Prog, [0, 1], [0.93, 1]);

  // Callout 3: Binding Agreement (frame 480 to 820)
  const c3Prog = spring({
    frame: frame - 475,
    fps,
    config: { damping: 18, stiffness: 150 },
  });
  const c3Fade = interpolate(frame, [790, 830], [1, 0], {
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
            url="makerbrief.internal/maker"
            roleBadge="Maker Desk (Tailor)"
            style={{ width: "100%", height: "100%" }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 1400,
                transform: `translateY(${-scrollY}px)`,
              }}
            >
              {/* Screen 1: Maker Desk Review */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 1 - crossfadeOp,
                }}
              >
                <Img
                  src={staticFile("02-maker-desk.png")}
                  style={{
                    width: 1280,
                    height: 1400,
                    display: "block",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* Screen 2: Agreed Commission */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: crossfadeOp,
                }}
              >
                <Img
                  src={staticFile("03-agreed-commission.png")}
                  style={{
                    width: 1280,
                    height: 1400,
                    display: "block",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          </BrowserFrame>
        </div>

        {/* Floating Callouts */}
        {c1Op > 0.01 && (
          <FloatingCallout
            label="Maker Workflow"
            title="Dual-Role Authenticated Access"
            description="Dedicated tailor workspace with session isolation and role authorization."
            opacity={c1Op}
            scale={c1Scale}
            variant="lime"
            style={{ top: 110, right: 110 }}
          />
        )}

        {c2Op > 0.01 && (
          <FloatingCallout
            label="Human Craftsmanship"
            title="Maker Discrepancy Tracker"
            description="Tailor audits the VTO preview, flagging pocket placement and chest ease requirements before quoting."
            opacity={c2Op}
            scale={c2Scale}
            variant="amber"
            style={{ top: 220, right: 110 }}
          />
        )}

        {c3Op > 0.01 && (
          <FloatingCallout
            label="Milestone Locked"
            title="Exact-Version Agreement"
            description="Quote #1 of $1,450 locked with 4-week timeline. Buyer confirms agreement with cryptographic state lock."
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
