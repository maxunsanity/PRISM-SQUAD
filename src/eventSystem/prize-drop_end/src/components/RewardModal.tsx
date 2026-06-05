// import React from 'react';

type Props = {
  visible: boolean;
  modalType: string;
  modalStep: number;
  rewardAmount: number;
  rewardType: string;
  remaining: number;
  cycleCount: number;
  onDismiss: () => void;
};

export function RewardModal({
  visible,
  modalType,
  modalStep,
  rewardAmount,
  rewardType,
  remaining,
  cycleCount,
  onDismiss,
}: Props) {
  if (!visible || !modalType) return null;

  const isJackpot = modalType === 'jackpot';
  const isComplete = modalType === 'complete';

  return (
    <div className="rw-overlay" onClick={isComplete ? undefined : onDismiss}>
      <div
        className={`rw-card ${isJackpot ? 'rw-card--jackpot' : ''} ${isComplete ? 'rw-card--complete' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {modalType === 'milestone' && (
          <>
            <div className="rw-icon">🎲</div>
            <div className="rw-label">마일스톤 {modalStep}단계 달성!</div>
            <div className="rw-amount">+{rewardAmount}</div>
            <div className="rw-unit">{rewardType}</div>
          </>
        )}
        {isJackpot && (
          <>
            <div className="rw-icon">🎰</div>
            <div className="rw-label">JACKPOT</div>
            <div className="rw-amount">+{rewardAmount}</div>
            <div className="rw-unit">번개</div>
          </>
        )}
        {isComplete && (
          <>
            <div className="rw-icon">🎉</div>
            <div className="rw-label rw-label--complete">모든 이벤트를 진행하셨습니다!</div>
            {cycleCount > 1 && (
              <div className="rw-unit">{cycleCount}번째 완주</div>
            )}
          </>
        )}
        <button className="rw-close" onClick={onDismiss}>
          {remaining > 0 ? `확인 (${remaining}개 남음)` : '확인'}
        </button>
      </div>
    </div>
  );
}
