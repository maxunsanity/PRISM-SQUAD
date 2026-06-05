// import React from 'react';

type Props = {
  sessionLightning: number;
  milestoneStep: number;
  milestoneThresholds: number[];
  lastGain: number;
  showGain: boolean;
  cycleCount: number;
};

export function MilestoneBar({
  sessionLightning,
  milestoneStep,
  milestoneThresholds,
  lastGain,
  showGain,
  cycleCount,
}: Props) {
  const total = milestoneThresholds.length;
  const markPct = (i: number) => ((i + 0.5) / total) * 100;

  let fillPct = 0;
  if (milestoneStep >= total) {
    fillPct = 100;
  } else {
    const prevThreshold = milestoneStep === 0 ? 0 : milestoneThresholds[milestoneStep - 1];
    const nextThreshold = milestoneThresholds[milestoneStep];
    const segProgress = Math.max(0, Math.min(
      (sessionLightning - prevThreshold) / (nextThreshold - prevThreshold),
      1
    ));
    fillPct = (milestoneStep + segProgress) / total * 100;
  }

  return (
    <div className="ms-wrap">
      <div className={`ms-gain ${showGain ? 'ms-gain--on' : ''}`}>
        <span className="ms-gain-arrow">▶</span>
        <span className="ms-gain-num">+{lastGain}</span>
      </div>
      <div className="ms-row">
        <div className="ms-track">
          <div className="ms-fill" style={{ width: `${fillPct}%` }} />
          {milestoneThresholds.map((threshold, i) => {
            const cleared = i < milestoneStep;
            return (
              <div
                key={i}
                className={`ms-mark ${cleared ? 'ms-mark--done' : ''}`}
                style={{ left: `${markPct(i)}%` }}
              >
                <div className="ms-mark-icon">{cleared ? '✓' : '🎲'}</div>
                <div className="ms-mark-num">{threshold}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="ms-count">
        보상 {milestoneStep}/{total}
        {cycleCount > 0 && <span className="ms-cycle-badge">{cycleCount}회</span>}
      </div>
    </div>
  );
}
