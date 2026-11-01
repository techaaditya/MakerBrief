import React from "react";
import { Audio, Series, staticFile } from "remotion";
import { TIMINGS } from "./constants";
import { Scene01Hook } from "./scenes/Scene01Hook";
import { Scene02Contrast } from "./scenes/Scene02Contrast";
import { Scene03Pitch } from "./scenes/Scene03Pitch";
import { Scene04BuyerStudio } from "./scenes/Scene04BuyerStudio";
import { Scene05MakerDesk } from "./scenes/Scene05MakerDesk";
import { Scene06RevisionInvalidation } from "./scenes/Scene06RevisionInvalidation";
import { Scene07Architecture } from "./scenes/Scene07Architecture";
import { Scene08Close } from "./scenes/Scene08Close";

/**
 * MakerBrief Demo Video Timeline (5,910 frames @ 30 fps = 197.00s ~ 3:17)
 *
 *     0 –  690 ( 0:00 – 0:23 ) Hook: The Custom Attire Dilemma
 *   690 – 1170 ( 0:23 – 0:39 ) Contrast: Pixels vs Patterns (The VTO Paradox)
 *  1170 – 1860 ( 0:39 – 1:02 ) Pitch: Introducing MakerBrief
 *  1860 – 2730 ( 1:02 – 1:31 ) Demo 1: Buyer Studio & Real YouCam Clothes V4
 *  2730 – 3600 ( 1:31 – 2:00 ) Demo 2: Maker Desk & Discrepancy Tracking
 *  3600 – 4530 ( 2:00 – 2:31 ) Demo 3: Core Breakthrough (Revision Invalidation)
 *  4530 – 5280 ( 2:31 – 2:56 ) Architecture: Zero-dep Engine & 16/16 Unit Tests
 *  5280 – 5910 ( 2:56 – 3:17 ) Close: Printable Atelier Brief & Hackathon Outro
 */
export const MainVideo: React.FC = () => {
  return (
    <>
      <Audio src={staticFile("master_voiceover.mp3")} />
      <Series>
        <Series.Sequence durationInFrames={TIMINGS.hook}>
          <Scene01Hook />
        </Series.Sequence>

        <Series.Sequence durationInFrames={TIMINGS.contrast}>
          <Scene02Contrast />
        </Series.Sequence>

        <Series.Sequence durationInFrames={TIMINGS.pitch}>
          <Scene03Pitch />
        </Series.Sequence>

        <Series.Sequence durationInFrames={TIMINGS.buyerStudio}>
          <Scene04BuyerStudio />
        </Series.Sequence>

        <Series.Sequence durationInFrames={TIMINGS.makerDesk}>
          <Scene05MakerDesk />
        </Series.Sequence>

        <Series.Sequence durationInFrames={TIMINGS.revisionInvalidation}>
          <Scene06RevisionInvalidation />
        </Series.Sequence>

        <Series.Sequence durationInFrames={TIMINGS.architecture}>
          <Scene07Architecture />
        </Series.Sequence>

        <Series.Sequence durationInFrames={TIMINGS.close}>
          <Scene08Close />
        </Series.Sequence>
      </Series>
    </>
  );
};
