import React from "react";
import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { COLORS, FPS, H, TIMINGS, TOTAL_FRAMES, W } from "./constants";
import { Scene01Hook } from "./scenes/Scene01Hook";
import { Scene02Contrast } from "./scenes/Scene02Contrast";
import { Scene03Pitch } from "./scenes/Scene03Pitch";
import { Scene04BuyerStudio } from "./scenes/Scene04BuyerStudio";
import { Scene05MakerDesk } from "./scenes/Scene05MakerDesk";
import { Scene06RevisionInvalidation } from "./scenes/Scene06RevisionInvalidation";
import { Scene07Architecture } from "./scenes/Scene07Architecture";
import { Scene08Close } from "./scenes/Scene08Close";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideo"
        component={MainVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{}}
      />

      {/* Individual scenes for preview and debugging */}
      <Composition
        id="Scene01Hook"
        component={Scene01Hook}
        durationInFrames={TIMINGS.hook}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene02Contrast"
        component={Scene02Contrast}
        durationInFrames={TIMINGS.contrast}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene03Pitch"
        component={Scene03Pitch}
        durationInFrames={TIMINGS.pitch}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene04BuyerStudio"
        component={Scene04BuyerStudio}
        durationInFrames={TIMINGS.buyerStudio}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene05MakerDesk"
        component={Scene05MakerDesk}
        durationInFrames={TIMINGS.makerDesk}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene06RevisionInvalidation"
        component={Scene06RevisionInvalidation}
        durationInFrames={TIMINGS.revisionInvalidation}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene07Architecture"
        component={Scene07Architecture}
        durationInFrames={TIMINGS.architecture}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene08Close"
        component={Scene08Close}
        durationInFrames={TIMINGS.close}
        fps={FPS}
        width={W}
        height={H}
      />
    </>
  );
};
